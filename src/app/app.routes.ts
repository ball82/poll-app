import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home').then(m => m.Home),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./features/create-survey/create-survey').then(
        m => m.CreateSurvey
      ),
  },
  {
    path: 'survey/:id',
    loadComponent: () =>
      import('./features/survey-detail/survey-detail').then(
        m => m.SurveyDetail
      ),
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];