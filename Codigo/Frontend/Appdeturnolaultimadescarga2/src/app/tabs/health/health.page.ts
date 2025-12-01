import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { supabase } from '../../supabase';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-health',
  templateUrl: './health.page.html',
  styleUrls: ['./health.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class HealthPage implements OnInit {

  turnos: any[] = [];
  servicios: any[] = [];
  prestadores: any[] = [];
  sucursales: any[] = [];
  isLoading = false; // Estado de carga

  nuevoTurno: any = {
    usuario_id: '',
    id_servicio: null,
    id_prestador: null,
    id_sucursal: null,
    inicio: '',
    fin: '',
    estado: 'pendiente',
    notas: ''
  };

  constructor(
    private toastCtrl: ToastController,
    private analytics: AnalyticsService
  ) {}

  async ngOnInit() {
    this.analytics.trackPageView('health', '/tabs/health');
    await this.cargarUsuario();
    await this.cargarListas();
    await this.cargarTurnos();
  }

  // Usa el usuario de auth (UUID) y lo guarda en nuevoTurno.usuario_id
  async cargarUsuario() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      this.nuevoTurno.usuario_id = user.id;
    }
  }

  async cargarListas() {
    const { data: serviciosData } = await supabase
      .from('servicio')
      .select('id_servicio, nombre');

    const { data: prestadoresData } = await supabase
      .from('prestador')
      .select('id_prestador, nombre');

    const { data: sucursalesData } = await supabase
      .from('sucursal')
      .select('id_sucursal, nombre, direccion');

    this.servicios = (serviciosData || []).map(s => ({
      id: s.id_servicio,
      nombre: s.nombre
    }));

    this.prestadores = (prestadoresData || []).map(p => ({
      id: p.id_prestador,
      nombre: p.nombre
    }));

    this.sucursales = (sucursalesData || []).map(su => ({
      id: su.id_sucursal,
      nombre: su.nombre
    }));
  }

  // 🔥 Turnos pendientes = turnos FUTUROS del usuario, no cancelados
  async cargarTurnos() {
    this.isLoading = true;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('turno')
        .select(`
          id_turno,
          inicio,
          estado,
          notas,
          servicio:servicio(id_servicio, nombre),
          prestador:prestador(id_prestador, nombre),
          sucursal:sucursal(id_sucursal, nombre, direccion)
        `)
        .eq('usuario_id', user.id)
        .order('inicio', { ascending: true });

      if (error) {
        console.error('Error al cargar turnos:', error);
        return;
      }

      const ahora = new Date();

      // FUTUROS y no cancelados
      const turnosFuturos = (data || []).filter((t: any) =>
        t.estado !== 'c' &&
        t.estado !== 'cancelado' &&
        new Date(t.inicio) > ahora
      );

      this.turnos = turnosFuturos.map((t: any) => ({
        ...t,
        servicio_nombre: t.servicio?.nombre || 'Sin servicio',
        prestador_nombre: t.prestador?.nombre || 'Sin profesional',
        sucursal_nombre: t.sucursal?.nombre || 'Sin sucursal'
      }));
    } catch (error) {
      console.error('Error al cargar turnos:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async agregarTurno() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      await this.mostrarToast('Debes estar logueado para crear turnos.', 'warning');
      return;
    }

    if (!this.nuevoTurno.id_servicio || !this.nuevoTurno.id_prestador || !this.nuevoTurno.inicio) {
      await this.mostrarToast('Por favor completá todos los campos obligatorios.', 'warning');
      return;
    }

    // 1) Convertir el valor de ion-datetime a Date LOCAL (sin aplicar doble zona horaria)
    const inicioLocal = this.parseIonDatetimeToLocalDate(this.nuevoTurno.inicio);

    // 2) fin = inicio + 1 hora
    const finLocal = new Date(inicioLocal.getTime() + 60 * 60 * 1000);

    const nuevoTurnoData = {
      ...this.nuevoTurno,
      usuario_id: user.id,                // usamos el UUID de auth
      inicio: inicioLocal.toISOString(),  // se guarda en UTC correcto
      fin: finLocal.toISOString(),
    };

    const { error } = await supabase.from('turno').insert([nuevoTurnoData]);

    if (error) {
      await this.mostrarToast('Error al guardar el turno: ' + error.message, 'danger');
      this.analytics.trackError('turno_creation_error', error.message);
      console.error(error);
    } else {
      await this.mostrarToast('Turno guardado con éxito ✅', 'success');
      this.analytics.trackTurnoCreated(nuevoTurnoData);
      this.nuevoTurno = {
        usuario_id: user.id,
        id_servicio: null,
        id_prestador: null,
        id_sucursal: null,
        inicio: '',
        fin: '',
        estado: 'pendiente',
        notas: ''
      };
      await this.cargarTurnos(); // recarga pendientes abajo
    }
  }

  async mostrarToast(
    mensaje: string,
    color: 'success' | 'danger' | 'warning' = 'success'
  ) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      position: 'top',
      color: color
    });
    await toast.present();
  }

  // Interpreta el ion-datetime como hora local (Argentina) antes de pasarlo a UTC
  private parseIonDatetimeToLocalDate(value: string): Date {
    if (!value) return new Date();

    // Quita Z o el offset como -03:00 (ej: 2025-11-27T13:45:00.000Z o 2025-11-27T13:45:00.000-03:00)
    const clean = value.replace(/Z|([+-]\d{2}:\d{2})$/, '');
    const [datePart, timePart] = clean.split('T');

    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute, secondRaw] = (timePart || '00:00:00').split(':');
    const hourNum = Number(hour);
    const minuteNum = Number(minute);
    const secondNum = Number(secondRaw || 0);

    // Se interpreta como fecha/hora LOCAL (ej: Argentina)
    return new Date(year, month - 1, day, hourNum, minuteNum, secondNum);
  }
}