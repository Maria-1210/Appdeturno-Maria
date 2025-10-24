import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { supabase } from '../../supabase';
import { Router } from '@angular/router';
import { SupabaseClient } from '@supabase/supabase-js';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class ProfilePage implements OnInit {
  private supabase: SupabaseClient = supabase;

  nombre_usuario: string = '';
  email: string = '';
  ubicacion: string = '';
  dni: string = '';
  editarActivo = false;
  dniError: boolean = false;

  showAvatarMenu = false;
  selectedAvatarPath = 'assets/img/Avatars/avatar-default.svg';
  avatars = [
    { name: 'Avatar 1', path: 'assets/img/Avatars/Avatar1.svg' },
    { name: 'Avatar 2', path: 'assets/img/Avatars/Avatar2.svg' },
    { name: 'Avatar 3', path: 'assets/img/Avatars/Avatar3.svg' },
  ];

  userId: string | null = null;

  constructor(private router: Router, private toastCtrl: ToastController) {}

  async ngOnInit() {
    try {
      const { data, error } = await this.supabase.auth.getUser();
      if (error) throw error;

      if (data?.user) {
        this.userId = data.user.id;
        this.email = data.user.email ?? '';

        const { data: perfil, error: errPerfil } = await this.supabase
          .from('usuario')
          .select('*')
          .eq('user_id', this.userId)
          .single();

        if (errPerfil) {
          console.warn('No se encontró perfil en tabla usuario:', errPerfil.message);
        } else {
          this.nombre_usuario = perfil.nombre_usuario ?? '';
          this.ubicacion = perfil.ubicacion ?? '';
          this.dni = perfil.dni ?? '';
        }
      }
    } catch (error) {
      console.error('Error al obtener el usuario:', error);
    }
  }

  editarPerfil() {
    this.editarActivo = true;
  }

  cancelarEdicion() {
    this.editarActivo = false;
  }

  async mostrarToast(mensaje: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      color,
    });
    await toast.present();
  }

  async guardarCambios() {
    try {
      if (!this.userId) throw new Error('Usuario no identificado');

      // ✅ Validar formato solo si el usuario ingresó algo
      if (this.dni && !/^[0-9]{7,8}$/.test(this.dni)) {
        this.dniError = true;
        await this.mostrarToast('El DNI debe tener 7 u 8 números sin puntos 🪪', 'warning');
        return;
      } else {
        this.dniError = false;
      }

      const { error } = await this.supabase
        .from('usuario')
        .update({
          nombre_usuario: this.nombre_usuario,
          ubicacion: this.ubicacion,
          dni: this.dni || null,
        })
        .eq('user_id', this.userId);

      if (error) throw error;

      this.editarActivo = false;
      await this.mostrarToast('Perfil actualizado correctamente ✅');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      await this.mostrarToast('Error al guardar cambios ❌', 'danger');
    }
  }

  toggleAvatarMenu() {
    this.showAvatarMenu = !this.showAvatarMenu;
  }

  selectAvatar(avatar: any) {
    this.selectedAvatarPath = avatar.path;
    this.showAvatarMenu = false;
  }

  async logout() {
    try {
      await this.supabase.auth.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
