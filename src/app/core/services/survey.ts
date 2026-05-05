import { Injectable, signal, computed } from '@angular/core';
import { Survey, Question, Answer, SurveyCategory } from '../models/survey.model';

const STORAGE_KEY = 'poll-app-surveys';

@Injectable({
  providedIn: 'root',
})
export class SurveyService {
  // privater, schreibbarer Signal-State
  private readonly _surveys = signal<Survey[]>(this.loadFromStorage());

  // öffentlicher, nur lesbarer State
  readonly surveys = this._surveys.asReadonly();

  // Computed: alle aktiven Umfragen (nicht abgelaufen)
  readonly activeSurveys = computed(() =>
    this._surveys().filter(s => !this.isExpired(s) && s.status === 'published')
  );

  // Computed: alle abgelaufenen Umfragen
  readonly pastSurveys = computed(() =>
    this._surveys().filter(s => this.isExpired(s))
  );

  // Computed: bald endende Umfragen (sortiert, max. 3)
  readonly endingSoonSurveys = computed(() =>
    this.activeSurveys()
      .filter(s => s.endDate)
      .sort((a, b) =>
        new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime()
      )
      .slice(0, 3)
  );

  // Eine bestimmte Umfrage holen
  getSurveyById(id: string): Survey | undefined {
    return this._surveys().find(s => s.id === id);
  }

  // Neue Umfrage hinzufügen
  addSurvey(survey: Survey): void {
    this._surveys.update(list => [...list, survey]);
    this.saveToStorage();
  }

  // Umfrage aktualisieren (z.B. nach Vote)
  updateSurvey(updated: Survey): void {
    this._surveys.update(list =>
      list.map(s => (s.id === updated.id ? updated : s))
    );
    this.saveToStorage();
  }

  // Stimme abgeben
  vote(surveyId: string, votes: { questionId: string; answerIds: string[] }[]): void {
    const survey = this.getSurveyById(surveyId);
    if (!survey || survey.hasVoted) return;

    const updatedQuestions = survey.questions.map(q => {
      const voteForThisQuestion = votes.find(v => v.questionId === q.id);
      if (!voteForThisQuestion) return q;

      const updatedAnswers = q.answers.map(a =>
        voteForThisQuestion.answerIds.includes(a.id)
          ? { ...a, votes: a.votes + 1 }
          : a
      );
      return { ...q, answers: updatedAnswers };
    });

    this.updateSurvey({
      ...survey,
      questions: updatedQuestions,
      hasVoted: true,
    });
  }

  // Prüfen ob Umfrage abgelaufen ist
  isExpired(survey: Survey): boolean {
    if (!survey.endDate) return false;
    return new Date(survey.endDate).getTime() < Date.now();
  }

  // Verbleibende Tage berechnen
  daysRemaining(survey: Survey): number | null {
    if (!survey.endDate) return null;
    const diff = new Date(survey.endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  // Eindeutige ID generieren (Browser-Funktion)
  generateId(): string {
    return crypto.randomUUID();
  }

  // --- LocalStorage Helper ---

  private loadFromStorage(): Survey[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._surveys()));
  }
}