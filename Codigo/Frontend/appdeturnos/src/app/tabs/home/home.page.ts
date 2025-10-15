import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { supabase } from '../../supabase';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HomePage implements OnInit {

  servicios: any[] = [];
  // Estructura del nuevo servicio (igual a las columnas de la tabla 'servicio')
  nuevoServicio = { nombre: '', descripcion: '', precio: 0.00, duracion_min: 0 };
  
  editando = false;
  servicioEditando: any = null;

  constructor() { }

  async ngOnInit() {
    await this.obtenerServicios();
  }

  // C R U D - Operaciones de la tabla 'servicio'

  async obtenerServicios() {
    const { data, error } = await supabase
      .from('servicio')
      .select('*')
      .order('nombre', { ascending: true }); // Ordenar por nombre

    if (error) {
      console.error('Error al obtener servicios:', error);
      return;
    }
    this.servicios = data || [];
  }

  async agregarServicio() {
    // Validar datos básicos antes de insertar (opcional pero recomendado)
    if (!this.nuevoServicio.nombre || this.nuevoServicio.precio <= 0) {
      console.error('Faltan datos o el precio no es válido.');
      return;
    }
    
    const { error } = await supabase.from('servicio').insert([this.nuevoServicio]);

    if (error) {
      console.error('Error al agregar servicio:', error);
      return;
    }
    // Limpiar el formulario y refrescar la lista
    this.nuevoServicio = { nombre: '', descripcion: '', precio: 0.00, duracion_min: 0 };
    this.obtenerServicios();
  }

  async eliminarServicio(id: number) {
    const { error } = await supabase.from('servicio').delete().eq('id_servicio', id);

    if (error) {
      console.error('Error al eliminar servicio:', error);
      return;
    }
    this.obtenerServicios();
  }
  
  // Lógica de Edición

  editarServicio(servicio: any) {
    // Clona el objeto para evitar modificar el original antes de guardar
    this.servicioEditando = { ...servicio }; 
    this.editando = true;
  }

  async guardarEdicion() {
    if (!this.servicioEditando) return;
    
    const camposActualizar = {
      nombre: this.servicioEditando.nombre,
      descripcion: this.servicioEditando.descripcion,
      precio: this.servicioEditando.precio,
      duracion_min: this.servicioEditando.duracion_min
    };

    const { error } = await supabase
      .from('servicio')
      .update(camposActualizar)
      .eq('id_servicio', this.servicioEditando.id_servicio); // Condición WHERE

    if (error) {
      console.error('Error al guardar edición:', error);
      return;
    }

    this.cancelarEdicion();
    this.obtenerServicios();
  }

  cancelarEdicion() {
    this.servicioEditando = null;
    this.editando = false;
  }
}