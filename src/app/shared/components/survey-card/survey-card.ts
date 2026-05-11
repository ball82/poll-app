import { Component, input, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Survey } from '../../../core/models/survey.model';
import { SurveyService } from '../../../core/services/survey.service';

/**
 * Wiederverwendbare Karten-Komponente zur Darstellung einer Umfrage.
 *
 * @remarks
 * Unterstützt zwei Varianten:
 * - `'highlight'` — grosse Karte für die "Ending Soon"-Sektion
 * - `'list'` — kompakte Karte für die Übersichtsliste
 */
@Component({
  selector: 'app-survey-card',
  imports: [RouterLink],
  templateUrl: './survey-card.html',
  styleUrl: './survey-card.scss',
})
export class SurveyCard {
  /** Die anzuzeigende Umfrage. */
  readonly survey = input.required<Survey>();
  /** Darstellungsvariante der Karte. Standard: `'highlight'`. */
  readonly variant = input<'highlight' | 'list'>('highlight');

  private surveyService = inject(SurveyService);

  /** Lesbares Label für die verbleibende Zeit (z. B. `"Ends in 3 Days"`). */
  readonly endsInLabel = computed(() => {
    const days = this.surveyService.daysRemaining(this.survey());
    if (days === null) return null;
    if (days === 0) return 'Ends today';
    if (days === 1) return 'Ends in 1 Day';
    return `Ends in ${days} Days`;
  });
}
