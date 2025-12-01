import { Component } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { createClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

const supabase = createClient(
  environment.supabase.url,
  environment.supabase.anonKey
);

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [IonicModule, CommonModule]
})
export class HomePage {

  nombreUsuario = '';
  turnosActivos: any[] = [];
  proximoTurno: any = null;
  turnosFuturos: any[] = [];
  historial: any[] = [];

  constructor(
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  // Se ejecuta apenas se crea el componente
  ngOnInit() {
    // ESCUCHA EL EVENTO ENVIADO DESDE STATS
    window.addEventListener('turno_actualizado', async () => {
      console.log("Evento recibido: turno_actualizado → recargando turnos");
      await this.cargarTurnos();
    });
  }

  /**  SE EJECUTA CADA VEZ QUE APARECE ESTA PÁGINA */
  async ionViewWillEnter() {
    await this.cargarUsuario();
    await this.cargarTurnos();
  }

  /**  SE EJECUTA SIEMPRE DESPUÉS DE NAVEGAR A HOME */
  async ionViewDidEnter() {
    await this.cargarTurnos();
  }

  /**  Nombre del usuario */
  async cargarUsuario() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return;

    const { data, error } = await supabase
      .from('usuario')
      .select('nombre_usuario')
      .eq('email', auth.user.email)
      .single();

    if (error) {
      console.error('Error cargando usuario en Home:', error);
      return;
    }

    if (data) this.nombreUsuario = data.nombre_usuario;
  }

  /**  Carga los turnos del usuario */
  async cargarTurnos() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return;

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
      .eq('usuario_id', auth.user.id)
      .order('inicio', { ascending: true });

    if (error) {
      console.error('Error cargando turnos en Home:', error);
      return;
    }

    const ahora = new Date();

    const turnos = (data || []).map((t: any) => ({
      ...t,
      servicio: t.servicio?.nombre || 'Sin servicio',
      prestador: t.prestador?.nombre || 'Sin profesional',
      sucursal: t.sucursal?.nombre || 'Sin sucursal',
      direccion: t.sucursal?.direccion || ''
    }));

   
    // FUTUROS
    this.turnosActivos = turnos.filter(t =>
      t.estado !== 'c' &&
      t.estado !== 'cancelado' &&
      new Date(t.inicio) > ahora
    );

    // HISTORIAL
    this.historial = turnos
      .filter(t =>
        t.estado === 'c' ||
        t.estado === 'cancelado' ||
        new Date(t.inicio) <= ahora
      )
      .map(t => {
        const inicio = new Date(t.inicio);

        if (t.estado === 'c' || t.estado === 'cancelado') {
          return { ...t, estado: 'cancelado' };
        }

        if (inicio <= ahora) {
          return { ...t, estado: 'asistido' };
        }

        return { ...t, estado: 'confirmado' };
      });

    // PROXIMO
    if (this.turnosActivos.length === 0) {
      this.proximoTurno = null;
      this.turnosFuturos = [];
      return;
    }

    this.proximoTurno = this.turnosActivos[0];
    this.turnosFuturos = this.turnosActivos.slice(1);
  }

  
  editarTurno(turno: any) {
    this.router.navigate(['/tabs/stats'], {
      queryParams: { id_turno: turno.id_turno }
    });
  }

  async cancelarTurno(t: any) {
    const fecha = new Date(t.inicio).toLocaleString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });

    const alert = await this.alertCtrl.create({
      header: 'Cancelar turno',
      message: `¿Querés cancelar el turno de ${t.servicio}? ${fecha}`,
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Sí, cancelar',
          role: 'destructive',
          handler: async () => {
            await supabase
              .from('turno')
              .update({ estado: 'cancelado' })
              .eq('id_turno', t.id_turno);

            await this.cargarTurnos();
          }
        }
      ]
    });

    await alert.present();
  }

  abrirMapa(direccion: string) {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
    window.open(url, '_blank');
  }

  nuevoTurno() {
    this.router.navigate(['/tabs/health']);
  }
}
