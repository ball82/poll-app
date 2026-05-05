import { Component, input } from '@angular/core';
import { Survey } from '../../../core/models/survey.model';

@Component({
  selector: 'app-survey-results',
  imports: [],
  templateUrl: './survey-results.html',
  styleUrl: './survey-results.scss',
})
export class SurveyResults {
  // Pflicht-Input: die Survey, deren Ergebnisse gezeigt werden
  survey = input.required<Survey>();

  // Letter-Mapping (A, B, C, ...)
  readonly letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  // Prozent berechnen pro Antwort
  getPercentage(answerVotes: number, totalVotes: number): number {
    if (totalVotes === 0) return 0;
    return Math.round((answerVotes / totalVotes) * 100);
  }

  // Gesamtstimmen einer Frage
  getTotalVotes(answers: { votes: number }[]): number {
    return answers.reduce((sum, a) => sum + a.votes, 0);
  }

  // Gibt es überhaupt schon Stimmen?
  hasAnyVotes(): boolean {
    return this.survey().questions.some(q =>
      q.answers.some(a => a.votes > 0)
    );
  }
}