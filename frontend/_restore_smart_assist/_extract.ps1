# Extract Smart Assist final sources from agent transcript (PowerShell)
$ErrorActionPreference = 'Stop'
$Transcript = 'C:\Users\Admin\.cursor\projects\c-Users-Admin-Documents-FormFlow\agent-transcripts\e4eb6e37-2161-4aed-868c-8fff5ff5591a\e4eb6e37-2161-4aed-868c-8fff5ff5591a.jsonl'
$OutDir = 'C:\Users\Admin\Documents\FormFlow\frontend\_restore_smart_assist'
$Recovered = Join-Path $OutDir 'recovered'
$Cutoff = 542
$Log = Join-Path $OutDir '_ps_extract_log.txt'

function Write-Log([string]$msg) {
  Add-Content -Path $Log -Value $msg
  Write-Output $msg
}

Set-Content -Path $Log -Value "START $(Get-Date -Format o)"

$interesting = [regex]'smart-assist|environments[/\\]|proxy\.conf|AIExtraction|gemini|form-host|dynamic-form-renderer|app\.config\.ts|angular\.json|package\.json'
$exclude = [regex]'customer[-_]?profile'

function Normalize-Path([string]$p) {
  if (-not $p) { return $null }
  $m = [regex]::Match($p, 'FormFlow[/\\]frontend[/\\](.+)$', 'IgnoreCase')
  if (-not $m.Success) { return $null }
  $rel = $m.Groups[1].Value -replace '\\','/'
  if ($exclude.IsMatch($rel)) { return $null }
  if (-not $interesting.IsMatch($rel)) { return $null }
  if ($rel.StartsWith('_restore_smart_assist')) { return $null }
  if ($rel.Contains('node_modules')) { return $null }
  return $rel
}

function Walk-Tools($obj, [System.Collections.Generic.List[object]]$acc) {
  if ($null -eq $obj) { return }
  if ($obj -is [System.Collections.IList] -and -not ($obj -is [string])) {
    foreach ($item in $obj) { Walk-Tools $item $acc }
    return
  }
  if ($obj -is [System.Collections.IDictionary] -or ($obj.PSObject -and $obj.PSObject.Properties['type'])) {
    $type = $null; $name = $null
    try { $type = $obj.type } catch {}
    try { $name = $obj.name } catch {}
    if ($type -eq 'tool_use' -and ($name -in @('Write','StrReplace','Delete'))) {
      $acc.Add($obj)
    }
    foreach ($prop in $obj.PSObject.Properties) {
      if ($prop.Name -in @('type','name','input','id')) { continue }
      Walk-Tools $prop.Value $acc
    }
    if ($obj.input) { } # already handled via properties
    # Explicitly walk known fields
    if ($obj.content) { Walk-Tools $obj.content $acc }
    if ($obj.message) { Walk-Tools $obj.message $acc }
  }
}

# Use ConvertFrom-Json carefully - large files
$files = @{}
$history = @{}
$writeCounts = @{}
$strFail = New-Object System.Collections.Generic.List[string]
$lineNo = 0

Write-Log "Reading transcript..."
$allLines = [System.IO.File]::ReadAllLines($Transcript)
Write-Log "Total lines: $($allLines.Length)"

