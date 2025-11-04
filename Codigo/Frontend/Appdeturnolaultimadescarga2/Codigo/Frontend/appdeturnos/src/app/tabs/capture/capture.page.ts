import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { supabase } from '../../supabase';

@Component({
  selector: 'app-capture',
  standalone: true,
  templateUrl: './capture.page.html',
  styleUrls: ['./capture.page.scss'],
  imports: [CommonModule, FormsModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // 👈 ESTO SOLUCIONA LOS ERRORES DE <ion-...>
})
export class CapturePage implements OnInit {
  servicios: any[] = [];
  modelo = { id_servicio: null, nombre: '', descripcion: '', duracion_minutos: null, precio: null };
  isEditing = false;
  errorMessage = '';

  constructor() {}

  async ngOnInit() {
    await this.fetchServicios();
  }

  async fetchServicios() {
    const { data, error } = await supabase.from('servicio').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error(error);
      this.errorMessage = 'Error al cargar los servicios';
    } else {
      this.servicios = data || [];
    }
  }

  validateModelo() {
    if (!this.modelo.nombre || !this.modelo.duracion_minutos || !this.modelo.precio) {
      this.errorMessage = 'Completá los campos obligatorios (nombre, duración, precio)';
      return false;
    }
    return true;
  }

  async onSubmit() {
    this.errorMessage = '';
    if (!this.validateModelo()) return;

    if (this.isEditing) {
      const { id_servicio, ...rest } = this.modelo;
      const { error } = await supabase.from('servicio').update(rest).eq('id_servicio', id_servicio);
      if (error) {
        console.error(error);
        this.errorMessage = 'No se pudo actualizar el servicio';
      } else {
        this.cancelEdit();
        await this.fetchServicios();
      }
    } else {
      const { error } = await supabase.from('servicio').insert([this.modelo]);
      if (error) {
        console.error(error);
        this.errorMessage = 'No se pudo crear el servicio';
      } else {
        this.modelo = { id_servicio: null, nombre: '', descripcion: '', duracion_minutos: null, precio: null };
        await this.fetchServicios();
      }
    }
  }

  startEdit(s: any) {
    this.modelo = { ...s };
    this.isEditing = true;
    this.errorMessage = '';
  }

  cancelEdit() {
    this.modelo = { id_servicio: null, nombre: '', descripcion: '', duracion_minutos: null, precio: null };
    this.isEditing = false;
    this.errorMessage = '';
  }

  async confirmDelete(id_servicio: number) {
    if (!confirm('¿Eliminar este servicio?')) return;
    const { error } = await supabase.from('servicio').delete().eq('id_servicio', id_servicio);
    if (error) {
      console.error(error);
      this.errorMessage = 'No se pudo eliminar';
    } else {
      await this.fetchServicios();
    }
  }
}
