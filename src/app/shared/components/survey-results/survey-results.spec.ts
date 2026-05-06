import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Survey } from '../../../core/models/survey.model';

import { SurveyResults } from './survey-results';

const survey: Survey = {
  id: 'survey-1',
  title: 'Test survey',
  category: 'Team activities',
  createdAt: new Date().toISOString(),
  status: 'published',
  questions: [],
};

async function createComponent(): Promise<ComponentFixture<SurveyResults>> {
  await TestBed.configureTestingModule({
    imports: [SurveyResults],
  }).compileComponents();
  const fixture = TestBed.createComponent(SurveyResults);
  fixture.componentRef.setInput('survey', survey);
  await fixture.whenStable();
  return fixture;
}

describe('SurveyResults', () => {
  let component: SurveyResults;
  let fixture: ComponentFixture<SurveyResults>;

  beforeEach(async () => {
    fixture = await createComponent();
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
