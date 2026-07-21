# Extract original TypeScript/HTML/CSS from Angular test source maps
$ErrorActionPreference = 'Stop'
$MapDir = 'C:\Users\Admin\Documents\FormFlow\frontend\dist\test-out\3f4d6a58-33e4-44ac-80c3-d15e153e7e68'
$OutRoot = 'C:\Users\Admin\Documents\FormFlow\frontend\_restore_smart_assist\recovered'
$Log = 'C:\Users\Admin\Documents\FormFlow\frontend\_restore_smart_assist\_sourcemap_log.txt'
$interesting = [regex]'smart-assist|environments[/\\]|proxy\.conf|form-host|dynamic-form-renderer|app\.config|document-extraction|ai-extraction|gemini|document-pii|document-text|document-field|field-mapping|form-patch|pdf-test'
$exclude = [regex]'customer[-_]?profile|node_modules|primeng|angular:jit'

$written = @{}
$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("START $(Get-Date -Format o)")

Get-ChildItem -Path $MapDir -Filter '*.map' -File | ForEach-Object {
  $jsonText = [System.IO.File]::ReadAllText($_.FullName)
  try {
    $map = $jsonText | ConvertFrom-Json -Depth 20
  } catch {
    $lines.Add("FAIL parse $($_.Name): $($_.Exception.Message)")
    return
  }
  if (-not $map.sources -or -not $map.sourcesContent) { return }
  for ($i = 0; $i -lt $map.sources.Count; $i++) {
    $src = [string]$map.sources[$i]
    $content = $map.sourcesContent[$i]
    if ($null -eq $content) { continue }
    # normalize
    $srcNorm = $src -replace '\\','/'
    $srcNorm = $srcNorm -replace '^angular:jit:template:','' -replace '^angular:jit:style:',''
    if ($exclude.IsMatch($srcNorm)) { continue }
    if (-not $interesting.IsMatch($srcNorm)) { continue }
    # strip leading src/
    $rel = $srcNorm
    if ($rel.StartsWith('src/')) { $rel = $rel.Substring(4) }
    # Prefer longer/later content if collision: keep longest
    $contentStr = [string]$content
    if ($written.ContainsKey($rel)) {
      if ($written[$rel].Length -ge $contentStr.Length) {
        $lines.Add("SKIP shorter $rel from $($_.Name)")
        continue
      }
    }
    $outPath = Join-Path $OutRoot ($rel -replace '/','\')
    # map path under frontend: if starts with app/ or environments/, keep; else if features, etc.
    # sources are like src/app/... so after strip we have app/...
    # User wants relative to frontend/ — so recover as src/app/...
    if (-not $rel.StartsWith('app/') -and -not $rel.StartsWith('environments/') -and $srcNorm.StartsWith('src/')) {
      $rel = 'src/' + $rel
    } elseif ($srcNorm.StartsWith('src/')) {
      $rel = $srcNorm  # full src/...
    }
    $outPath = Join-Path $OutRoot ($rel -replace '/','\')
    $dir = Split-Path $outPath -Parent
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    # redact keys
    $safe = [regex]::Replace($contentStr, "(geminiApiKey\s*:\s*['""])([^'""]+)(['""])", '${1}YOUR_API_KEY_HERE${3}')
    $safe = [regex]::Replace($safe, "(['""])(AIza[0-9A-Za-z\-_]{20,})(['""])", '${1}YOUR_API_KEY_HERE${3}')
    [System.IO.File]::WriteAllText($outPath, $safe)
    $written[$rel] = $safe
    $lines.Add("WROTE $rel ($($safe.Length) chars) from $($_.Name)")
  }
}

$lines.Add("DONE count=$($written.Count)")
[System.IO.File]::WriteAllLines($Log, $lines)

# inventory
$inv = @('# Smart Assist Recovery from Source Maps', '', "Files: $($written.Count)", '')
foreach ($k in ($written.Keys | Sort-Object)) {
  $inv += "- ``$k`` — $($written[$k].Length) chars"
}
[System.IO.File]::WriteAllLines((Join-Path (Split-Path $OutRoot -Parent) 'INVENTORY_SOURCEMAPS.md'), $inv)
Write-Output "Extracted $($written.Count) files. Log: $Log"
