import { Injectable } from '@angular/core';
import { supabase } from '../supabase' // tu archivo de conexión con Supabase

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  async getAll(table: string) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) throw error;
    return data;
  }

  async insert(table: string, record: any) {
    const { data, error } = await supabase.from(table).insert([record]);
    if (error) throw error;
    return data;
  }

  async update(table: string, id: number, record: any) {
    const { data, error } = await supabase.from(table).update(record).eq('id', id);
    if (error) throw error;
    return data;
  }

  async delete(table: string, id: number) {
    const { data, error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
    return data;
  }
}
