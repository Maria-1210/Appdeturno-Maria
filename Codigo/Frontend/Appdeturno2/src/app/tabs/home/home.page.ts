// src/app/pages/productos/productos.page.ts
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
    { nombre: 'Mecánica', icon: 'car-outline', route: '/tabs/health' },
    { nombre: 'Peluquería', icon: 'cut-outline', route: '/tabs/health' },
    { nombre: 'Veterinaria', icon: 'paw-outline', route: '/tabs/health' },
    { nombre: 'Servicio', icon: 'construct-outline', route: '/tabs/capture' },
    { nombre: 'Prestadores', icon: 'people-outline', route: '/tabs/prestador' },
    { nombre: 'Sucursales', icon: 'business-outline', route: '/tabs/sucursal' },
  ];

  goTo(route: string) {
    this.router.navigate([route]);
  }
}
