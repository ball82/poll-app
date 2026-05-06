import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SurveyService } from '../../core/services/survey.service';
import { SurveyResults } from '../../shared/components/survey-results/survey-results';

@Component({
  selector: 'app-survey-detail',
  imports: [RouterLink, SurveyResults],
  templateUrl: './survey-detail.html',
  styleUrl: './survey-detail.scss',
})
export class SurveyDetail implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private surveyService = inject(SurveyService);
  private document = inject(DOCUMENT);

  constructor() {
    if (this.surveyService.surveys().length === 0) {
      this.surveyService.loadSurveys();
    }
  }

  ngOnInit(): void {
    this.document.body.classList.add('page-light');
  }

  ngOnDestroy(): void {
    this.document.body.classList.remove('page-light');
  }

  readonly answerLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  private readonly surveyId = this.route.snapshot.paramMap.get('id') ?? '';

  readonly survey = computed(() => this.surveyService.getSurveyById(this.surveyId));

  readonly selectedAnswers = signal<Map<string, Set<string>>>(new Map());

  readonly showResults = signal(false);

  readonly isExpired = computed(() => {
    const s = this.survey();
    return s ? this.surveyService.isExpired(s) : false;
  });

  readonly hasVoted = computed(() => {
    const s = this.survey();
    return s ? this.surveyService.hasVoted(s.id) : false;
  });

  readonly endsInLabel = computed(() => {
    const s = this.survey();
    if (!s?.endDate) return null;
    const days = this.surveyService.daysRemaining(s);
    if (days === null) return null;
    if (days === 0) return 'Ends today';
    if (days === 1) return 'Ends in 1 Day';
    return `Ends in ${days} Days`;
  });

  readonly endDateFormatted = computed(() => {
    const s = this.survey();
    if (!s?.endDate) return null;
    return new Date(s.endDate).toLocaleDateString('de-DE');
  });

  readonly canSubmit = computed(() => {
    if (this.hasVoted() || this.isExpired()) return false;
    const s = this.survey();
    if (!s) return false;
    return s.questions.every(q => {
      const set = this.selectedAnswers().get(q.id);
      return set && set.size > 0;
    });
  });

  toggleAnswer(questionId: string, answerId: string, allowMultiple: boolean): void {
    if (this.hasVoted() || this.isExpired()) return;

    this.selectedAnswers.update(map => {
      const newMap = new Map(map);
      const set = newMap.get(questionId) ?? new Set<string>();

      if (allowMultiple) {
        if (set.has(answerId)) {
          set.delete(answerId);
        } else {
          set.add(answerId);
        }
      } else {
        set.clear();
        set.add(answerId);
      }
      newMap.set(questionId, set);
      return newMap;
    });
  }

  isSelected(questionId: string, answerId: string): boolean {
    return this.selectedAnswers().get(questionId)?.has(answerId) ?? false;
  }

  async submitVote(): Promise<void> {
    const s = this.survey();
    if (!s) return;

    const votes = Array.from(this.selectedAnswers().entries()).map(
      ([questionId, set]) => ({
        questionId,
        answerIds: Array.from(set),
      })
    );

    await this.surveyService.vote(s.id, votes);
    this.showResults.set(true);
  }

  toggleResults(): void {
    this.showResults.update(v => !v);
  }

  closeAndGoHome(): void {
    this.router.navigate(['/home']);
  }
}
