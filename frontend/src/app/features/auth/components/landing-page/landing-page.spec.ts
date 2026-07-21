import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, RouterLink } from '@angular/router';

import { LANDING_AI_FEATURES, LANDING_JOURNEY_STEPS, LANDING_STATS } from '../../data/landing.content';
import { PORTAL_MODULE_CATALOG } from '../../../demo/data/portal-module.catalog';
import { SCENARIO_CATALOG } from '../../../demo/data/scenario-catalog';
import { LandingPage } from './landing-page';

describe('LandingPage', () => {
  let fixture: ComponentFixture<LandingPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPage);
    fixture.detectChanges();
  });

  it('renders the redesigned landing information architecture', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Open accounts, borrow, and get AI guidance');
    expect(text).toContain('Banking services');
    expect(text).toContain('AI features');
    expect(text).toContain('How it works');
    expect(text).toContain('Why choose FormFlow');
    expect(text).toContain('Platform snapshot');
  });

  it('renders a premium glass leaf hero illustration', () => {
    const art = fixture.debugElement.query(By.css('.lp-hero-art'));
    const leaf = fixture.debugElement.query(By.css('.lp-glass-leaf-svg'));
    expect(art).toBeTruthy();
    expect(leaf).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.lp-preview'))).toBeNull();
  });

  it('renders banking service cards from the portal module catalog', () => {
    const cards = fixture.debugElement.queryAll(By.css('.lp-service-card'));
    expect(cards.length).toBe(PORTAL_MODULE_CATALOG.length);
    expect(PORTAL_MODULE_CATALOG.length).toBe(SCENARIO_CATALOG.length + 1);

    for (const module of PORTAL_MODULE_CATALOG) {
      expect(fixture.nativeElement.textContent).toContain(module.title);
    }
  });

  it('links each banking service card to an existing portal route', () => {
    const moduleLinks = fixture.debugElement
      .queryAll(By.css('.lp-service-card'))
      .map((el) => el.injector.get(RouterLink));

    expect(moduleLinks.length).toBe(PORTAL_MODULE_CATALOG.length);

    for (let i = 0; i < moduleLinks.length; i++) {
      expect(moduleLinks[i].href).toBe(
        PORTAL_MODULE_CATALOG[i].routerLink.join('/').replace('//', '/'),
      );
    }
  });

  it('renders AI feature and journey content from configuration', () => {
    expect(fixture.debugElement.queryAll(By.css('.lp-ai-card')).length).toBe(
      LANDING_AI_FEATURES.length,
    );
    expect(fixture.debugElement.queryAll(By.css('.lp-journey-step')).length).toBe(
      LANDING_JOURNEY_STEPS.length,
    );
    expect(fixture.debugElement.queryAll(By.css('.lp-stat')).length).toBe(LANDING_STATS.length);
  });
});
