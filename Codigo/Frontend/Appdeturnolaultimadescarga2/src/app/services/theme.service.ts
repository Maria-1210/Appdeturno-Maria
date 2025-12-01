import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = false;

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme() {
    // Verificar preferencia guardada
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      this.darkMode = savedTheme === 'true';
    } else {
      // Usar preferencia del sistema
      this.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.applyTheme();

    // Escuchar cambios en las preferencias del sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (localStorage.getItem('darkMode') === null) {
        this.darkMode = e.matches;
        this.applyTheme();
      }
    });
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    this.applyTheme();
    localStorage.setItem('darkMode', String(this.darkMode));
  }

  isDarkMode(): boolean {
    return this.darkMode;
  }

  applyTheme() {
    document.body.classList.toggle('dark', this.darkMode);
  }
}
