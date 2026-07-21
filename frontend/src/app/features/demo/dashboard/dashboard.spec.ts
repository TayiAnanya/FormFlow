import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, RouterLink } from '@angular/router';
import { By } from '@angular/platform-browser';

import { AUTH_STORAGE } from '../../auth/services/auth-storage';
import { AuthenticationService } from '../../auth/services/authentication.service';
import { InMemoryAuthStorage } from '../../auth/testing/in-memory-auth.storage';
import { ProfileService } from '../../workspace/services/profile.service';
import { WORKSPACE_STORAGE } from '../../workspace/services/workspace-storage';
import { InMemoryWorkspaceStorage } from '../../workspace/testing/in-memory-workspace.storage';
import { SCENARIO_CATALOG } from '../data/scenario-catalog';

import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        AuthenticationService,
        ProfileService,
        { provide: AUTH_STORAGE, useClass: InMemoryAuthStorage },
        { provide: WORKSPACE_STORAGE, useClass: InMemoryWorkspaceStorage },
      ],
    }).compileComponents();

    const auth = TestBed.inject(AuthenticationService);
    auth.register({
      fullName: 'Ananya Tayi',
      email: 'ananya@example.com',
      mobileNumber: '9876543210',
      password: 'secret1',
      confirmPassword: 'secret1',
    });
    TestBed.inject(ProfileService).syncFromAuth();

    fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
  });

  it('creates successfully', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('displays all scenario cards from the catalog', () => {
    const html = fixture.nativeElement as HTMLElement;
    const cards = html.querySelectorAll('.scenario-card');

    expect(cards.length).toBe(SCENARIO_CATALOG.length);

    for (const scenario of SCENARIO_CATALOG) {
      expect(html.textContent).toContain(scenario.title);
      expect(html.textContent).toContain(scenario.description);
    }
  });

  it('shows scenario metadata such as features and stats', () => {
    const html = fixture.nativeElement as HTMLElement;

    expect(html.textContent).toContain('Available Forms');
    expect(html.textContent).toContain(String(SCENARIO_CATALOG.length));
    expect(html.textContent).toContain('Conditional Sections');
    expect(html.textContent).toContain('Dynamic Renderer');
  });

  it('navigates correctly via routerLink on each scenario card', () => {
    const openButtons = fixture.nativeElement.querySelectorAll('.scenario-card p-button');
    const advisorButton = fixture.nativeElement.querySelector('.advisor-feature-card p-button');

    expect(openButtons.length).toBe(SCENARIO_CATALOG.length);
    expect(advisorButton?.textContent?.trim()).toContain('Open Advisor');

    openButtons.forEach((button: HTMLElement) => {
      expect(button.textContent?.trim()).toContain('Open Form');
    });

    const links = fixture.debugElement.queryAll(By.directive(RouterLink));
    expect(links.length).toBeGreaterThan(SCENARIO_CATALOG.length);
  });

  it('displays the Smart Banking Advisor feature card', () => {
    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('Smart Banking Advisor');
    expect(html.querySelector('.advisor-feature-card')).toBeTruthy();
  });

  it('includes My Workspace as a section on the same dashboard', () => {
    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('.my-workspace')).toBeTruthy();
    expect(html.textContent).toContain('My Workspace');
    expect(html.textContent).toContain('My Applications');
    expect(html.textContent).toContain('Continue Drafts');
  });
});
