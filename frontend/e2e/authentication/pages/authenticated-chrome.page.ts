import type { Page } from '@playwright/test';

import { PortalShellPage } from '../../shared/pages/portal-shell.page';

/**
 * Sprint 01 logout-only chrome — now delegates to {@link PortalShellPage}.
 * Prefer `PortalShellPage` for new Sprint 02+ navigation work.
 */
export class AuthenticatedChromePage extends PortalShellPage {
  constructor(page: Page) {
    super(page);
  }
}
