import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SurveyService } from '../../core/services/survey.service';
import { SurveyCard } from '../../shared/components/survey-card/survey-card';
import { SurveyCategory } from '../../core/models/survey.model';

type Tab = 'active' | 'past';

/**
 * Startseite der Applikation.
 *
 * @remarks
 * Zeigt die drei bald ablaufenden Umfragen als Highlight-Karten,
 * eine Tab-Navigation zwischen aktiven und vergangenen Umfragen
 * sowie einen Kategorie-Filter als Dropdown.
 */
@Component({
  selector: 'app-home',
  imports: [RouterLink, SurveyCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private surveyService = inject(SurveyService);

  /** Aktiver Tab: `'active'` oder `'past'`. */
  readonly selectedTab = signal<Tab>('active');
  /** Aktuell gewählte Kategorie oder `'All'` für keine Filterung. */
  readonly selectedCategory = signal<SurveyCategory | 'All'>('All');
  /** Steuert ob das Kategorie-Dropdown offen ist. */
  readonly isCategoryDropdownOpen = signal(false);

  /** Alle wählbaren Kategorien inklusive `'All'`-Option. */
  readonly categories: (SurveyCategory | 'All')[] = [
    'All',
    'Team activities',
    'Health & Wellness',
    'Gaming & Entertainment',
    'Education & Learning',
    'Lifestyle & Preferences',
    'Technology & Innovation',
  ];

  /** Die drei Umfragen mit dem nächsten Ablaufdatum. */
  readonly endingSoon = this.surveyService.endingSoonSurveys;

  /** Gefilterte Umfragen basierend auf aktivem Tab und gewählter Kategorie. */
  readonly filteredSurveys = computed(() => {
    const baseList =
      this.selectedTab() === 'active'
        ? this.surveyService.activeSurveys()
        : this.surveyService.pastSurveys();

    const cat = this.selectedCategory();
    if (cat === 'All') return baseList;
    return baseList.filter(s => s.category === cat);
  });

  /**
   * Wechselt zwischen aktivem und vergangenem Tab.
   * @param tab - Der zu aktivierende Tab
   */
  setTab(tab: Tab): void {
    this.selectedTab.set(tab);
  }

  /**
   * Setzt die aktive Kategorie und schliesst das Dropdown.
   * @param cat - Die gewählte Kategorie oder `'All'`
   */
  selectCategory(cat: SurveyCategory | 'All'): void {
    this.selectedCategory.set(cat);
    this.isCategoryDropdownOpen.set(false);
  }

  /** Öffnet oder schliesst das Kategorie-Dropdown. */
  toggleCategoryDropdown(): void {
    this.isCategoryDropdownOpen.update(open => !open);
  }
}
