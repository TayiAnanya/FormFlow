import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';

import { AuthenticationService } from '../../services/authentication.service';
import { ProfileService } from '../../../workspace/services/profile.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [RouterLink, Button],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage {
  private readonly auth = inject(AuthenticationService);
  private readonly profileService = inject(ProfileService);

  protected readonly user = this.auth.currentUser;
  protected readonly workspaceProfile = this.profileService.profile;

  constructor() {
    this.profileService.syncFromAuth();
  }

  protected readonly registrationDate = computed(() => {
    const iso = this.user()?.registeredAt;
    if (!iso) {
      return '—';
    }
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return iso;
    }
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  });
}
