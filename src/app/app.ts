import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from './theme.service';
import { LanguageService } from './language.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly themeService = inject(ThemeService);
  protected readonly langService = inject(LanguageService);
  protected readonly title = signal('art-portfolio');
}
