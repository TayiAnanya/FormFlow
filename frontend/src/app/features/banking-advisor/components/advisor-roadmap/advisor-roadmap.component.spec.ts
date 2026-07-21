import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvisorRoadmapComponent } from './advisor-roadmap.component';

describe('AdvisorRoadmapComponent', () => {
  let fixture: ComponentFixture<AdvisorRoadmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvisorRoadmapComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdvisorRoadmapComponent);
    fixture.componentRef.setInput('steps', [
      { period: 'Months 1-3', goal: 'Build Emergency Fund' },
      { period: 'Months 4-6', goal: 'Improve Credit Score' },
    ]);
    fixture.detectChanges();
  });

  it('Roadmap rendering — shows periods and goals', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Months 1-3');
    expect(text).toContain('Build Emergency Fund');
    expect(text).toContain('Improve Credit Score');
  });
});
