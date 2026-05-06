import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Survey } from '../../../core/models/survey.model';
import { SurveyService } from '../../../core/services/survey.service';

import { SurveyCard } from './survey-card';

const survey: Survey = {
  id: 'survey-1',
  title: 'Test survey',
  category: 'Team activities',
  createdAt: new Date().toISOString(),
  status: 'published',
  questions: [],
};

const surveyServiceStub = {
  daysRemaining: () => null,
};

async function createComponent(): Promise<ComponentFixture<SurveyCard>> {
  await TestBed.configureTestingModule({
    imports: [SurveyCard],
    providers: [
      provideRouter([]),
      { provide: SurveyService, useValue: surveyServiceStub },
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(SurveyCard);
  fixture.componentRef.setInput('survey', survey);
  await fixture.whenStable();
  return fixture;
}

describe('SurveyCard', () => {
  let component: SurveyCard;
  let fixture: ComponentFixture<SurveyCard>;

  beforeEach(async () => {
    fixture = await createComponent();
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
