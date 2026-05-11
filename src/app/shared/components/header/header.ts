import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Globale Navigation der Applikation.
 *
 * @remarks
 * Wird in der Root-Komponente eingebunden und ist auf allen Seiten sichtbar.
 * Enthält den App-Logo-Link zur Startseite und den Link zum Erstellen einer neuen Umfrage.
 */
@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {}
