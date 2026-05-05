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

  // State (mit Signals)
  selectedTab = signal<Tab>('active');
  selectedCategory = signal<SurveyCategory | 'All'>('All');
  isCategoryDropdownOpen = signal(false);

  // Verfügbare Kategorien für das Dropdown
  readonly categories: (SurveyCategory | 'All')[] = [
    'All',
    'Team activities',
    'Health & Wellness',
    'Gaming & Entertainment',
    'Education & Learning',
    'Lifestyle & Preferences',
    'Technology & Innovation',
  ];

  // "Ending soon" Karten oben
  endingSoon = this.surveyService.endingSoonSurveys;

  // Gefilterte Liste je nach Tab + Kategorie
  filteredSurveys = computed(() => {
    const baseList =
      this.selectedTab() === 'active'
        ? this.surveyService.activeSurveys()
        : this.surveyService.pastSurveys();

    const cat = this.selectedCategory();
    if (cat === 'All') return baseList;
    return baseList.filter(s => s.category === cat);
  });

  // Tab wechseln
  setTab(tab: Tab): void {
    this.selectedTab.set(tab);
  }

  // Kategorie wählen
  selectCategory(cat: SurveyCategory | 'All'): void {
    this.selectedCategory.set(cat);
    this.isCategoryDropdownOpen.set(false);
  }

  // Dropdown öffnen/schließen
  toggleCategoryDropdown(): void {
    this.isCategoryDropdownOpen.update(open => !open);
  }
}