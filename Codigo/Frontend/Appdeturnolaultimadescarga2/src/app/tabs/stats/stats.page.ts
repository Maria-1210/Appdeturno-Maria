import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { createClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

const supabase = createClient(
  environment.supabase.url,
  environment.supabase.anonKey
);

@Component({
  selector: 'app-stats',
  standalone: true,
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule]
})
export class StatsPage {

  id_turno!: number;

  // Nuevas variables que NECESITA TU HTML
  nombreServicio: string = '';
  nombreProfesional: string = '';

  mostrarCalendario: boolean = false;

  // Datos editables
  fecha: string = '';
  hora: string = '';
  id_sucursal!: number;

  // Listas
  sucursales: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  // FECHA FORMATEADA PARA MOSTRAR EN EL INPUT
  get fechaFormateada() {
    if (!this.fecha) return '';
    const d = new Date(this.fecha);
    return d.toLocaleDateString('es-AR');
  }

  toggleCalendario() {
    this.mostrarCalendario = !this.mostrarCalendario;
  }

  actualizarFecha() {
    this.mostrarCalendario = false;
  }

  async ionViewWillEnter() {
    this.route.queryParams.subscribe(async params => {
      this.id_turno = params['id_turno'];

      await this.cargarSucursales();
      await this.cargarTurno();
    });
  }

  async cargarSucursales() {
    const { data } = await supabase.from('sucursal').select('*');
    this.sucursales = data || [];
  }

  async cargarTurno() {
    const { data } = await supabase
      .from('v_turnos_detalle')
      .select('*')
      .eq('id_turno', this.id_turno)
      .single();

    if (!data) return;

    // Mostrar títulos arriba
    this.nombreServicio = data.servicio;
    this.nombreProfesional = data.prestador;

    // Datos editables
    this.id_sucursal = data.id_sucursal;

    const inicio = new Date(data.inicio);
    this.fecha = inicio.toISOString().split('T')[0];
    this.hora = inicio.toTimeString().slice(0, 5);
  }

  async guardarCambios() {
    const inicio = new Date(`${this.fecha}T${this.hora}:00`);
    const fin = new Date(inicio.getTime() + 60 * 60 * 1000);

    const { error } = await supabase
      .from('turno')
      .update({
        id_sucursal: this.id_sucursal,
        inicio: inicio.toISOString(),
        fin: fin.toISOString()
      })
      .eq('id_turno', this.id_turno);

    if (error) {
      console.error(error);
      return;
    }
    
    window.dispatchEvent(new CustomEvent('turno_actualizado'));


    this.router.navigate(['/tabs/home']);
  }
}
