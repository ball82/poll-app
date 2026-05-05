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
import { Survey, SurveyCategory } from '../../core/models/survey.model';

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

  // Bestätigungs-Overlay nach Publish
  showSuccessOverlay = signal(false);

  readonly categories: SurveyCategory[] = [
    'Team activities',
    'Health & Wellness',
    'Gaming & Entertainment',
    'Education & Learning',
    'Lifestyle & Preferences',
    'Technology & Innovation',
  ];

  // Hauptformular
  // Pflichtfelder: title, category, mind. 1 Frage mit 2 Antworten
  form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    category: ['', Validators.required],
    endDate: [''],         // optional
    description: [''],     // optional
    questions: this.fb.array([this.createQuestion()]),
  });

  // Eine neue Frage erzeugen (mit 2 Antwort-Feldern als Default)
  private createQuestion(): FormGroup {
    return this.fb.group({
      text: ['', Validators.required],
      allowMultiple: [false],
      answers: this.fb.array([this.createAnswer(), this.createAnswer()]),
    });
  }

  // Eine neue Antwort erzeugen
  private createAnswer(): FormGroup {
    return this.fb.group({
      text: ['', Validators.required],
    });
  }

  // Getter für einfacheren Template-Zugriff auf das FormArray
  get questions(): FormArray {
    return this.form.get('questions') as FormArray;
  }

  // Antworten einer bestimmten Frage holen
  getAnswers(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('answers') as FormArray;
  }

  // Fragen-Aktionen
  addQuestion(): void {
    this.questions.push(this.createQuestion());
  }

  removeQuestion(index: number): void {
    if (index === 0) {
      // Erste Frage: nur Inhalt leeren, nicht löschen (User Story 3-Logik)
      this.questions.at(0).reset({ allowMultiple: false });
      // Antworten zurücksetzen auf 2 leere
      const answers = this.getAnswers(0);
      while (answers.length > 0) answers.removeAt(0);
      answers.push(this.createAnswer());
      answers.push(this.createAnswer());
      return;
    }
    this.questions.removeAt(index);
  }

  // Antwort-Aktionen (max. 6 Antworten pro Frage – steht im Figma)
  addAnswer(questionIndex: number): void {
    const answers = this.getAnswers(questionIndex);
    if (answers.length < 6) {
      answers.push(this.createAnswer());
    }
  }

  removeAnswer(questionIndex: number, answerIndex: number): void {
    const answers = this.getAnswers(questionIndex);
    // Mindestens 2 Antworten müssen bleiben
    if (answers.length > 2) {
      answers.removeAt(answerIndex);
    }
  }

  // Felder einzeln zurücksetzen (Mülleimer-Icons im Header-Bereich)
  clearField(controlName: string): void {
    this.form.get(controlName)?.reset('');
  }

  // Publish
  submit(): void {
    if (this.form.invalid) {
      // Alle Felder als touched markieren, damit Fehler sichtbar werden
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    const newSurvey: Survey = {
      id: this.surveyService.generateId(),
      title: v.title!.trim(),
      description: v.description?.trim() || undefined,
      category: v.category as SurveyCategory,
      endDate: v.endDate ? new Date(v.endDate).toISOString() : undefined,
      createdAt: new Date().toISOString(),
      status: 'published',
      questions: v.questions!.map((q: any) => ({
        id: this.surveyService.generateId(),
        text: q.text.trim(),
        allowMultiple: q.allowMultiple,
        answers: q.answers.map((a: any) => ({
          id: this.surveyService.generateId(),
          text: a.text.trim(),
          votes: 0,
        })),
      })),
    };

    this.surveyService.addSurvey(newSurvey);
    this.showSuccessOverlay.set(true);

    // Nach 1.5s zur Detail-Seite der neuen Umfrage
    setTimeout(() => {
      this.showSuccessOverlay.set(false);
      this.router.navigate(['/survey', newSurvey.id]);
    }, 1500);
  }

  cancel(): void {
    this.router.navigate(['/home']);
  }
}