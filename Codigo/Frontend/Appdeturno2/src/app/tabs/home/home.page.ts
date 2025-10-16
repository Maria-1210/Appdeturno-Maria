// src/app/pages/productos/productos.page.ts
import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../../services/database';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [FormsModule,CommonModule, IonicModule]
})
export class HomePage {
  productos: any[] = [];
  nuevoProducto = { nombre: '', precio: 0, stock: 0 };

  editando = false;
  productoEditando: any = null;

  constructor(private db: DatabaseService) {}

  async ngOnInit() {
    await this.cargarProductos();
  }

  async cargarProductos() {
    this.productos = await this.db.getAll('productos');
  }

  async agregarProducto() {
    await this.db.insert('productos', this.nuevoProducto);
    this.nuevoProducto = { nombre: '', precio: 0, stock: 0 };
    await this.cargarProductos();
  }

  editarProducto(producto: any) {
    this.editando = true;
    this.productoEditando = { ...producto };
  }

  async guardarEdicion() {
    if (this.productoEditando && this.productoEditando.id) {
      await this.db.update('productos', this.productoEditando.id, this.productoEditando);
      this.editando = false;
      this.productoEditando = null;
      await this.cargarProductos();
    }
  }

  async eliminarProducto(id: number) {
    await this.db.delete('productos', id);
    await this.cargarProductos();
  }
}
