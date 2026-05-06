import { Component, input } from '@angular/core';
import { Survey } from '../../../core/models/survey.model';

@Component({
  selector: 'app-survey-results',
  imports: [],
  templateUrl: './survey-results.html',
  styleUrl: './survey-results.scss',
})
export class SurveyResults {
  readonly survey = input.required<Survey>();

  readonly letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  getPercentage(answerVotes: number, totalVotes: number): number {
    if (totalVotes === 0) return 0;
    return Math.round((answerVotes / totalVotes) * 100);
  }

  getTotalVotes(answers: { votes: number }[]): number {
    return answers.reduce((sum, a) => sum + a.votes, 0);
  }

  hasAnyVotes(): boolean {
    return this.survey().questions.some(q => q.answers.some(a => a.votes > 0));
  }
}
