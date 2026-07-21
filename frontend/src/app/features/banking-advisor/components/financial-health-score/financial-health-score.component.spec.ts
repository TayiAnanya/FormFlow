import { ComponentFixture, TestBed } from '@angular/core/testing';

import { healthScoreTone } from '../../models/banking-advisor.model';
import { FinancialHealthScoreComponent } from './financial-health-score.component';

describe('FinancialHealthScoreComponent', () => {
  let fixture: ComponentFixture<FinancialHealthScoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialHealthScoreComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FinancialHealthScoreComponent);
  });

  it('Financial score rendering — green for 80+', () => {
    fixture.componentRef.setInput('score', 82);
    fixture.detectChanges();
    expect(healthScoreTone(82)).toBe('green');
    const ring = fixture.nativeElement.querySelector('.health-score') as HTMLElement;
    expect(ring.getAttribute('data-tone')).toBe('green');
    expect(fixture.nativeElement.textContent).toContain('82');
  });

  it('Financial score rendering — amber for 60-79 and red below 60', () => {
    expect(healthScoreTone(65)).toBe('amber');
    expect(healthScoreTone(40)).toBe('red');
  });
});
