import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';

/**
 * Root-Komponente der Applikation.
 *
 * @remarks
 * Rendert den globalen Header und den `<router-outlet>` für alle Feature-Seiten.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
