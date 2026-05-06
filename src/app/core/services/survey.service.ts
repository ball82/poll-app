import { Injectable, signal, computed, inject } from '@angular/core';
import { Survey, SurveyCategory, SurveyInput } from '../models/survey.model';
import { SupabaseService } from './supabase';

@Injectable({
  providedIn: 'root',
})
export class SurveyService {
  private supabase = inject(SupabaseService);

  private readonly _surveys = signal<Survey[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly surveys = this._surveys.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly activeSurveys = computed(() =>
    this._surveys().filter(s => !this.isExpired(s) && s.status === 'published')
  );

  readonly pastSurveys = computed(() =>
    this._surveys().filter(s => this.isExpired(s))
  );

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

  async loadSurveys(): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const { data: surveysData, error: sError } = await this.supabase.client
        .from('surveys')
        .select('*')
        .order('created_at', { ascending: false });

      if (sError) throw sError;

      const { data: questionsData, error: qError } = await this.supabase.client
        .from('questions')
        .select('*')
        .order('position', { ascending: true });

      if (qError) throw qError;

      const { data: answersData, error: aError } = await this.supabase.client
        .from('answers')
        .select('*')
        .order('position', { ascending: true });

      if (aError) throw aError;

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load surveys';
      console.error('Error loading surveys:', err);
      this._error.set(message);
    } finally {
      this._isLoading.set(false);
    }
  }

  getSurveyById(id: string): Survey | undefined {
    return this._surveys().find(s => s.id === id);
  }

  async addSurvey(input: SurveyInput): Promise<Survey | null> {
    try {
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

      await this.loadSurveys();

      return this.getSurveyById(surveyRow.id) ?? null;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add survey';
      console.error('Error adding survey:', err);
      this._error.set(message);
      return null;
    }
  }

  async vote(surveyId: string, votes: { questionId: string; answerIds: string[] }[]): Promise<void> {
    try {
      for (const v of votes) {
        for (const answerId of v.answerIds) {
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

      this.markAsVoted(surveyId);
      await this.loadSurveys();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit vote';
      console.error('Error voting:', err);
      this._error.set(message);
    }
  }

  private readonly VOTED_KEY = 'poll-app-voted-surveys';

  hasVoted(surveyId: string): boolean {
    return this.getVotedList().includes(surveyId);
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

  isExpired(survey: Survey): boolean {
    if (!survey.endDate) return false;
    return new Date(survey.endDate).getTime() < Date.now();
  }

  daysRemaining(survey: Survey): number | null {
    if (!survey.endDate) return null;
    const diff = new Date(survey.endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
}