foreach ($line in $allLines) {
  $lineNo++
  if ($lineNo -ge $Cutoff) { break }
  if ([string]::IsNullOrWhiteSpace($line)) { continue }

  try {
    $rec = $line | ConvertFrom-Json -Depth 100
  } catch {
    continue
  }

  $tools = New-Object System.Collections.Generic.List[object]
  if ($rec.message) { Walk-Tools $rec.message $tools }
  if ($rec.content) { Walk-Tools $rec.content $tools }
  # Also direct scan of tool_use in message.content array (more reliable)
  $contents = @()
  try { $contents = @($rec.message.content) } catch {}
  foreach ($block in $contents) {
    if ($block.type -eq 'tool_use' -and $block.name -in @('Write','StrReplace','Delete')) {
      $already = $false
      foreach ($t in $tools) {
        if ($t.path -eq $block.path -and $t.name -eq $block.name) { $already = $true; break }
      }
      # Always process from message.content
      $inp = $block.input
      if (-not $inp) { continue }
      $rel = Normalize-Path $inp.path
      if (-not $rel) { continue }
      if (-not $history.ContainsKey($rel)) { $history[$rel] = New-Object System.Collections.Generic.List[string] }

      if ($block.name -eq 'Write') {
        if ($null -eq $inp.contents) { continue }
        $files[$rel] = [string]$inp.contents
        if (-not $writeCounts.ContainsKey($rel)) { $writeCounts[$rel] = 0 }
        $writeCounts[$rel]++
        $history[$rel].Add("L$lineNo Write len=$($inp.contents.Length)")
      }
      elseif ($block.name -eq 'StrReplace') {
        if (-not $files.ContainsKey($rel)) {
          $strFail.Add("L$lineNo: no base for $rel")
          $history[$rel].Add("L$lineNo StrReplace_FAIL_NO_BASE")
          continue
        }
        $old = [string]$inp.old_string
        $new = [string]$inp.new_string
        $content = $files[$rel]
        if (-not $content.Contains($old)) {
          $strFail.Add("L$lineNo: old_string not found in $rel")
          $history[$rel].Add("L$lineNo StrReplace_FAIL")
          continue
        }
        if ($inp.replace_all) {
          $files[$rel] = $content.Replace($old, $new)
        } else {
          $idx = $content.IndexOf($old)
          $files[$rel] = $content.Substring(0, $idx) + $new + $content.Substring($idx + $old.Length)
        }
        $history[$rel].Add("L$lineNo StrReplace_OK")
      }
      elseif ($block.name -eq 'Delete') {
        $files.Remove($rel)
        $history[$rel].Add("L$lineNo Delete")
      }
    }
  }
}

Write-Log "Files in memory: $($files.Count), StrReplace fails: $($strFail.Count)"

New-Item -ItemType Directory -Force -Path $Recovered | Out-Null

function Redact([string]$c) {
  $c = [regex]::Replace($c, "(geminiApiKey\s*:\s*['""])([^'""]+)(['""])", '${1}YOUR_API_KEY_HERE${3}')
  $c = [regex]::Replace($c, "(apiKey\s*:\s*['""])(AIza[^'""]+)(['""])", '${1}YOUR_API_KEY_HERE${3}')
  $c = [regex]::Replace($c, "(['""])(AIza[0-9A-Za-z\-_]{20,})(['""])", '${1}YOUR_API_KEY_HERE${3}')
  return $c
}

$inv = New-Object System.Collections.Generic.List[string]
foreach ($rel in ($files.Keys | Sort-Object)) {
  $content = Redact $files[$rel]
  $outPath = Join-Path $Recovered ($rel -replace '/','\')
  $dir = Split-Path $outPath -Parent
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  [System.IO.File]::WriteAllText($outPath, $content)
  $bytes = [System.Text.Encoding]::UTF8.GetByteCount($content)
  $writes = if ($writeCounts.ContainsKey($rel)) { $writeCounts[$rel] } else { 0 }
  $last = if ($history.ContainsKey($rel) -and $history[$rel].Count -gt 0) { $history[$rel][$history[$rel].Count-1] } else { '?' }
  $inv.Add("- `$rel` — $bytes bytes, $writes Write(s), last=$last")
  Write-Log "WROTE $rel ($bytes)"
}

$md = @"
# Smart Assist Recovery Inventory

Cutoff: line $Cutoff (before Customer Profile cleanup).
Files recovered: $($files.Count)
StrReplace failures: $($strFail.Count)

## Recovered files

$($inv -join "`n")

## StrReplace failures

$($strFail -join "`n")
"@

[System.IO.File]::WriteAllText((Join-Path $OutDir 'INVENTORY.md'), $md)
Write-Log "DONE files=$($files.Count)"
