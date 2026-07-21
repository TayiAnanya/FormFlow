import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

import { firstNameFromFullName } from '../../features/auth/models/auth.model';
import { AuthenticationService } from '../../features/auth/services/authentication.service';

@Component({
  selector: 'app-portal-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Button, Menu],
  templateUrl: './portal-shell.html',
  styleUrl: './portal-shell.css',
})
export class PortalShell {
  private readonly auth = inject(AuthenticationService);
  private readonly router = inject(Router);

  protected readonly user = this.auth.currentUser;

  protected readonly welcomeName = computed(() =>
    firstNameFromFullName(this.user()?.fullName ?? 'Customer'),
  );

  protected readonly avatarInitials = computed(() => {
    const name = this.user()?.fullName?.trim() || 'Customer';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  });

  protected readonly todayLabel = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  protected readonly accountMenuItems: MenuItem[] = [
    {
      label: 'View Profile',
      icon: 'pi pi-user',
      command: () => {
        void this.router.navigate(['/profile']);
      },
    },
    {
      separator: true,
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.logout(),
    },
  ];

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
