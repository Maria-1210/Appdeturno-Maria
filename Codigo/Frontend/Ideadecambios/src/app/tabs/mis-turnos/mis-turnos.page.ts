import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { supabase } from '../../supabase';

@Component({
  selector: 'app-mis-turnos',
  templateUrl: './mis-turnos.page.html',
  styleUrls: ['./mis-turnos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class MisTurnosPage implements OnInit {
  turnos: any[] = [];

  constructor() {}

  async ngOnInit() {
    await this.cargarTurnos();
  }

  // ==============================
  // 📥 Cargar turnos del usuario logueado
  // ==============================
  async cargarTurnos() {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Usuario no logueado:', userError);
      return;
    }

    const { data, error } = await supabase
      .from('turno')
      .select(`
        id_turno,
        inicio,
        fin,
        estado,
        notas,
        servicio (nombre),
        prestador (nombre),
        sucursal (nombre)
      `)
      .eq('usuario_id', user.id)
      .order('inicio', { ascending: true });

    if (error) {
      console.error('Error al cargar turnos:', error);
      return;
    }

    // Mapeo para estructurar los datos correctamente
    this.turnos = (data || []).map((t: any) => ({
      id_turno: t.id_turno,
      servicio_nombre: t.servicio?.nombre || 'Sin servicio',
      prestador_nombre: t.prestador?.nombre || 'Sin profesional',
      sucursal_nombre: t.sucursal?.nombre || 'Sin sucursal',
      inicio: t.inicio,
      fin: t.fin,
      estado: t.estado,
      notas: t.notas || '',
    }));
  }

  // ==============================
  // ❌ Cancelar turno
  // ==============================
  async cancelarTurno(id_turno: number) {
    const confirmar = confirm('¿Deseas cancelar este turno?');
    if (!confirmar) return;

    const { error } = await supabase
      .from('turno')
      .update({ estado: 'cancelado' })
      .eq('id_turno', id_turno);

    if (error) {
      alert('Error al cancelar el turno: ' + error.message);
    } else {
      alert('Turno cancelado correctamente.');
      await this.cargarTurnos();
    }
  }

  // ==============================
  // ✏️ Editar notas o reprogramar (opcional)
  // ==============================
  async editarTurno(turno: any) {
    const nuevaNota = prompt('Modificar notas del turno:', turno.notas || '');
    if (nuevaNota === null) return;

    const { error } = await supabase
      .from('turno')
      .update({ notas: nuevaNota })
      .eq('id_turno', turno.id_turno);

    if (error) {
      alert('Error al modificar el turno: ' + error.message);
    } else {
      alert('Turno actualizado correctamente.');
      await this.cargarTurnos();
    }
  }
}
