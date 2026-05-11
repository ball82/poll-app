import { Injectable, signal, computed, inject } from '@angular/core';
import { Survey, SurveyCategory, SurveyInput } from '../models/survey.model';
import { SupabaseService } from './supabase';

/** Datenbankzeile der `surveys`-Tabelle. */
type SurveyRow = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  end_date: string | null;
  created_at: string;
  status: 'draft' | 'published';
};

/** Datenbankzeile der `questions`-Tabelle. */
type QuestionRow = {
  id: string;
  survey_id: string;
  text: string;
  allow_multiple: boolean;
};

/** Datenbankzeile der `answers`-Tabelle. */
type AnswerRow = {
  id: string;
  question_id: string;
  text: string;
  votes: number;
};

/** Gebündelte Rohdaten aller drei Tabellen für ein einzelnes Mapping. */
type SurveyRows = {
  surveyRows: SurveyRow[];
  questionRows: QuestionRow[];
  answerRows: AnswerRow[];
};

/**
 * Zentraler Service für alle Umfrage-Operationen.
 *
 * @remarks
 * Verwaltet den Umfrage-State via Angular Signals und kommuniziert
 * ausschliesslich über den `SupabaseService` mit der Datenbank.
 * Abstimmungs-History wird im `localStorage` des Browsers persistiert.
 */
@Injectable({
  providedIn: 'root',
})
export class SurveyService {
  private supabase = inject(SupabaseService);

