import { Component, signal, inject, effect } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { ThemeService } from './theme.service';
import { LanguageService } from './language.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly themeService = inject(ThemeService);
  protected readonly langService = inject(LanguageService);
  protected readonly title = signal('D.Çeqüella - Programação é Arte!!!');

  constructor() {
    effect(() => {
      const isPt = this.langService.lang() === 'pt';
      const newTitle = isPt
        ? 'D.Çeqüella - Programação é Arte!!!'
        : 'D.Çeqüella - Coding is Art!!!';
      document.title = newTitle;
    });
  }
}
