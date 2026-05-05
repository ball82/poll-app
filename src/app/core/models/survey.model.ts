export type SurveyCategory =
  | 'Team activities'
  | 'Health & Wellness'
  | 'Gaming & Entertainment'
  | 'Education & Learning'
  | 'Lifestyle & Preferences'
  | 'Technology & Innovation';

export interface Answer {
  id: string;
  text: string;
  votes: number;
}

export interface Question {
  id: string;
  text: string;
  allowMultiple: boolean;
  answers: Answer[];
}

export interface Survey {
  id: string;
  title: string;
  description?: string;        // optional (Beschreibungstext)
  category: SurveyCategory;
  endDate?: string;            // ISO-Datum, optional
  createdAt: string;           // ISO-Datum
  questions: Question[];
  status: 'draft' | 'published';
  hasVoted?: boolean;          // damit User nur 1x abstimmt
}