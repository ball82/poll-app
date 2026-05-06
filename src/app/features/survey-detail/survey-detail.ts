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
  // Falls die Surveys noch nicht geladen sind, jetzt laden
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

  // Survey-ID aus der URL holen (z.B. /survey/mock-1)
  private surveyId = this.route.snapshot.paramMap.get('id') ?? '';

  // Die Umfrage als Computed (reagiert auf Service-Updates)
  survey = computed(() => this.surveyService.getSurveyById(this.surveyId));

  // Welche Antworten der User pro Frage gewählt hat
  // Map: questionId -> Set von answerIds
  selectedAnswers = signal<Map<string, Set<string>>>(new Map());

  // Ergebnisse anzeigen ja/nein (nach Vote oder über Toggle)
  showResults = signal(false);

  // Ist die Umfrage abgelaufen?
  isExpired = computed(() => {
    const s = this.survey();
    return s ? this.surveyService.isExpired(s) : false;
  });

  hasVoted = computed(() => {
    const s = this.survey();
    return s ? this.surveyService.hasVoted(s.id) : false;
  });

  // Verbleibende Tage Label
  endsInLabel = computed(() => {
    const s = this.survey();
    if (!s?.endDate) return null;
    const days = this.surveyService.daysRemaining(s);
    if (days === null) return null;
    if (days === 0) return 'Ends today';
    if (days === 1) return 'Ends in 1 Day';
    return `Ends in ${days} Days`;
  });

  // End-Datum formatiert (z.B. "01.09.2025")
  endDateFormatted = computed(() => {
    const s = this.survey();
    if (!s?.endDate) return null;
    const d = new Date(s.endDate);
    return d.toLocaleDateString('de-DE');
  });

  // Antwort an-/abwählen
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
        // Bei Single-Choice: nur eine Antwort
        set.clear();
        set.add(answerId);
      }
      newMap.set(questionId, set);
      return newMap;
    });
  }

  // Prüfen ob Antwort gewählt ist (fürs Template)
  isSelected(questionId: string, answerId: string): boolean {
    return this.selectedAnswers().get(questionId)?.has(answerId) ?? false;
  }

  // Stimme abgeben
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
  // Mindestens eine Antwort gewählt? (sonst Submit deaktivieren)
  canSubmit = computed(() => {
    if (this.hasVoted() || this.isExpired()) return false;
    const s = this.survey();
    if (!s) return false;
    // Jede Frage muss mindestens 1 Antwort haben
    return s.questions.every(q => {
      const set = this.selectedAnswers().get(q.id);
      return set && set.size > 0;
    });
  });

  toggleResults(): void {
    this.showResults.update(v => !v);
  }

  closeAndGoHome(): void {
    this.router.navigate(['/home']);
  }
}