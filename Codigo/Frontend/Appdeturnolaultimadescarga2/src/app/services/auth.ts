// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { supabase } from '../supabase';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

export interface AuthUser {
  id: string;
  email?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private authStateSubject = new BehaviorSubject<AuthUser | null>(null);
  public authState$ = this.authStateSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private router: Router) {
    this.initializeAuth();
  }

  /**
   * Inicializa el estado de autenticación y escucha cambios
   */
  private async initializeAuth() {
    // Verificar sesión actual
    const { data } = await supabase.auth.getSession();
    const user = data?.session?.user || null;
    this.authStateSubject.next(user);
    this.isAuthenticatedSubject.next(!!user);

    // Escuchar cambios en auth
    supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user || null;
      this.authStateSubject.next(currentUser);
      this.isAuthenticatedSubject.next(!!currentUser);

      // Redirigir según el evento
      if (event === 'SIGNED_OUT') {
        this.router.navigate(['/login']);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Opcional: redirigir a home
      }
    });
  }

  /**
   * Login con email y contraseña
   */
  async login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Unexpected login error:', error);
      return { data: null, error };
    }
  }

  /**
   * Registro de nuevo usuario
   */
  async signUp(email: string, password: string, metadata?: any) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {}
        }
      });

      if (error) {
        console.error('Signup error:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Unexpected signup error:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtiene la sesión actual
   */
  async getCurrentSession() {
    try {
      return await supabase.auth.getSession();
    } catch (error) {
      console.error('Error getting session:', error);
      return { data: { session: null }, error };
    }
  }

  /**
   * Obtiene el usuario actual
   */
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  /**
   * Cierra sesión
   */
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      this.authStateSubject.next(null);
      this.isAuthenticatedSubject.next(false);
      this.router.navigate(['/login']);
      
      return { error: null };
    } catch (error) {
      console.error('Logout error:', error);
      return { error };
    }
  }

  /**
   * Refresca el token de sesión
   */
  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Refresh session error:', error);
      return { data: null, error };
    }
  }

  /**
   * Solicita reset de contraseña
   */
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error };
    }
  }

  /**
   * Actualiza la contraseña
   */
  async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Update password error:', error);
      return { error };
    }
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Obtiene el token de acceso actual
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token || null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }
}
