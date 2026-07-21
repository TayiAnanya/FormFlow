import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';

import { FormFlowPreset } from './core/theme/formflow-preset';
import { routes } from './app.routes';
import { AUTH_STORAGE } from './features/auth/services/auth-storage';
import { LocalStorageAuthStorage } from './features/auth/services/local-storage-auth.storage';
import { WORKSPACE_STORAGE } from './features/workspace/services/workspace-storage';
import { LocalStorageWorkspaceStorage } from './features/workspace/services/local-storage-workspace.storage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    provideAnimationsAsync(),
    provideRouter(routes),
    { provide: AUTH_STORAGE, useClass: LocalStorageAuthStorage },
    { provide: WORKSPACE_STORAGE, useClass: LocalStorageWorkspaceStorage },
    providePrimeNG({
      theme: {
        preset: FormFlowPreset,
        options: {
          darkModeSelector: false,
        },
      },
    }),
  ],
};
