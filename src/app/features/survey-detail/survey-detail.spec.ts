import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { SurveyService } from '../../core/services/survey.service';

import { SurveyDetail } from './survey-detail';

const surveyServiceStub = {
  surveys: signal([]),
  loadSurveys: () => undefined,
  getSurveyById: () => undefined,
  isExpired: () => false,
  hasVoted: () => false,
  daysRemaining: () => null,
  vote: async () => undefined,
};

const routeStub = {
  snapshot: { paramMap: convertToParamMap({ id: 'missing-survey' }) },
};

async function createComponent(): Promise<ComponentFixture<SurveyDetail>> {
  await TestBed.configureTestingModule({
    imports: [SurveyDetail],
    providers: [
      provideRouter([]),
      { provide: ActivatedRoute, useValue: routeStub },
      { provide: SurveyService, useValue: surveyServiceStub },
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(SurveyDetail);
  await fixture.whenStable();
  return fixture;
}

describe('SurveyDetail', () => {
  let component: SurveyDetail;
  let fixture: ComponentFixture<SurveyDetail>;

  beforeEach(async () => {
    fixture = await createComponent();
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
