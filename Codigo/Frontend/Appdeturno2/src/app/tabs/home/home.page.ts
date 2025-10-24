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
    { nombre: 'Mecánica', icon: 'car-outline', route: '/tabs/health', imagen: 'assets/img/avatars/avatar1.png'},
    { nombre: 'Peluquería', icon: 'cut-outline', route: '/tabs/health', imagen: 'assets/peluqueria.png' },
    { nombre: 'Veterinaria', icon: 'paw-outline', route: '/tabs/health', imagen: 'assets/img/avatars/avatar3.png' },
    { nombre: 'Servicio', icon: 'construct-outline', route: '/tabs/capture', imagen: 'assets/img/avatars/avatar4.png' },
    { nombre: 'Prestadores', icon: 'people-outline', route: '/tabs/prestador', imagen: 'assets/img/avatars/avatar5.png' },
    { nombre: 'Sucursales', icon: 'business-outline', route: '/tabs/sucursal', imagen: 'assets/img/avatars/avatar6.png' },
  ];

  goTo(route: string) {
    this.router.navigate([route]);
  }
}
