import { Component, input, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Survey } from '../../../core/models/survey.model';
import { SurveyService } from '../../../core/services/survey.service';

@Component({
  selector: 'app-survey-card',
  imports: [RouterLink],
  templateUrl: './survey-card.html',
  styleUrl: './survey-card.scss',
})
export class SurveyCard {
  // Input: Die Karte erwartet eine Survey von außen
  survey = input.required<Survey>();

  // Variante: 'highlight' (große Karte) oder 'list' (kleine Zeile)
  variant = input<'highlight' | 'list'>('highlight');

  private surveyService = inject(SurveyService);

  // Berechnet "Ends in X Days"
  endsInLabel = computed(() => {
    const days = this.surveyService.daysRemaining(this.survey());
    if (days === null) return null;
    if (days === 0) return 'Ends today';
    if (days === 1) return 'Ends in 1 Day';
    return `Ends in ${days} Days`;
  });
}