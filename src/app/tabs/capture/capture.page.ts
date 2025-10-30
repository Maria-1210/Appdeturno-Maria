import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../../services/database';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-capture',
  templateUrl: './capture.page.html',
  styleUrls: ['./capture.page.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, IonicModule]
})
export class CapturePage implements OnInit {
  servicios: any[] = [];
  servicio: any = { nombre: '', descripcion: '', duracion_minutos: null, precio: null };
  isEditing = false;
  servicioEditandoId: number | null = null;

  constructor(private db: DatabaseService) {}

  async ngOnInit() {
    await this.cargarServicios();
  }

  async cargarServicios() {
    this.servicios = await this.db.getAll('servicio');
  }

  async agregarServicio() {
    if (!this.servicio.nombre || !this.servicio.duracion_minutos || !this.servicio.precio) {
      alert('Completa todos los campos obligatorios');
      return;
    }
    await this.db.insert('servicio', this.servicio);
    this.servicio = { nombre: '', descripcion: '', duracion_minutos: null, precio: null };
    await this.cargarServicios();
  }

  editarServicio(servicio: any) {
    this.isEditing = true;
    this.servicioEditandoId = servicio.id_servicio;
    this.servicio = { ...servicio };
  }

  async guardarEdicion() {
    if (!this.servicioEditandoId) return;
    await this.db.update('servicio', this.servicioEditandoId, this.servicio);
    this.isEditing = false;
    this.servicioEditandoId = null;
    this.servicio = { nombre: '', descripcion: '', duracion_minutos: null, precio: null };
    await this.cargarServicios();
  }

  cancelarEdicion() {
    this.isEditing = false;
    this.servicioEditandoId = null;
    this.servicio = { nombre: '', descripcion: '', duracion_minutos: null, precio: null };
  }

  async eliminarServicio(id: number) {
    if (!confirm('¿Seguro que deseas eliminar este servicio?')) return;
    await this.db.delete('servicio', id);
    await this.cargarServicios();
  }
}

