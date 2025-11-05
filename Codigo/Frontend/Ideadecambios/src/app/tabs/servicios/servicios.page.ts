import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-servicios',
  templateUrl: './servicios.page.html',
  styleUrls: ['./servicios.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ServiciosPage {
  categorias = [
    { nombre: 'Medicina', tipo: 'medicina', imagen: 'assets/img/medicina.png' },
    { nombre: 'Veterinaria', tipo: 'veterinaria', imagen: 'assets/img/veterinaria.png' },
    { nombre: 'Estética', tipo: 'estetica', imagen: 'assets/img/estetica.png' }
  ];

  constructor(private router: Router) {}

  irAHealth(tipo: string) {
    this.router.navigate(['/tabs/health'], { queryParams: { tipo } });
  }
}
