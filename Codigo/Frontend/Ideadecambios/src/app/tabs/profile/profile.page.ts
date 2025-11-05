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

  // ✅ teléfono dividido
  codigoPais: string = '+54';
  telefono_local: string = '';
  telefonoError: boolean = false;

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

          // ✅ separar teléfono (ej: "+54 1122334455")
          const num = perfil.numero_telefono ?? '';
          if (num.startsWith('+')) {
            const parts = num.split(/\s+/, 2);
            if (parts.length === 2) {
              this.codigoPais = parts[0];
              this.telefono_local = parts[1];
            } else {
              const match = num.match(/^(\+\d{1,3})(\d+)$/);
              if (match) {
                this.codigoPais = match[1];
                this.telefono_local = match[2];
              } else {
                this.telefono_local = num;
              }
            }
          } else {
            this.telefono_local = num;
          }
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

  // ✅ Esta función limpia cualquier letra o símbolo
  validarSoloNumeros(event: any) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, ''); // Solo deja números
    this.telefono_local = input.value;
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

      // Validar DNI
      if (this.dni && !/^[0-9]{7,8}$/.test(this.dni)) {
        this.dniError = true;
        await this.mostrarToast('El DNI debe tener 7 u 8 números sin puntos 🪪', 'warning');
        return;
      } else {
        this.dniError = false;
      }

      // Validar número de teléfono
      const local = (this.telefono_local ?? '').replace(/\s+/g, '');
      if (this.telefono_local && !/^[0-9]{6,15}$/.test(local)) {
        this.telefonoError = true;
        await this.mostrarToast('Número de teléfono inválido. Usa solo números (6-15 dígitos).', 'warning');
        return;
      } else {
        this.telefonoError = false;
      }

      // ✅ Combinar país + número
      let numeroCompleto: string | null = null;
      if (local) numeroCompleto = `${this.codigoPais} ${local}`;

      const { error } = await this.supabase
        .from('usuario')
        .update({
          nombre_usuario: this.nombre_usuario,
          ubicacion: this.ubicacion,
          dni: this.dni || null,
          numero_telefono: numeroCompleto,
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