  private readonly _surveys = signal<Survey[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  /** Schreibgeschütztes Signal mit allen geladenen Umfragen. */
  readonly surveys = this._surveys.asReadonly();
  /** Gibt `true` zurück, solange Daten geladen werden. */
  readonly isLoading = this._isLoading.asReadonly();
  /** Enthält die letzte Fehlermeldung oder `null`. */
  readonly error = this._error.asReadonly();

  /** Alle aktiven (nicht abgelaufenen, publizierten) Umfragen, nach Enddatum sortiert. */
  readonly activeSurveys = computed(() =>
    this.sortByEndDate(
      this._surveys().filter(s => !this.isExpired(s) && s.status === 'published')
    )
  );

  /** Alle abgelaufenen Umfragen, nach Enddatum sortiert. */
  readonly pastSurveys = computed(() =>
    this.sortByEndDate(this._surveys().filter(s => this.isExpired(s)))
  );

  /** Die drei aktiven Umfragen mit dem nächsten Ablaufdatum. */
  readonly endingSoonSurveys = computed(() =>
    this.activeSurveys()
      .filter(s => s.endDate)
      .sort((a, b) =>
        new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime()
      )
      .slice(0, 3)
  );

  constructor() {
    this.loadSurveys();
  }

  /**
   * Lädt alle Umfragen, Fragen und Antworten aus der Datenbank
   * und aktualisiert den internen Signal-State.
   */
  async loadSurveys(): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const rows = await this.fetchSurveyRows();
      this._surveys.set(this.mapSurveys(rows));
    } catch (err: unknown) {
      this.handleError(err, 'Failed to load surveys', 'Error loading surveys:');
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Lädt die Rohdaten aller drei Tabellen parallel.
   */
  private async fetchSurveyRows(): Promise<SurveyRows> {
    const surveyRows = await this.fetchSurveys();
    const questionRows = await this.fetchQuestions();
    const answerRows = await this.fetchAnswers();
    return { surveyRows, questionRows, answerRows };
  }

  private async fetchSurveys(): Promise<SurveyRow[]> {
    const { data, error } = await this.supabase.client
      .from('surveys').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  private async fetchQuestions(): Promise<QuestionRow[]> {
    const { data, error } = await this.supabase.client
      .from('questions').select('*').order('position', { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  private async fetchAnswers(): Promise<AnswerRow[]> {
    const { data, error } = await this.supabase.client
      .from('answers').select('*').order('position', { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  private mapSurveys(rows: SurveyRows): Survey[] {
    return rows.surveyRows.map(s =>
      this.mapSurvey(s, rows.questionRows, rows.answerRows)
    );
  }

  private mapSurvey(s: SurveyRow, questions: QuestionRow[], answers: AnswerRow[]): Survey {
    return {
      id: s.id,
      title: s.title,
      description: s.description ?? undefined,
      category: s.category as SurveyCategory,
      endDate: s.end_date ?? undefined,
      createdAt: s.created_at,
      status: s.status,
      questions: this.mapQuestions(s.id, questions, answers),
    };
  }

  private mapQuestions(surveyId: string, questions: QuestionRow[], answers: AnswerRow[]) {
    return questions
      .filter(q => q.survey_id === surveyId)
      .map(q => this.mapQuestion(q, answers));
  }

  private mapQuestion(q: QuestionRow, answers: AnswerRow[]) {
    return {
      id: q.id,
      text: q.text,
      allowMultiple: q.allow_multiple,
      answers: this.mapAnswers(q.id, answers),
    };
  }

  private mapAnswers(questionId: string, answers: AnswerRow[]) {
    return answers
      .filter(a => a.question_id === questionId)
      .map(a => ({ id: a.id, text: a.text, votes: a.votes }));
  }

  /**
   * Gibt eine einzelne Umfrage aus dem aktuellen State zurück.
   * @param id - ID der gesuchten Umfrage
   * @returns Die gefundene Umfrage oder `undefined`
   */
  getSurveyById(id: string): Survey | undefined {
    return this._surveys().find(s => s.id === id);
  }

  /**
   * Speichert eine neue Umfrage mit allen Fragen und Antworten in der Datenbank.
   * @param input - Eingabedaten der neuen Umfrage
   * @returns Die neu erstellte Umfrage oder `null` bei Fehler
   */
  async addSurvey(input: SurveyInput): Promise<Survey | null> {
    try {
      const surveyRow = await this.insertSurvey(input);
      await this.insertQuestions(surveyRow.id, input.questions);
      await this.loadSurveys();
      return this.getSurveyById(surveyRow.id) ?? null;
    } catch (err: unknown) {
      this.handleError(err, 'Failed to add survey', 'Error adding survey:');
      return null;
    }
  }

  private async insertSurvey(input: SurveyInput): Promise<SurveyRow> {
    const { data, error } = await this.supabase.client
      .from('surveys').insert(this.toSurveyInsert(input)).select().single();
    if (error || !data) throw error;
    return data;
  }

  private toSurveyInsert(input: SurveyInput): Record<string, unknown> {
    return {
      title: input.title,
      description: input.description ?? null,
      category: input.category,
      end_date: input.endDate ?? null,
      status: input.status,
    };
  }

  private async insertQuestions(surveyId: string, questions: SurveyInput['questions']) {
    for (let index = 0; index < questions.length; index++) {
      await this.insertQuestionWithAnswers(surveyId, questions[index], index);
    }
  }

  private async insertQuestionWithAnswers(
    surveyId: string,
    question: SurveyInput['questions'][number],
    index: number
  ): Promise<void> {
    const row = await this.insertQuestion(surveyId, question, index);
    await this.insertAnswers(row.id, question.answers);
  }

  private async insertQuestion(
    surveyId: string,
    question: SurveyInput['questions'][number],
    index: number
  ): Promise<QuestionRow> {
    const insert = this.toQuestionInsert(surveyId, question, index);
    const { data, error } = await this.supabase.client
      .from('questions').insert(insert).select().single();
    if (error || !data) throw error;
    return data;
  }

  private toQuestionInsert(
    surveyId: string,
    question: SurveyInput['questions'][number],
    index: number
  ): Record<string, unknown> {
    return {
      survey_id: surveyId,
      text: question.text,
      allow_multiple: question.allowMultiple,
      position: index,
    };
  }

  private async insertAnswers(questionId: string, answers: { text: string }[]) {
    const { error } = await this.supabase.client
      .from('answers').insert(this.toAnswerInserts(questionId, answers));
    if (error) throw error;
  }

  private toAnswerInserts(questionId: string, answers: { text: string }[]) {
    return answers.map((answer, index) => ({
      question_id: questionId,
      text: answer.text,
      votes: 0,
      position: index,
    }));
  }

  /**
   * Speichert die Abstimmung des Nutzers und aktualisiert den State.
   * @param surveyId - ID der Umfrage
   * @param votes - Array mit je einer `questionId` und den gewählten `answerIds`
   */
  async vote(surveyId: string, votes: { questionId: string; answerIds: string[] }[]): Promise<void> {
    try {
      await this.submitVotes(surveyId, votes);
      this.markAsVoted(surveyId);
      await this.loadSurveys();
    } catch (err: unknown) {
      this.handleError(err, 'Failed to submit vote', 'Error voting:');
    }
  }

  private async submitVotes(
    surveyId: string,
    votes: { questionId: string; answerIds: string[] }[]
  ): Promise<void> {
    for (const vote of votes) await this.submitVote(surveyId, vote);
  }

  private async submitVote(
    surveyId: string,
    vote: { questionId: string; answerIds: string[] }
  ): Promise<void> {
    for (const answerId of vote.answerIds) {
      await this.incrementAnswerVote(surveyId, vote.questionId, answerId);
    }
  }

  /**
   * Erhöht den Vote-Zähler einer Antwort um 1.
   * Liest den aktuellen Wert aus dem Signal-State, um Race-Conditions mit
   * `loadSurveys` zu minimieren.
   */
  private async incrementAnswerVote(
    surveyId: string,
    questionId: string,
    answerId: string
  ): Promise<void> {
    const answer = this.findAnswer(surveyId, questionId, answerId);
    if (!answer) return;
    const { error } = await this.supabase.client
      .from('answers').update({ votes: answer.votes + 1 }).eq('id', answerId);
    if (error) throw error;
  }

  private findAnswer(surveyId: string, questionId: string, answerId: string) {
    return this.getSurveyById(surveyId)?.questions
      .find(q => q.id === questionId)
      ?.answers.find(a => a.id === answerId);
  }

  /** localStorage-Key für die Liste bereits abgestimmter Umfragen. */
  private readonly VOTED_KEY = 'poll-app-voted-surveys';

  /**
   * Gibt an, ob der aktuelle Nutzer bereits für diese Umfrage abgestimmt hat.
   * @param surveyId - ID der Umfrage
   */
  hasVoted(surveyId: string): boolean {
    return this.getVotedList().includes(surveyId);
  }

  /**
   * Trägt eine Umfrage-ID in die lokale Voted-Liste ein, falls noch nicht vorhanden.
   * @param surveyId - ID der abgestimmten Umfrage
   */
  private markAsVoted(surveyId: string): void {
    const list = this.getVotedList();
    if (!list.includes(surveyId)) {
      list.push(surveyId);
      localStorage.setItem(this.VOTED_KEY, JSON.stringify(list));
    }
  }

  /**
   * Liest die Liste abgestimmter Umfragen aus dem localStorage.
   * Gibt bei Parsing-Fehler ein leeres Array zurück.
   */
  private getVotedList(): string[] {
    try {
      const data = localStorage.getItem(this.VOTED_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Gibt an, ob das Enddatum einer Umfrage in der Vergangenheit liegt.
   * @param survey - Die zu prüfende Umfrage
   */
  isExpired(survey: Survey): boolean {
    if (!survey.endDate) return false;
    return new Date(survey.endDate).getTime() < Date.now();
  }

  /**
   * Berechnet die verbleibenden Tage bis zum Ablauf einer Umfrage.
   * @param survey - Die zu prüfende Umfrage
   * @returns Anzahl verbleibender Tage (mind. 0), oder `null` wenn kein Enddatum gesetzt
   */
  daysRemaining(survey: Survey): number | null {
    if (!survey.endDate) return null;
    const diff = new Date(survey.endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  /** Sortiert Umfragen aufsteigend nach Enddatum; Umfragen ohne Datum kommen zuletzt. */
  private sortByEndDate(surveys: Survey[]): Survey[] {
    return [...surveys].sort((a, b) => this.endTime(a) - this.endTime(b));
  }

  private endTime(survey: Survey): number {
    if (!survey.endDate) return Number.POSITIVE_INFINITY;
    return new Date(survey.endDate).getTime();
  }

  /**
   * Setzt die Fehlermeldung im State und loggt den Fehler in der Konsole.
   * @param err - Der aufgetretene Fehler
   * @param fallback - Fallback-Nachricht wenn `err` kein `Error`-Objekt ist
   * @param label - Prefix für den `console.error`-Aufruf
   */
  private handleError(err: unknown, fallback: string, label: string): void {
    const message = err instanceof Error ? err.message : fallback;
    console.error(label, err);
    this._error.set(message);
  }
}
