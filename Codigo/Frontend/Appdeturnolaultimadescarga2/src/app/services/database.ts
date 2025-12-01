import { Injectable } from '@angular/core';
import { supabase } from '../supabase';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface QueryOptions {
  orderBy?: string;
  ascending?: boolean;
  limit?: number;
  offset?: number;
}

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  // Cache de usuario actual
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.initializeUser();
  }

  private async initializeUser() {
    const user = await this.getUser();
    this.currentUserSubject.next(user);
  }

  /**
   * Obtiene todos los registros de una tabla con opciones de paginación
   */
  async getAll<T = any>(table: string, options: QueryOptions = {}): Promise<T[]> {
    try {
      let query = supabase.from(table).select('*');
      
      if (options.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending ?? true });
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error(`Error fetching from ${table}:`, error);
        throw error;
      }
      
      return (data || []) as T[];
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }

  /**
   * Obtiene un registro por ID
   */
  async getById<T = any>(table: string, id: number | string, idField: string = 'id'): Promise<T | null> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq(idField, id)
        .single();
      
      if (error) throw error;
      return data as T;
    } catch (error) {
      console.error(`Error fetching ${table} by ${idField}:`, error);
      return null;
    }
  }

  /**
   * Inserta un registro y retorna el objeto creado
   */
  async insert<T = any>(table: string, record: Partial<T>): Promise<T | null> {
    try {
      console.log(`Insertando en ${table}:`, record);
      
      const { data, error } = await supabase
        .from(table)
        .insert([record])
        .select()
        .single();
      
      if (error) {
        console.error(`Error de Supabase al insertar en ${table}:`, error);
        console.error('Detalles del error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log(`Insertado exitosamente en ${table}:`, data);
      return data as T;
    } catch (error) {
      console.error(`Error insertando en ${table}:`, error);
      throw error;
    }
  }

  /**
   * Inserta múltiples registros
   */
  async insertMany<T = any>(table: string, records: Partial<T>[]): Promise<T[]> {
    try {
      const { data, error } = await supabase
        .from(table)
        .insert(records)
        .select();
      
      if (error) throw error;
      return (data || []) as T[];
    } catch (error) {
      console.error(`Error inserting multiple into ${table}:`, error);
      throw error;
    }
  }

  /**
   * Actualiza un registro
   */
  async update<T = any>(
    table: string, 
    id: number | string, 
    record: Partial<T>, 
    idField: string = 'id'
  ): Promise<T | null> {
    try {
      const { data, error } = await supabase
        .from(table)
        .update(record)
        .eq(idField, id)
        .select()
        .single();
      
      if (error) throw error;
      return data as T;
    } catch (error) {
      console.error(`Error updating ${table}:`, error);
      throw error;
    }
  }

  /**
   * Elimina un registro
   */
  async delete(table: string, id: number | string, idField: string = 'id'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq(idField, id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting from ${table}:`, error);
      return false;
    }
  }

  /**
   * Busca registros con filtro personalizado
   */
  async search<T = any>(
    table: string, 
    column: string, 
    value: string, 
    options: QueryOptions = {}
  ): Promise<T[]> {
    try {
      let query = supabase
        .from(table)
        .select('*')
        .ilike(column, `%${value}%`);
      
      if (options.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending ?? true });
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return (data || []) as T[];
    } catch (error) {
      console.error(`Error searching ${table}:`, error);
      return [];
    }
  }

  /**
   * Cuenta registros en una tabla
   */
  async count(table: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error(`Error counting ${table}:`, error);
      return 0;
    }
  }

  /**
   * Obtiene el usuario actual (con cache)
   */
  async getUser() {
    const { data } = await supabase.auth.getUser();
    const user = data?.user ?? null;
    this.currentUserSubject.next(user);
    return user;
  }

  /**
   * Observable del usuario actual
   */
  getUserObservable(): Observable<any> {
    return this.currentUser$;
  }
}
