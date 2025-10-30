
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HomePage {

  constructor(private router: Router) {}

  servicios = [
    { nombre: 'Turnos', icon: 'paw-outline', route: '/tabs/health', imagen: 'assets/img/turnos.png' },
    { nombre: 'Perfil', icon: 'people-outline', route: '/tabs/profile', imagen: 'assets/img/user_17766670.svg' },
    { nombre: 'Inicio', icon: 'business-outline', route: '/tabs/login', imagen: 'assets/img/log-out-outline.svg' },
  ];

  goTo(route: string) {
    this.router.navigate([route]);
  }
}
