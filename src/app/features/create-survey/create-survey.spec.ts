import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SurveyService } from '../../core/services/survey.service';

import { CreateSurvey } from './create-survey';

const surveyServiceStub = {
  addSurvey: async () => null,
};

async function createComponent(): Promise<ComponentFixture<CreateSurvey>> {
  await TestBed.configureTestingModule({
    imports: [CreateSurvey],
    providers: [
      provideRouter([]),
      { provide: SurveyService, useValue: surveyServiceStub },
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(CreateSurvey);
  await fixture.whenStable();
  return fixture;
}

describe('CreateSurvey', () => {
  let component: CreateSurvey;
  let fixture: ComponentFixture<CreateSurvey>;

  beforeEach(async () => {
    fixture = await createComponent();
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
