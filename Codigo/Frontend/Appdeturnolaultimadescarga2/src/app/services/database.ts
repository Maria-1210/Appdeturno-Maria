import { Injectable } from '@angular/core';
import { supabase } from '../supabase';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  // 🔹 Obtener todos los registros de una tabla
  async getAll(table: string) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) throw error;
    return data;
  }

  // 🔹 Insertar un nuevo registro
  async insert(table: string, record: any) {
    const { data, error } = await supabase.from(table).insert([record]);
    if (error) throw error;
    return data;
  }

  // 🔹 Actualizar un registro
  async update(table: string, id: number, record: any) {
    const idColumn = this.getIdColumn(table);
    const { data, error } = await supabase
      .from(table)
      .update(record)
      .eq(idColumn, id);
    if (error) throw error;
    return data;
  }

  // 🔹 Eliminar un registro
  async delete(table: string, id: number) {
    const idColumn = this.getIdColumn(table);
    const { data, error } = await supabase
      .from(table)
      .delete()
      .eq(idColumn, id);
    if (error) throw error;
    return data;
  }

  // 🧠 Detecta el nombre correcto del campo ID según la tabla
  private getIdColumn(table: string): string {
    switch (table) {
      case 'servicio':
        return 'id_servicio';
      case 'prestador':
        return 'id_prestador';
      case 'sucursal':
        return 'id_sucursal';
      case 'usuario_prestador':
        return 'id_representante';
      case 'prestador_disponibilidad':
        return 'id_disponibilidad';
      case 'turno':
        return 'id_turno';
      case 'usuario':
        return 'user_id';
      default:
        return 'id'; // fallback genérico si alguna tabla futura usa 'id'
    }
  }
}
