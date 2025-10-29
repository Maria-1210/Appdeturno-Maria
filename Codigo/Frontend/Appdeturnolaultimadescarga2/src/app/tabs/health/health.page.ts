  import { Component, OnInit } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { FormsModule } from '@angular/forms';
  import { IonicModule } from '@ionic/angular';
  import { supabase } from '../../supabase';

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

  constructor() {}

  async ngOnInit() {
    await this.cargarUsuario();
    await this.cargarListas();
    await this.cargarTurnos();
  }

  async cargarUsuario() {
    // Asignamos manualmente el ID del usuario creado en la tabla "usuario"
    this.nuevoTurno.usuario_id = '6f6fed94-960f-4350-b961-d27b3f70be1f';
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
      .select('id_sucursal, nombre');

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

  async cargarTurnos() {
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
        sucursal:sucursal(id_sucursal, nombre)
      `)
      .eq('usuario_id', user.id)
      .order('inicio', { ascending: true });

    if (!error && data) {
      this.turnos = data.map((t: any) => ({
        ...t,
        servicio_nombre: t.servicio?.nombre || 'Sin servicio',
        prestador_nombre: t.prestador?.nombre || 'Sin profesional',
        sucursal_nombre: t.sucursal?.nombre || 'Sin sucursal'
      }));
    }
  }

  async agregarTurno() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Debes estar logueado para crear turnos.');
      return;
    }

    if (!this.nuevoTurno.id_servicio || !this.nuevoTurno.id_prestador || !this.nuevoTurno.inicio) {
      alert('Por favor completá todos los campos obligatorios.');
      return;
    }

    // Calcular fin automáticamente (1 hora después del inicio)
    const inicioDate = new Date(this.nuevoTurno.inicio);
    const finDate = new Date(inicioDate.getTime() + 60 * 60 * 1000);

    const nuevoTurnoData = {
      ...this.nuevoTurno,
      usuario_id: user.id,
      fin: finDate.toISOString(),
    };

    console.log('Datos enviados a Supabase:', nuevoTurnoData); // 🧠 Debug

    const { error } = await supabase.from('turno').insert([nuevoTurnoData]);

    if (error) {
      alert('Error al guardar el turno: ' + error.message);
      console.error(error);
    } else {
      alert('Turno guardado con éxito ✅');
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
      await this.cargarTurnos();
    }
  }
}
