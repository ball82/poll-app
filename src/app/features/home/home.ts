import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SurveyService } from '../../core/services/survey.service';
import { SurveyCard } from '../../shared/components/survey-card/survey-card';

@Component({
  selector: 'app-home',
  imports: [RouterLink, SurveyCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private surveyService = inject(SurveyService);

  endingSoon = this.surveyService.endingSoonSurveys;
}