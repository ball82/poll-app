import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SurveyService } from '../../core/services/survey.service';
import { SurveyResults } from '../../shared/components/survey-results/survey-results';

/**
 * Detailseite einer einzelnen Umfrage.
 *
 * @remarks
 * Ermöglicht das Abstimmen, zeigt den Status (abgelaufen / bereits abgestimmt)
 * und blendet nach der Stimmabgabe die Ergebnisse ein.
 * Fügt beim Laden die CSS-Klasse `page-light` zum `body` hinzu
 * und entfernt sie beim Verlassen der Seite wieder.
 */
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

  /** Buchstaben-Labels für Antwortoptionen (A–F). */
  readonly answerLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  /** ID der Umfrage aus dem URL-Parameter. */
  private readonly surveyId = this.route.snapshot.paramMap.get('id') ?? '';

  /** Die aktuell angezeigte Umfrage (reaktiv via Signal). */
  readonly survey = computed(() => this.surveyService.getSurveyById(this.surveyId));

  /**
   * Map von `questionId` → Set von gewählten `answerIds`.
   * Wird bei jeder Antwortauswahl immutabel neu gesetzt.
   */
  readonly selectedAnswers = signal<Map<string, Set<string>>>(new Map());

  /** Steuert ob die Ergebnisansicht eingeblendet ist. */
  readonly showResults = signal(false);

  /** Gibt an, ob die Umfrage abgelaufen ist. */
  readonly isExpired = computed(() => {
    const s = this.survey();
    return s ? this.surveyService.isExpired(s) : false;
  });

  /** Gibt an, ob der aktuelle Nutzer bereits abgestimmt hat. */
  readonly hasVoted = computed(() => {
    const s = this.survey();
    return s ? this.surveyService.hasVoted(s.id) : false;
  });

  /** Lesbares Label für die verbleibende Zeit (z. B. `"Ends in 3 Days"`). */
  readonly endsInLabel = computed(() => {
    const s = this.survey();
    if (!s?.endDate) return null;
    const days = this.surveyService.daysRemaining(s);
    if (days === null) return null;
    if (days === 0) return 'Ends today';
    if (days === 1) return 'Ends in 1 Day';
    return `Ends in ${days} Days`;
  });

  /** Enddatum formatiert nach deutschem Standard (dd.mm.yyyy). */
  readonly endDateFormatted = computed(() => {
    const s = this.survey();
    if (!s?.endDate) return null;
    return new Date(s.endDate).toLocaleDateString('de-DE');
  });

  /**
   * Gibt an, ob das Formular abgeschickt werden kann.
   * `false` wenn bereits abgestimmt, Umfrage abgelaufen oder
   * nicht alle Fragen beantwortet sind.
   */
  readonly canSubmit = computed(() => {
    if (this.hasVoted() || this.isExpired()) return false;
    const s = this.survey();
    if (!s) return false;
    return s.questions.every(q => {
      const set = this.selectedAnswers().get(q.id);
      return set && set.size > 0;
    });
  });

  /**
   * Wählt oder deselektiert eine Antwort.
   *
   * @remarks
   * Bei `allowMultiple = false` wird die vorherige Auswahl der Frage ersetzt.
   * Bei `allowMultiple = true` wird die Antwort getoggelt.
   * Ignoriert Eingaben wenn bereits abgestimmt oder Umfrage abgelaufen.
   *
   * @param questionId - ID der Frage
   * @param answerId - ID der gewählten Antwort
   * @param allowMultiple - Ob mehrere Antworten erlaubt sind
   */
  toggleAnswer(questionId: string, answerId: string, allowMultiple: boolean): void {
    if (this.hasVoted() || this.isExpired()) return;
    this.selectedAnswers.update(map =>
      this.nextSelectedAnswerMap(map, questionId, answerId, allowMultiple)
    );
  }

  private nextSelectedAnswerMap(
    map: Map<string, Set<string>>,
    questionId: string,
    answerId: string,
    allowMultiple: boolean
  ): Map<string, Set<string>> {
    const newMap = new Map(map);
    newMap.set(questionId, this.nextAnswerSet(map, questionId, answerId, allowMultiple));
    return newMap;
  }

  private nextAnswerSet(
    map: Map<string, Set<string>>,
    questionId: string,
    answerId: string,
    allowMultiple: boolean
  ): Set<string> {
    const set = new Set(map.get(questionId) ?? []);
    if (!allowMultiple) return new Set([answerId]);
    set.has(answerId) ? set.delete(answerId) : set.add(answerId);
    return set;
  }

  /**
   * Gibt an, ob eine bestimmte Antwort aktuell ausgewählt ist.
   * @param questionId - ID der Frage
   * @param answerId - ID der Antwort
   */
  isSelected(questionId: string, answerId: string): boolean {
    return this.selectedAnswers().get(questionId)?.has(answerId) ?? false;
  }

  /**
   * Schickt die Abstimmung ab und blendet danach die Ergebnisse ein.
   */
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

  /** Blendet die Ergebnisansicht ein oder aus. */
  toggleResults(): void {
    this.showResults.update(v => !v);
  }

  /** Schliesst die Detailseite und navigiert zur Startseite. */
  closeAndGoHome(): void {
    this.router.navigate(['/home']);
  }
}
