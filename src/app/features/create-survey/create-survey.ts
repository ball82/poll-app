import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SurveyService } from '../../core/services/survey.service';
import { SurveyCategory, SurveyInput } from '../../core/models/survey.model';

type AnswerValue = { text: string };
type QuestionValue = { text: string; allowMultiple: boolean; answers: AnswerValue[] };
type SurveyFormValue = {
  title: string;
  description: string;
  category: string;
  endDate: string;
  questions: QuestionValue[];
};

@Component({
  selector: 'app-create-survey',
  imports: [ReactiveFormsModule],
  templateUrl: './create-survey.html',
  styleUrl: './create-survey.scss',
})
export class CreateSurvey {
  private fb = inject(FormBuilder);
  private surveyService = inject(SurveyService);
  private router = inject(Router);

  showSuccessOverlay = signal(false);

  readonly categories: SurveyCategory[] = [
    'Team activities',
    'Health & Wellness',
    'Gaming & Entertainment',
    'Education & Learning',
    'Lifestyle & Preferences',
    'Technology & Innovation',
  ];

  readonly answerLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  readonly minDate = new Date().toISOString().split('T')[0];

  readonly form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    category: ['', Validators.required],
    endDate: [''],
    description: [''],
    questions: this.fb.array([this.createQuestion()]),
  });

  private createQuestion(): FormGroup {
    return this.fb.group({
      text: ['', Validators.required],
      allowMultiple: [false],
      answers: this.fb.array([this.createAnswer(), this.createAnswer()]),
    });
  }

  private createAnswer(): FormGroup {
    return this.fb.group({
      text: ['', Validators.required],
    });
  }

  get questions(): FormArray {
    return this.form.get('questions') as FormArray;
  }

  getAnswers(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('answers') as FormArray;
  }

  addQuestion(): void {
    this.questions.push(this.createQuestion());
  }

  removeQuestion(index: number): void {
    if (index === 0) {
      this.questions.at(0).reset({ allowMultiple: false });
      const answers = this.getAnswers(0);
      while (answers.length > 0) answers.removeAt(0);
      answers.push(this.createAnswer());
      answers.push(this.createAnswer());
      return;
    }
    this.questions.removeAt(index);
  }

  addAnswer(questionIndex: number): void {
    const answers = this.getAnswers(questionIndex);
    if (answers.length < 6) {
      answers.push(this.createAnswer());
    }
  }

  removeAnswer(questionIndex: number, answerIndex: number): void {
    const answers = this.getAnswers(questionIndex);
    if (answers.length > 2) {
      answers.removeAt(answerIndex);
    }
  }

  clearField(controlName: string): void {
    this.form.get(controlName)?.reset('');
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const created = await this.surveyService.addSurvey(this.buildSurveyInput());
    if (created) this.showSuccess(created.id);
  }

  private buildSurveyInput(): SurveyInput {
    const formValue = this.form.value as SurveyFormValue;
    return {
      title: formValue.title.trim(),
      description: formValue.description?.trim() || undefined,
      category: formValue.category as SurveyCategory,
      endDate: this.toIsoDate(formValue.endDate),
      status: 'published',
      questions: this.buildQuestions(formValue.questions),
    };
  }

  private toIsoDate(date: string): string | undefined {
    return date ? new Date(date).toISOString() : undefined;
  }

  private buildQuestions(questions: QuestionValue[]): SurveyInput['questions'] {
    return questions.map(question => ({
      text: question.text.trim(),
      allowMultiple: question.allowMultiple,
      answers: question.answers.map(answer => ({ text: answer.text.trim() })),
    }));
  }

  private showSuccess(surveyId: string): void {
    this.showSuccessOverlay.set(true);
    setTimeout(() => this.openCreatedSurvey(surveyId), 1500);
  }

  private openCreatedSurvey(surveyId: string): void {
    this.showSuccessOverlay.set(false);
    this.router.navigate(['/survey', surveyId]);
  }

  cancel(): void {
    this.router.navigate(['/home']);
  }
}
