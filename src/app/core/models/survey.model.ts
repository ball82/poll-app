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
  description?: string;
  category: SurveyCategory;
  endDate?: string;
  createdAt: string;
  questions: Question[];
  status: 'draft' | 'published';
}

export interface SurveyInput {
  title: string;
  description?: string;
  category: SurveyCategory;
  endDate?: string;
  status: 'draft' | 'published';
  questions: {
    text: string;
    allowMultiple: boolean;
    answers: { text: string }[];
  }[];
}
