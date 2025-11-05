import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { supabase } from 'src/app/supabase';

@Component({
  selector: 'app-health',
  templateUrl: './health.page.html',
  styleUrls: ['./health.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HealthPage implements OnInit {

  // --- Variables principales ---
  categorias: any[] = [];
  servicios: any[] = [];
  profesionales: any[] = [];
  sucursales: any[] = [];
  disponibilidad: any[] = [];
  horarios: string[] = [];
  turnos: any[] = [];

  // --- Variables seleccionadas ---
  selectedCategoria: number | null = null;
  selectedServicio: number | null = null;
  selectedPrestador: number | null = null;
  selectedSucursal: number | null = null;
  selectedDate: string = '';
  selectedHora: string = '';

  usuario_id: string = '';

  constructor() {}

  async ngOnInit() {
    await this.cargarUsuario();
    await this.loadCategorias();
    await this.cargarTurnos();
  }

  // --- Cargar usuario logueado ---
  async cargarUsuario() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) this.usuario_id = user.id;
  }

  // --- Cargar categorías de servicios ---
  async loadCategorias() {
    const { data, error } = await supabase.from('servicio_categoria').select('*');
    if (error) console.error(error);
    else this.categorias = data || [];
  }

  // --- Cargar servicios según categoría ---
  async loadServicios() {
    const { data, error } = await supabase
      .from('servicio')
      .select('*')
      .eq('id_categoria', this.selectedCategoria);

    if (error) console.error(error);
    else this.servicios = data || [];
  }

  // --- Cargar profesionales según servicio ---
  async loadProfesionales() {
    const { data, error } = await supabase
      .from('prestador')
      .select('*')
      .eq('especialidades', this.selectedServicio);

    if (error) console.error(error);
    else this.profesionales = data || [];
  }

  // --- Cargar sucursales según prestador ---
  async loadSucursales() {
    const { data, error } = await supabase
      .from('sucursal')
      .select('*');

    if (error) console.error(error);
    else this.sucursales = data || [];
  }

  // --- Cargar disponibilidad del profesional ---
  async loadDisponibilidad() {
    const { data, error } = await supabase
      .from('prestador_disponibilidad')
      .select('*')
      .eq('id_prestador', this.selectedPrestador);

    if (error) console.error(error);
    else this.disponibilidad = data || [];
  }

  // --- Cargar horarios disponibles ---
  loadHorarios() {
    if (!this.selectedDate || this.disponibilidad.length === 0) return;

    const diaSemana = new Date(this.selectedDate).getDay();
    const disp = this.disponibilidad.filter(d => d.dia_semana === diaSemana);

    this.horarios = disp.flatMap(d => {
      const start = new Date(`1970-01-01T${d.hora_inicio}`);
      const end = new Date(`1970-01-01T${d.hora_fin}`);
      const result: string[] = [];
      while (start < end) {
        result.push(start.toTimeString().substring(0, 5));
        start.setMinutes(start.getMinutes() + 30);
      }
      return result;
    });
  }

  // --- Confirmar turno ---
  async confirmarTurno() {
    if (!this.selectedHora || !this.selectedDate) {
      alert('Seleccioná una fecha y hora antes de confirmar.');
      return;
    }

    const inicio = new Date(`${this.selectedDate}T${this.selectedHora}`);
    const fin = new Date(inicio.getTime() + 60 * 60 * 1000);

    const { error } = await supabase.from('turno').insert([{
      usuario_id: this.usuario_id,
      id_servicio: this.selectedServicio,
      id_prestador: this.selectedPrestador,
      id_sucursal: this.selectedSucursal,
      inicio: inicio.toISOString(),
      fin: fin.toISOString(),
      estado: 'pendiente',
    }]);

    if (error) {
      console.error(error);
      alert('Error al confirmar turno.');
    } else {
      alert('Turno confirmado con éxito ✅');
      this.cargarTurnos();
    }
  }

  // --- Cargar turnos del usuario ---
  async cargarTurnos() {
    const { data, error } = await supabase
      .from('turno')
      .select(`
        id_turno,
        inicio,
        estado,
        servicio:servicio(nombre),
        prestador:prestador(nombre),
        sucursal:sucursal(nombre)
      `)
      .eq('usuario_id', this.usuario_id)
      .order('inicio', { ascending: true });

    if (error) console.error(error);
    else this.turnos = (data || []).map((t: any) => ({
      ...t,
      servicio_nombre: t.servicio?.nombre || 'Sin servicio',
      prestador_nombre: t.prestador?.nombre || 'Sin profesional',
      sucursal_nombre: t.sucursal?.nombre || 'Sin sucursal',
    }));
  }

  // --- Eliminar turno ---
  async eliminarTurno(id_turno: number) {
    const { error } = await supabase.from('turno').delete().eq('id_turno', id_turno);
    if (error) {
      console.error(error);
      alert('No se pudo cancelar el turno.');
    } else {
      alert('Turno cancelado correctamente ❌');
      this.cargarTurnos();
    }
  }
}
