import { Injectable, signal, computed, inject } from '@angular/core';
import { Survey, SurveyCategory } from '../models/survey.model';
import { Supabase } from './supabase';

@Injectable({
  providedIn: 'root',
})
export class SurveyService {
  private supabase = inject(Supabase);

  // privater, schreibbarer Signal-State
  private readonly _surveys = signal<Survey[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // öffentlicher, nur lesbarer State
  readonly surveys = this._surveys.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

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

  constructor() {
    // Beim Start: Daten aus Supabase laden
    this.loadSurveys();
  }

  // ===== SURVEYS LADEN =====
  async loadSurveys(): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      // 1) Surveys laden
      const { data: surveysData, error: sError } = await this.supabase.client
        .from('surveys')
        .select('*')
        .order('created_at', { ascending: false });

      if (sError) throw sError;

      // 2) Questions laden
      const { data: questionsData, error: qError } = await this.supabase.client
        .from('questions')
        .select('*')
        .order('position', { ascending: true });

      if (qError) throw qError;

      // 3) Answers laden
      const { data: answersData, error: aError } = await this.supabase.client
        .from('answers')
        .select('*')
        .order('position', { ascending: true });

      if (aError) throw aError;

      // 4) Daten zusammenbauen (DB-Format -> App-Format)
      const surveys: Survey[] = (surveysData ?? []).map(s => ({
        id: s.id,
        title: s.title,
        description: s.description ?? undefined,
        category: s.category as SurveyCategory,
        endDate: s.end_date ?? undefined,
        createdAt: s.created_at,
        status: s.status,
        questions: (questionsData ?? [])
          .filter(q => q.survey_id === s.id)
          .map(q => ({
            id: q.id,
            text: q.text,
            allowMultiple: q.allow_multiple,
            answers: (answersData ?? [])
              .filter(a => a.question_id === q.id)
              .map(a => ({
                id: a.id,
                text: a.text,
                votes: a.votes,
              })),
          })),
      }));

      this._surveys.set(surveys);
    } catch (err: any) {
      console.error('Error loading surveys:', err);
      this._error.set(err.message ?? 'Failed to load surveys');
    } finally {
      this._isLoading.set(false);
    }
  }

  // Eine bestimmte Umfrage aus dem aktuellen State holen
  getSurveyById(id: string): Survey | undefined {
    return this._surveys().find(s => s.id === id);
  }

  // ===== NEUE SURVEY ANLEGEN =====
  async addSurvey(input: Omit<Survey, 'id' | 'createdAt'>): Promise<Survey | null> {
    try {
      // 1) Survey einfügen
      const { data: surveyRow, error: sError } = await this.supabase.client
        .from('surveys')
        .insert({
          title: input.title,
          description: input.description ?? null,
          category: input.category,
          end_date: input.endDate ?? null,
          status: input.status,
        })
        .select()
        .single();

      if (sError || !surveyRow) throw sError;

      // 2) Questions einfügen
      for (let qIndex = 0; qIndex < input.questions.length; qIndex++) {
        const q = input.questions[qIndex];

        const { data: questionRow, error: qError } = await this.supabase.client
          .from('questions')
          .insert({
            survey_id: surveyRow.id,
            text: q.text,
            allow_multiple: q.allowMultiple,
            position: qIndex,
          })
          .select()
          .single();

        if (qError || !questionRow) throw qError;

        // 3) Answers einfügen
        const answersToInsert = q.answers.map((a, aIndex) => ({
          question_id: questionRow.id,
          text: a.text,
          votes: 0,
          position: aIndex,
        }));

        const { error: aError } = await this.supabase.client
          .from('answers')
          .insert(answersToInsert);

        if (aError) throw aError;
      }

      // 4) Alle Surveys neu laden
      await this.loadSurveys();

      // 5) Neue Survey zurückgeben
      return this.getSurveyById(surveyRow.id) ?? null;
    } catch (err: any) {
      console.error('Error adding survey:', err);
      this._error.set(err.message ?? 'Failed to add survey');
      return null;
    }
  }

  // ===== STIMME ABGEBEN =====
  async vote(surveyId: string, votes: { questionId: string; answerIds: string[] }[]): Promise<void> {
    try {
      // Alle gewählten Antworten um +1 erhöhen
      for (const v of votes) {
        for (const answerId of v.answerIds) {
          // aktuellen Stand holen
          const survey = this.getSurveyById(surveyId);
          const answer = survey?.questions
            .find(q => q.id === v.questionId)
            ?.answers.find(a => a.id === answerId);

          if (!answer) continue;

          const { error } = await this.supabase.client
            .from('answers')
            .update({ votes: answer.votes + 1 })
            .eq('id', answerId);

          if (error) throw error;
        }
      }

      // Lokal als "voted" merken (im Browser)
      this.markAsVoted(surveyId);

      // Daten neu laden
      await this.loadSurveys();
    } catch (err: any) {
      console.error('Error voting:', err);
      this._error.set(err.message ?? 'Failed to submit vote');
    }
  }

  // ===== "Hat schon gevotet?" - bleibt im LocalStorage =====
  private readonly VOTED_KEY = 'poll-app-voted-surveys';

  hasVoted(surveyId: string): boolean {
    const list = this.getVotedList();
    return list.includes(surveyId);
  }

  private markAsVoted(surveyId: string): void {
    const list = this.getVotedList();
    if (!list.includes(surveyId)) {
      list.push(surveyId);
      localStorage.setItem(this.VOTED_KEY, JSON.stringify(list));
    }
  }

  private getVotedList(): string[] {
    try {
      const data = localStorage.getItem(this.VOTED_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // ===== HILFSFUNKTIONEN =====
  isExpired(survey: Survey): boolean {
    if (!survey.endDate) return false;
    return new Date(survey.endDate).getTime() < Date.now();
  }

  daysRemaining(survey: Survey): number | null {
    if (!survey.endDate) return null;
    const diff = new Date(survey.endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  generateId(): string {
    return crypto.randomUUID();
  }
}