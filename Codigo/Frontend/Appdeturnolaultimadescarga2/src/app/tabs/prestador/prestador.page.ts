import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DatabaseService } from 'src/app/services/database';

@Component({
  selector: 'app-prestador',
  standalone: true,
  templateUrl: './prestador.page.html',
  styleUrls: ['./prestador.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PrestadorPage implements OnInit {
  prestadores: any[] = [];
  sucursales: any[] = [];

  usuario_dni = '';
  nombre = '';
  especialidades = '';
  email = '';
  numero_telefono = '';
  id_sucursal: number | null = null;

  isEditing = false;
  editingId: number | null = null;
  errorMessage = '';

  constructor(private db: DatabaseService) {}

  async ngOnInit() {
    await this.loadSucursales();
    await this.loadPrestadores();
  }

  async loadPrestadores() {
    try {
      this.prestadores = await this.db.getAll('prestador');
    } catch (err: any) {
      this.errorMessage = err.message;
    }
  }

  async loadSucursales() {
    try {
      this.sucursales = await this.db.getAll('sucursal');
    } catch (err: any) {
      console.error('Error al cargar sucursales:', err.message);
    }
  }

  getSucursalNombre(id_sucursal: number): string {
    const s = this.sucursales.find(x => x.id_sucursal === id_sucursal);
    return s ? s.nombre : 'Sin sucursal';
  }

  async addPrestador() {
    if (!this.nombre.trim()) {
      this.errorMessage = 'El nombre es obligatorio.';
      return;
    }
    try {
      await this.db.insert('prestador', {
        usuario_dni: this.usuario_dni || null,
        nombre: this.nombre,
        especialidades: this.especialidades,
        email: this.email,
        numero_telefono: this.numero_telefono,
        id_sucursal: this.id_sucursal
      });
      this.clearForm();
      await this.loadPrestadores();
    } catch (err: any) {
      this.errorMessage = err.message;
    }
  }

  editPrestador(p: any) {
    this.isEditing = true;
    this.editingId = p.id_prestador;
    this.usuario_dni = p.usuario_dni;
    this.nombre = p.nombre;
    this.especialidades = p.especialidades;
    this.email = p.email;
    this.numero_telefono = p.numero_telefono;
    this.id_sucursal = p.id_sucursal;
  }

  async updatePrestador() {
    try {
      await this.db.update('prestador', this.editingId!, {
        usuario_dni: this.usuario_dni,
        nombre: this.nombre,
        especialidades: this.especialidades,
        email: this.email,
        numero_telefono: this.numero_telefono,
        id_sucursal: this.id_sucursal
      });
      this.cancelEdit();
      await this.loadPrestadores();
    } catch (err: any) {
      this.errorMessage = err.message;
    }
  }

  async deletePrestador(id: number) {
    if (confirm('¿Deseas eliminar este prestador?')) {
      try {
        await this.db.delete('prestador', id);
        await this.loadPrestadores();
      } catch (err: any) {
        this.errorMessage = err.message;
      }
    }
  }

  cancelEdit() {
    this.clearForm();
  }

  clearForm() {
    this.isEditing = false;
    this.editingId = null;
    this.usuario_dni = '';
    this.nombre = '';
    this.especialidades = '';
    this.email = '';
    this.numero_telefono = '';
    this.id_sucursal = null;
    this.errorMessage = '';
  }
}
