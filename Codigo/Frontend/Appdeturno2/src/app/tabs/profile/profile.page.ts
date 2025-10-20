import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { supabase } from 'src/app/supabase';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ProfilePage implements OnInit {

  nombre_usuario: string = '';
  email: string = '';
  selectedAvatar: string = 'assets/avatars/default.png';
  showAvatarPicker: boolean = false;

  avatars: string[] = [
    'assets/avatars/avatar1.png',
    'assets/avatars/avatar2.png',
    'assets/avatars/avatar3.png',
    'assets/avatars/avatar4.png',
  ];

  userId: string | null = null;

  constructor(private router: Router) {}

  async ngOnInit() {
    await this.loadUserData();
  }

  async loadUserData() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.userId = user.id;

    const { data, error } = await supabase
      .from('usuario')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error cargando perfil:', error);
      return;
    }

    this.nombre_usuario = data?.nombre_usuario || '';
    this.email = data?.email || '';
    if (data?.avatar_url) {
      this.selectedAvatar = data.avatar_url;
    }
  }

  toggleAvatarSelection() {
    this.showAvatarPicker = !this.showAvatarPicker;
  }

  selectAvatar(avatar: string) {
    this.selectedAvatar = avatar;
  }

  async guardarCambios() {
    if (!this.userId) return;

    const { error } = await supabase
      .from('usuario')
      .update({
        nombre_usuario: this.nombre_usuario,
        email: this.email,
        avatar_url: this.selectedAvatar,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', this.userId);

    if (error) {
      console.error('Error guardando perfil:', error);
      alert('No se pudieron guardar los cambios.');
    } else {
      alert('Perfil actualizado correctamente.');
    }
  }

  async logout() {
    await supabase.auth.signOut();
    this.router.navigate(['/login']);
  }
}
