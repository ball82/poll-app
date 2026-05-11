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

/**
 * Komponente zum Erstellen einer neuen Umfrage.
 *
 * @remarks
 * Zeigt ein Formular mit Titel, Kategorie, optionalem Enddatum und Beschreibung
 * sowie einem dynamischen Fragenbereich. Nach erfolgreichem Speichern wird ein
 * Erfolgs-Overlay angezeigt und zur Detailseite der neuen Umfrage navigiert.
 */
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

  /** Steuert die Sichtbarkeit des Erfolgs-Overlays nach dem Publizieren. */
  showSuccessOverlay = signal(false);

  /** Alle verfügbaren Kategorien für eine Umfrage. */
  readonly categories: SurveyCategory[] = [
    'Team activities',
    'Health & Wellness',
    'Gaming & Entertainment',
    'Education & Learning',
    'Lifestyle & Preferences',
    'Technology & Innovation',
  ];

  /** Buchstaben-Labels für Antwortoptionen (A–F). */
  readonly answerLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  /** Frühestes wählbares Enddatum (heute). */
  readonly minDate = new Date().toISOString().split('T')[0];

  /** Reaktives Hauptformular mit Validierung. */
  readonly form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    category: ['', Validators.required],
    endDate: [''],
    description: [''],
    questions: this.fb.array([this.createQuestion()]),
  });

  /**
   * Erstellt eine neue leere Fragen-FormGroup mit zwei leeren Antworten.
   */
  private createQuestion(): FormGroup {
    return this.fb.group({
      text: ['', Validators.required],
      allowMultiple: [false],
      answers: this.fb.array([this.createAnswer(), this.createAnswer()]),
    });
  }

  /**
   * Erstellt eine neue leere Antwort-FormGroup.
   */
  private createAnswer(): FormGroup {
    return this.fb.group({
      text: ['', Validators.required],
    });
  }

  /** Gibt das FormArray aller Fragen zurück. */
  get questions(): FormArray {
    return this.form.get('questions') as FormArray;
  }

  /**
   * Gibt das FormArray der Antworten einer bestimmten Frage zurück.
   * @param questionIndex - Index der Frage im questions-Array
   */
  getAnswers(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('answers') as FormArray;
  }

  /** Fügt eine neue leere Frage ans Ende des Formulars an. */
  addQuestion(): void {
    this.questions.push(this.createQuestion());
  }

  /**
   * Entfernt eine Frage aus dem Formular.
   *
   * @remarks
   * Die erste Frage (Index 0) kann nicht gelöscht werden — sie wird stattdessen
   * zurückgesetzt, damit immer mindestens eine Frage vorhanden ist.
   *
   * @param index - Index der zu entfernenden Frage
   */
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

  /**
   * Fügt einer Frage eine weitere Antwort hinzu (max. 6).
   * @param questionIndex - Index der Frage, zu der eine Antwort hinzugefügt wird
   */
  addAnswer(questionIndex: number): void {
    const answers = this.getAnswers(questionIndex);
    if (answers.length < 6) {
      answers.push(this.createAnswer());
    }
  }

  /**
   * Entfernt eine Antwort aus einer Frage (min. 2 Antworten bleiben erhalten).
   * @param questionIndex - Index der betroffenen Frage
   * @param answerIndex - Index der zu entfernenden Antwort
   */
  removeAnswer(questionIndex: number, answerIndex: number): void {
    const answers = this.getAnswers(questionIndex);
    if (answers.length > 2) {
      answers.removeAt(answerIndex);
    }
  }

  /**
   * Setzt ein einzelnes Formularfeld zurück.
   * @param controlName - Name des zurückzusetzenden Controls
   */
  clearField(controlName: string): void {
    this.form.get(controlName)?.reset('');
  }

  /**
   * Validiert das Formular und speichert die Umfrage.
   *
   * @remarks
   * Bei ungültigem Formular werden alle Felder als `touched` markiert,
   * damit Fehlermeldungen sichtbar werden. Bei Erfolg wird ein Overlay
   * angezeigt und nach 1,5 Sekunden zur Detailseite navigiert.
   */
  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const created = await this.surveyService.addSurvey(this.buildSurveyInput());
    if (created) this.showSuccess(created.id);
  }

  /**
   * Baut das `SurveyInput`-Objekt aus dem aktuellen Formularwert zusammen.
   */
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

  /**
   * Konvertiert einen Datumsstring in ISO-8601-Format oder gibt `undefined` zurück.
   * @param date - Datumswert aus dem Formular (z. B. `"2026-06-01"`)
   */
  private toIsoDate(date: string): string | undefined {
    return date ? new Date(date).toISOString() : undefined;
  }

  /**
   * Mappt die Fragen aus dem Formularwert auf das `SurveyInput`-Format.
   * @param questions - Fragen-Array aus dem Formularwert
   */
  private buildQuestions(questions: QuestionValue[]): SurveyInput['questions'] {
    return questions.map(question => ({
      text: question.text.trim(),
      allowMultiple: question.allowMultiple,
      answers: question.answers.map(answer => ({ text: answer.text.trim() })),
    }));
  }

  /**
   * Zeigt das Erfolgs-Overlay und navigiert nach 1,5 Sekunden zur Detailseite.
   * @param surveyId - ID der neu erstellten Umfrage
   */
  private showSuccess(surveyId: string): void {
    this.showSuccessOverlay.set(true);
    setTimeout(() => this.openCreatedSurvey(surveyId), 1500);
  }

  /**
   * Schliesst das Overlay und navigiert zur Detailseite der Umfrage.
   * @param surveyId - ID der neu erstellten Umfrage
   */
  private openCreatedSurvey(surveyId: string): void {
    this.showSuccessOverlay.set(false);
    this.router.navigate(['/survey', surveyId]);
  }

  /** Bricht den Erstellungsprozess ab und navigiert zur Startseite. */
  cancel(): void {
    this.router.navigate(['/home']);
  }
}
