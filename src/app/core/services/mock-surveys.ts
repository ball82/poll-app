import { Survey } from '../models/survey.model';

// Hilfsfunktion: Datum in X Tagen
function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export const MOCK_SURVEYS: Survey[] = [
  {
    id: 'mock-1',
    title: "Let's Plan the Next Team Event Together",
    description:
      'We want to create team activities that everyone will enjoy – share your preferences and ideas in our survey to help us plan better experiences together.',
    category: 'Team activities',
    endDate: daysFromNow(1),
    createdAt: daysFromNow(-5),
    status: 'published',
    questions: [
      {
        id: 'q1',
        text: 'Which date would work best for you?',
        allowMultiple: true,
        answers: [
          { id: 'a1', text: '19.09.2025, Friday', votes: 8 },
          { id: 'a2', text: '10.10.2025, Friday', votes: 13 },
          { id: 'a3', text: '11.10.2025, Saturday', votes: 1 },
          { id: 'a4', text: '31.10.2025, Friday', votes: 8 },
        ],
      },
      {
        id: 'q2',
        text: 'Choose the activities you prefer',
        allowMultiple: true,
        answers: [
          { id: 'a5', text: 'Outdoor adventure like kayaking', votes: 18 },
          { id: 'a6', text: 'Office Costume Party', votes: 0 },
          { id: 'a7', text: 'Bowling, mini-golf, volleyball', votes: 4 },
          { id: 'a8', text: 'Beach party, Music & cocktails', votes: 8 },
          { id: 'a9', text: 'Escape room', votes: 0 },
        ],
      },
    ],
  },
  {
    id: 'mock-2',
    title: 'Fit & wellness survey!',
    description: 'Help us understand fitness and wellness preferences.',
    category: 'Health & Wellness',
    endDate: daysFromNow(2),
    createdAt: daysFromNow(-3),
    status: 'published',
    questions: [
      {
        id: 'q1',
        text: 'How often do you exercise per week?',
        allowMultiple: false,
        answers: [
          { id: 'a1', text: 'Never', votes: 2 },
          { id: 'a2', text: '1-2 times', votes: 10 },
          { id: 'a3', text: '3-4 times', votes: 5 },
          { id: 'a4', text: '5+ times', votes: 1 },
        ],
      },
    ],
  },
  {
    id: 'mock-3',
    title: 'Gaming habits and favorite games!',
    description: 'Tell us about your gaming preferences.',
    category: 'Gaming & Entertainment',
    endDate: daysFromNow(3),
    createdAt: daysFromNow(-2),
    status: 'published',
    questions: [
      {
        id: 'q1',
        text: 'What is your favorite gaming platform?',
        allowMultiple: false,
        answers: [
          { id: 'a1', text: 'PC', votes: 7 },
          { id: 'a2', text: 'PlayStation', votes: 5 },
          { id: 'a3', text: 'Xbox', votes: 3 },
          { id: 'a4', text: 'Nintendo Switch', votes: 4 },
        ],
      },
    ],
  },
  {
    id: 'mock-4',
    title: 'Healthier future: Fit & wellness survey!',
    description: 'Plan a healthier lifestyle together.',
    category: 'Lifestyle & Preferences',
    endDate: daysFromNow(2),
    createdAt: daysFromNow(-1),
    status: 'published',
    questions: [
      {
        id: 'q1',
        text: 'What healthy habit do you want to build?',
        allowMultiple: false,
        answers: [
          { id: 'a1', text: 'Better sleep', votes: 5 },
          { id: 'a2', text: 'More water', votes: 3 },
          { id: 'a3', text: 'Daily walks', votes: 4 },
        ],
      },
    ],
  },
  {
    id: 'mock-5',
    title: 'Old survey example (ended)',
    description: 'This one is already over.',
    category: 'Education & Learning',
    endDate: daysFromNow(-3),
    createdAt: daysFromNow(-10),
    status: 'published',
    questions: [
      {
        id: 'q1',
        text: 'Which course did you like most?',
        allowMultiple: false,
        answers: [
          { id: 'a1', text: 'Math', votes: 5 },
          { id: 'a2', text: 'Science', votes: 7 },
          { id: 'a3', text: 'Art', votes: 3 },
        ],
      },
    ],
  },
];