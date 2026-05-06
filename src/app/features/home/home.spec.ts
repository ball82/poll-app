import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { SurveyService } from '../../core/services/survey.service';

import { Home } from './home';

const surveyServiceStub = {
  endingSoonSurveys: signal([]),
  activeSurveys: signal([]),
  pastSurveys: signal([]),
};

async function createComponent(): Promise<ComponentFixture<Home>> {
  await TestBed.configureTestingModule({
    imports: [Home],
    providers: [
      provideRouter([]),
      { provide: SurveyService, useValue: surveyServiceStub },
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(Home);
  await fixture.whenStable();
  return fixture;
}

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    fixture = await createComponent();
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
