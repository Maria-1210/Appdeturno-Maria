import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { supabase } from '../../supabase';
import { Router } from '@angular/router';
import { SupabaseClient } from '@supabase/supabase-js';
import { ThemeService } from '../../services/theme.service';

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
  selectedAvatarPath = 'assets/img/Avatars/avatar-default.jpeg';
  avatars = [
    
    { name: 'Avatar 3', path: 'assets/img/Avatars/avatar3.png' },
    { name: 'Avatar 5', path: 'assets/img/Avatars/avatar5.png' },
    { name: 'Avatar 4', path: 'assets/img/Avatars/avatar6.png' },
    { name: 'Avatar 4', path: 'assets/img/Avatars/avatar4.png' },
    { name: 'Avatar 4', path: 'assets/img/Avatars/avatar7.jpeg' },
    { name: 'Avatar 4', path: 'assets/img/Avatars/avatar8.png' },
    { name: 'Avatar 4', path: 'assets/img/Avatars/avatar9.png' },
    { name: 'Avatar 4', path: 'assets/img/Avatars/avatar10.png' },
    { name: 'Avatar 4', path: 'assets/img/Avatars/avatar11.png' },
    { name: 'Avatar 4', path: 'assets/img/Avatars/avatar12.png' },
  ];

  userId: string | null = null;

  constructor(
    private router: Router, 
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    public themeService: ThemeService
  ) {}

  async ngOnInit() {
    await this.cargarDatosUsuario();
  }

  async cargarDatosUsuario() {
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
          await this.crearPerfilInicial();
        } else {
          this.nombre_usuario = perfil.nombre_usuario ?? '';
          this.ubicacion = perfil.ubicacion ?? '';
          this.dni = perfil.dni ?? '';
          // Avatar se maneja solo en el frontend
        }
      }
    } catch (error) {
      console.error('Error al obtener el usuario:', error);
      await this.mostrarToast('Error al cargar datos del usuario', 'danger');
    }
  }

  async crearPerfilInicial() {
    try {
      if (!this.userId) return;

      const { error } = await this.supabase
        .from('usuario')
        .insert({
          user_id: this.userId,
          nombre_usuario: '',
          ubicacion: '',
          dni: null,
          email: this.email,
          contrasenia: ''
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error al crear perfil inicial:', error);
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

      if (this.dni && !/^[0-9]{7,8}$/.test(this.dni)) {
        this.dniError = true;
        await this.mostrarToast('El DNI debe tener 7 u 8 números sin puntos 🪪', 'warning');
        return;
      } else {
        this.dniError = false;
      }

      const datosActualizacion = {
        user_id: this.userId,
        nombre_usuario: this.nombre_usuario,
        ubicacion: this.ubicacion,
        dni: this.dni || null,
        email: this.email,
        contrasenia: ''
      };

      console.log('Actualizando perfil:', datosActualizacion);

      const { error } = await this.supabase
        .from('usuario')
        .upsert(datosActualizacion, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      this.editarActivo = false;
      await this.mostrarToast('✅ Perfil actualizado correctamente');
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      const errorMsg = error?.message || error?.error_description || JSON.stringify(error);
      await this.mostrarToast(`❌ Error al guardar cambios: ${errorMsg}`, 'danger');
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
    const alert = await this.alertCtrl.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar Sesión',
          role: 'destructive',
          handler: async () => {
            try {
              await this.supabase.auth.signOut();
              await this.mostrarToast('👋 Sesión cerrada exitosamente', 'success');
              this.router.navigate(['/login']);
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
              await this.mostrarToast('❌ Error al cerrar sesión', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }
}

