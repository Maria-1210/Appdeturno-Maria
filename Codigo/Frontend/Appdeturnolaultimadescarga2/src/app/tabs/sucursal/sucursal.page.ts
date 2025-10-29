import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DatabaseService } from 'src/app/services/database';

@Component({
  selector: 'app-sucursal',
  standalone: true,
  templateUrl: './sucursal.page.html',
  styleUrls: ['./sucursal.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SucursalPage implements OnInit {
  sucursales: any[] = [];
  nombre = '';
  direccion = '';
  telefono = '';
  isEditing = false;
  editingId: number | null = null;
  errorMessage = '';

  constructor(private db: DatabaseService) {}

  async ngOnInit() {
    await this.loadSucursales();
  }

  async loadSucursales() {
    try {
      this.sucursales = await this.db.getAll('sucursal');
    } catch (err: any) {
      this.errorMessage = err.message;
    }
  }

  async addSucursal() {
    if (!this.nombre.trim()) {
      this.errorMessage = 'El nombre es obligatorio.';
      return;
    }
    try {
      await this.db.insert('sucursal', {
        nombre: this.nombre,
        direccion: this.direccion,
        telefono: this.telefono
      });
      this.clearForm();
      await this.loadSucursales();
    } catch (err: any) {
      this.errorMessage = err.message;
    }
  }

  editSucursal(sucursal: any) {
    this.isEditing = true;
    this.editingId = sucursal.id_sucursal;
    this.nombre = sucursal.nombre;
    this.direccion = sucursal.direccion;
    this.telefono = sucursal.telefono;
  }

  async updateSucursal() {
    try {
      await this.db.update('sucursal', this.editingId!, {
        nombre: this.nombre,
        direccion: this.direccion,
        telefono: this.telefono
      });
      this.cancelEdit();
      await this.loadSucursales();
    } catch (err: any) {
      this.errorMessage = err.message;
    }
  }

  async deleteSucursal(id: number) {
    if (confirm('¿Deseas eliminar esta sucursal?')) {
      try {
        await this.db.delete('sucursal', id);
        await this.loadSucursales();
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
    this.nombre = '';
    this.direccion = '';
    this.telefono = '';
    this.errorMessage = '';
  }
}
