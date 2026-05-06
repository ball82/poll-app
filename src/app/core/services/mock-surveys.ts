import { Survey } from '../models/survey.model';

// Hilfsfunktion: Datum in X Tagen
function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export const MOCK_SURVEYS: Survey[] = [
  // ===== ENDING SOON (1-3 Tage) =====
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
        id: 'q1-1',
        text: 'Which date would work best for you?',
        allowMultiple: true,
        answers: [
          { id: 'a1-1-1', text: '19.09.2025, Friday', votes: 8 },
          { id: 'a1-1-2', text: '10.10.2025, Friday', votes: 13 },
          { id: 'a1-1-3', text: '11.10.2025, Saturday', votes: 1 },
          { id: 'a1-1-4', text: '31.10.2025, Friday', votes: 8 },
        ],
      },
      {
        id: 'q1-2',
        text: 'Choose the activities you prefer',
        allowMultiple: true,
        answers: [
          { id: 'a1-2-1', text: 'Outdoor adventure like kayaking', votes: 18 },
          { id: 'a1-2-2', text: 'Office Costume Party', votes: 0 },
          { id: 'a1-2-3', text: 'Bowling, mini-golf, volleyball', votes: 4 },
          { id: 'a1-2-4', text: 'Beach party, Music & cocktails', votes: 8 },
          { id: 'a1-2-5', text: 'Escape room', votes: 0 },
        ],
      },
      {
        id: 'q1-3',
        text: "What's most important to you in a team event?",
        allowMultiple: false,
        answers: [
          { id: 'a1-3-1', text: 'Team bonding', votes: 13 },
          { id: 'a1-3-2', text: 'Food and drinks', votes: 1 },
          { id: 'a1-3-3', text: 'Trying something new', votes: 8 },
          { id: 'a1-3-4', text: 'Keeping it low-key and stress-free', votes: 8 },
        ],
      },
      {
        id: 'q1-4',
        text: 'How long would you prefer the event to last?',
        allowMultiple: false,
        answers: [
          { id: 'a1-4-1', text: 'Half a day', votes: 4 },
          { id: 'a1-4-2', text: 'Full day', votes: 25 },
          { id: 'a1-4-3', text: 'Evening only', votes: 0 },
        ],
      },
    ],
  },
  {
    id: 'mock-2',
    title: 'Fit & wellness survey!',
    description:
      'Help us understand fitness and wellness preferences in the team.',
    category: 'Health & Wellness',
    endDate: daysFromNow(2),
    createdAt: daysFromNow(-3),
    status: 'published',
    questions: [
      {
        id: 'q2-1',
        text: 'How often do you exercise per week?',
        allowMultiple: false,
        answers: [
          { id: 'a2-1-1', text: 'Never', votes: 2 },
          { id: 'a2-1-2', text: '1-2 times', votes: 14 },
          { id: 'a2-1-3', text: '3-4 times', votes: 9 },
          { id: 'a2-1-4', text: '5+ times', votes: 3 },
        ],
      },
      {
        id: 'q2-2',
        text: 'What kind of workouts do you enjoy?',
        allowMultiple: true,
        answers: [
          { id: 'a2-2-1', text: 'Running / Cardio', votes: 12 },
          { id: 'a2-2-2', text: 'Yoga / Stretching', votes: 8 },
          { id: 'a2-2-3', text: 'Strength training', votes: 10 },
          { id: 'a2-2-4', text: 'Team sports', votes: 6 },
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
        id: 'q3-1',
        text: 'What is your favorite gaming platform?',
        allowMultiple: false,
        answers: [
          { id: 'a3-1-1', text: 'PC', votes: 11 },
          { id: 'a3-1-2', text: 'PlayStation', votes: 7 },
          { id: 'a3-1-3', text: 'Xbox', votes: 4 },
          { id: 'a3-1-4', text: 'Nintendo Switch', votes: 6 },
          { id: 'a3-1-5', text: 'Mobile', votes: 3 },
        ],
      },
      {
        id: 'q3-2',
        text: 'Which game genres do you like most?',
        allowMultiple: true,
        answers: [
          { id: 'a3-2-1', text: 'RPG / Adventure', votes: 15 },
          { id: 'a3-2-2', text: 'Shooter', votes: 9 },
          { id: 'a3-2-3', text: 'Strategy', votes: 7 },
          { id: 'a3-2-4', text: 'Sports / Racing', votes: 5 },
          { id: 'a3-2-5', text: 'Indie / Casual', votes: 11 },
        ],
      },
    ],
  },

  // ===== ACTIVE, weniger dringend =====
  {
    id: 'mock-4',
    title: 'Healthier future: Fit & wellness survey!',
    description:
      'Plan a healthier lifestyle together with the team.',
    category: 'Lifestyle & Preferences',
    endDate: daysFromNow(7),
    createdAt: daysFromNow(-1),
    status: 'published',
    questions: [
      {
        id: 'q4-1',
        text: 'What healthy habit do you want to build?',
        allowMultiple: true,
        answers: [
          { id: 'a4-1-1', text: 'Better sleep', votes: 8 },
          { id: 'a4-1-2', text: 'More water', votes: 5 },
          { id: 'a4-1-3', text: 'Daily walks', votes: 7 },
          { id: 'a4-1-4', text: 'Less screen time', votes: 4 },
          { id: 'a4-1-5', text: 'Meal prepping', votes: 3 },
        ],
      },
    ],
  },
  {
    id: 'mock-5',
    title: 'Which dev tools should we adopt?',
    description:
      'Vote for the tools that would improve our daily workflow the most.',
    category: 'Technology & Innovation',
    endDate: daysFromNow(10),
    createdAt: daysFromNow(-4),
    status: 'published',
    questions: [
      {
        id: 'q5-1',
        text: 'Which AI coding assistant do you prefer?',
        allowMultiple: false,
        answers: [
          { id: 'a5-1-1', text: 'GitHub Copilot', votes: 9 },
          { id: 'a5-1-2', text: 'Claude Code', votes: 12 },
          { id: 'a5-1-3', text: 'Cursor', votes: 7 },
          { id: 'a5-1-4', text: "I don't use any", votes: 2 },
        ],
      },
      {
        id: 'q5-2',
        text: 'Which IDE do you use most?',
        allowMultiple: false,
        answers: [
          { id: 'a5-2-1', text: 'VS Code', votes: 18 },
          { id: 'a5-2-2', text: 'WebStorm', votes: 4 },
          { id: 'a5-2-3', text: 'Other JetBrains', votes: 3 },
          { id: 'a5-2-4', text: 'Vim / Neovim', votes: 2 },
        ],
      },
    ],
  },
  {
    id: 'mock-6',
    title: 'Best tech learning resource?',
    category: 'Education & Learning',
    endDate: daysFromNow(14),
    createdAt: daysFromNow(-2),
    status: 'published',
    questions: [
      {
        id: 'q6-1',
        text: 'Where do you learn new tech skills?',
        allowMultiple: true,
        answers: [
          { id: 'a6-1-1', text: 'YouTube tutorials', votes: 16 },
          { id: 'a6-1-2', text: 'Online courses (Udemy, Coursera)', votes: 11 },
          { id: 'a6-1-3', text: 'Documentation', votes: 14 },
          { id: 'a6-1-4', text: 'Books', votes: 4 },
          { id: 'a6-1-5', text: 'Conferences / Meetups', votes: 6 },
        ],
      },
    ],
  },
  {
    id: 'mock-7',
    title: 'Office snacks – what should we order?',
    description: 'Help us pick the snacks for the next month.',
    category: 'Lifestyle & Preferences',
    // Kein endDate – läuft unbegrenzt
    createdAt: daysFromNow(-6),
    status: 'published',
    questions: [
      {
        id: 'q7-1',
        text: 'What kind of snacks do you prefer?',
        allowMultiple: true,
        answers: [
          { id: 'a7-1-1', text: 'Fruits', votes: 12 },
          { id: 'a7-1-2', text: 'Nuts', votes: 8 },
          { id: 'a7-1-3', text: 'Chocolate', votes: 14 },
          { id: 'a7-1-4', text: 'Chips & savory', votes: 9 },
          { id: 'a7-1-5', text: 'Healthy bars', votes: 5 },
        ],
      },
    ],
  },

  // ===== PAST SURVEYS (abgelaufen) =====
  {
    id: 'mock-8',
    title: 'Summer party – which location?',
    description: 'This survey is closed. Thanks for participating!',
    category: 'Team activities',
    endDate: daysFromNow(-3),
    createdAt: daysFromNow(-15),
    status: 'published',
    questions: [
      {
        id: 'q8-1',
        text: 'Where should we host the summer party?',
        allowMultiple: false,
        answers: [
          { id: 'a8-1-1', text: 'Park', votes: 7 },
          { id: 'a8-1-2', text: 'Restaurant', votes: 12 },
          { id: 'a8-1-3', text: 'Beach', votes: 9 },
          { id: 'a8-1-4', text: 'Office rooftop', votes: 4 },
        ],
      },
    ],
  },
  {
    id: 'mock-9',
    title: 'Favorite course of the semester',
    category: 'Education & Learning',
    endDate: daysFromNow(-7),
    createdAt: daysFromNow(-30),
    status: 'published',
    questions: [
      {
        id: 'q9-1',
        text: 'Which course did you like most?',
        allowMultiple: false,
        answers: [
          { id: 'a9-1-1', text: 'Math', votes: 5 },
          { id: 'a9-1-2', text: 'Science', votes: 11 },
          { id: 'a9-1-3', text: 'Art', votes: 6 },
          { id: 'a9-1-4', text: 'Programming', votes: 14 },
        ],
      },
    ],
  },
  {
    id: 'mock-10',
    title: 'Best pizza place near the office',
    description: 'Quick poll about lunch options.',
    category: 'Lifestyle & Preferences',
    endDate: daysFromNow(-10),
    createdAt: daysFromNow(-20),
    status: 'published',
    questions: [
      {
        id: 'q10-1',
        text: 'Which pizza place is your favorite?',
        allowMultiple: false,
        answers: [
          { id: 'a10-1-1', text: 'Pizza Mario', votes: 18 },
          { id: 'a10-1-2', text: 'Bella Napoli', votes: 9 },
          { id: 'a10-1-3', text: 'Slice & Co.', votes: 5 },
        ],
      },
    ],
  },
];