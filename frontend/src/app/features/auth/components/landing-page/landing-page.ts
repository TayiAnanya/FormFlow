import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PORTAL_MODULE_CATALOG } from '../../../demo/data/portal-module.catalog';
import {
  LANDING_ADVANTAGES,
  LANDING_AI_FEATURES,
  LANDING_FOOTER_LINKS,
  LANDING_JOURNEY_STEPS,
  LANDING_STATS,
} from '../../data/landing.content';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  protected readonly bankingServices = PORTAL_MODULE_CATALOG;
  protected readonly aiFeatures = LANDING_AI_FEATURES;
  protected readonly journeySteps = LANDING_JOURNEY_STEPS;
  protected readonly advantages = LANDING_ADVANTAGES;
  protected readonly stats = LANDING_STATS;
  protected readonly footerLinks = LANDING_FOOTER_LINKS;

  protected readonly copyrightYear = new Date().getFullYear();
}
