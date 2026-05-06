import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SurveyService } from '../../core/services/survey.service';
import { SurveyCard } from '../../shared/components/survey-card/survey-card';
import { SurveyCategory } from '../../core/models/survey.model';

type Tab = 'active' | 'past';

@Component({
  selector: 'app-home',
  imports: [RouterLink, SurveyCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private surveyService = inject(SurveyService);

  readonly selectedTab = signal<Tab>('active');
  readonly selectedCategory = signal<SurveyCategory | 'All'>('All');
  readonly isCategoryDropdownOpen = signal(false);

  readonly categories: (SurveyCategory | 'All')[] = [
    'All',
    'Team activities',
    'Health & Wellness',
    'Gaming & Entertainment',
    'Education & Learning',
    'Lifestyle & Preferences',
    'Technology & Innovation',
  ];

  readonly endingSoon = this.surveyService.endingSoonSurveys;

  readonly filteredSurveys = computed(() => {
    const baseList =
      this.selectedTab() === 'active'
        ? this.surveyService.activeSurveys()
        : this.surveyService.pastSurveys();

    const cat = this.selectedCategory();
    if (cat === 'All') return baseList;
    return baseList.filter(s => s.category === cat);
  });

  setTab(tab: Tab): void {
    this.selectedTab.set(tab);
  }

  selectCategory(cat: SurveyCategory | 'All'): void {
    this.selectedCategory.set(cat);
    this.isCategoryDropdownOpen.set(false);
  }

  toggleCategoryDropdown(): void {
    this.isCategoryDropdownOpen.update(open => !open);
  }
}
