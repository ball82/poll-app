import { Component, input } from '@angular/core';
import { Survey } from '../../../core/models/survey.model';

/**
 * Komponente zur Anzeige der Abstimmungsergebnisse einer Umfrage.
 *
 * @remarks
 * Zeigt pro Frage alle Antworten mit prozentualer Auswertung und
 * Gesamtstimmenzahl als Fortschrittsbalken an.
 */
@Component({
  selector: 'app-survey-results',
  imports: [],
  templateUrl: './survey-results.html',
  styleUrl: './survey-results.scss',
})
export class SurveyResults {
  /** Die Umfrage deren Ergebnisse angezeigt werden. */
  readonly survey = input.required<Survey>();

  /** Buchstaben-Labels für Antwortoptionen (A–F). */
  readonly letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  /**
   * Berechnet den prozentualen Anteil einer Antwort an der Gesamtstimmenzahl.
   * @param answerVotes - Stimmen für diese Antwort
   * @param totalVotes - Gesamtstimmen der Frage
   * @returns Ganzzahliger Prozentwert (0–100)
   */
  getPercentage(answerVotes: number, totalVotes: number): number {
    if (totalVotes === 0) return 0;
    return Math.round((answerVotes / totalVotes) * 100);
  }

  /**
   * Summiert alle Stimmen einer Frage.
   * @param answers - Antworten der Frage
   * @returns Gesamtzahl der abgegebenen Stimmen
   */
  getTotalVotes(answers: { votes: number }[]): number {
    return answers.reduce((sum, a) => sum + a.votes, 0);
  }

  /**
   * Gibt an, ob für die Umfrage überhaupt schon Stimmen abgegeben wurden.
   */
  hasAnyVotes(): boolean {
    return this.survey().questions.some(q => q.answers.some(a => a.votes > 0));
  }
}
