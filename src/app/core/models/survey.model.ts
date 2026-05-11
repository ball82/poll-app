/** Alle verfügbaren Kategorien für eine Umfrage. */
export type SurveyCategory =
  | 'Team activities'
  | 'Health & Wellness'
  | 'Gaming & Entertainment'
  | 'Education & Learning'
  | 'Lifestyle & Preferences'
  | 'Technology & Innovation';

/** Eine einzelne Antwortmöglichkeit innerhalb einer Frage. */
export interface Answer {
  /** Eindeutige ID der Antwort. */
  id: string;
  /** Anzeigetext der Antwort. */
  text: string;
  /** Anzahl der abgegebenen Stimmen. */
  votes: number;
}

/** Eine Frage innerhalb einer Umfrage. */
export interface Question {
  /** Eindeutige ID der Frage. */
  id: string;
  /** Fragetext. */
  text: string;
  /** Ob mehrere Antworten gleichzeitig gewählt werden dürfen. */
  allowMultiple: boolean;
  /** Liste der Antwortmöglichkeiten. */
  answers: Answer[];
}

/** Eine vollständige Umfrage mit allen Fragen und Antworten. */
export interface Survey {
  /** Eindeutige ID der Umfrage. */
  id: string;
  /** Titel der Umfrage. */
  title: string;
  /** Optionaler Beschreibungstext. */
  description?: string;
  /** Kategorie der Umfrage. */
  category: SurveyCategory;
  /** Optionales Enddatum im ISO-8601-Format. */
  endDate?: string;
  /** Erstellungsdatum im ISO-8601-Format. */
  createdAt: string;
  /** Alle Fragen der Umfrage. */
  questions: Question[];
  /** Aktueller Status der Umfrage. */
  status: 'draft' | 'published';
}

/** Eingabedaten zum Erstellen einer neuen Umfrage (ohne server-seitig generierte Felder). */
export interface SurveyInput {
  /** Titel der Umfrage. */
  title: string;
  /** Optionaler Beschreibungstext. */
  description?: string;
  /** Kategorie der Umfrage. */
  category: SurveyCategory;
  /** Optionales Enddatum im ISO-8601-Format. */
  endDate?: string;
  /** Status beim Erstellen. */
  status: 'draft' | 'published';
  /** Fragen mit ihren Antwortmöglichkeiten. */
  questions: {
    text: string;
    allowMultiple: boolean;
    answers: { text: string }[];
  }[];
}
