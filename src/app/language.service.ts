import { Injectable, signal, effect } from '@angular/core';

export type Language = 'pt' | 'en';

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    lang = signal<Language>(this.getInitialLanguage());

    constructor() {
        effect(() => {
            localStorage.setItem('language', this.lang());
        });
    }

    toggleLanguage() {
        this.lang.update(l => l === 'pt' ? 'en' : 'pt');
    }

    private getInitialLanguage(): Language {
        const saved = localStorage.getItem('language') as Language;
        if (saved === 'pt' || saved === 'en') return saved;
        const browserLang = navigator.language.toLowerCase();
        return browserLang.startsWith('pt') ? 'pt' : 'en';
    }

    // Helper function for translations
    t(translations: { pt: string, en: string }): string {
        return translations[this.lang()];
    }
}
