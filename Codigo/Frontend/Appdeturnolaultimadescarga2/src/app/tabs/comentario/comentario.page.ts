import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonTextarea,
  IonInput,
  IonRange,
  IonButton,
  IonIcon,
  IonList,
  IonListHeader,
  IonButtons,
  IonSpinner,
  IonSearchbar,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  saveOutline,
  closeOutline,
  createOutline,
  trashOutline
} from 'ionicons/icons';
import { DatabaseService } from '../../services/database';
import { AnalyticsService } from '../../services/analytics.service';
import { Comentario } from '../../models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-comentario',
  standalone: true,
  templateUrl: './comentario.page.html',
  styleUrls: ['./comentario.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonTextarea,
    IonInput,
    IonRange,
    IonButton,
    IonIcon,
    IonList,
    IonListHeader,
    IonButtons,
    IonSpinner,
    IonSearchbar
  ]
})
export class ComentarioPage implements OnInit, OnDestroy {
  comentarios: Comentario[] = [];
  comentariosFiltrados: Comentario[] = [];
  nuevoComentario: Partial<Comentario> = { 
    comentario: '',
    titulo: '', 
    descripcion: '', 
    puntuacion: 5,
    categoria: 'general',
    prioridad: 'media',
    estado: 'pendiente'
  };
  editando: Comentario | null = null;
  userId: string = '';
  isLoading = false;
  searchTerm: string = '';
  
  private destroy$ = new Subject<void>();

  constructor(
    private db: DatabaseService, 
    private alertCtrl: AlertController,
    private analytics: AnalyticsService,
    private toastController: ToastController
  ) {
    addIcons({
      addCircleOutline,
      saveOutline,
      closeOutline,
      createOutline,
      trashOutline
    });
  }

  async ngOnInit() {
    this.analytics.trackPageView('comentarios', '/tabs/comentario');
    
    // Obtener usuario actual directamente
    const user = await this.db.getUser();
    this.userId = user?.id || '';
    
    // Suscribirse a cambios del usuario
    this.db.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.userId = user?.id || '';
      });
    
    await this.cargarComentarios();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async cargarComentarios() {
    this.isLoading = true;
    try {
      this.comentarios = await this.db.getAll<Comentario>('comentario', {
        orderBy: 'fecha_comentario',
        ascending: false
      });
      this.comentariosFiltrados = [...this.comentarios];
      this.filtrarComentarios();
      
      this.analytics.logEvent('comentarios_cargados', {
        cantidad: this.comentarios.length
      });
    } catch (error) {
      console.error('Error al cargar comentarios', error);
      await this.mostrarToast('Error al cargar comentarios', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  filtrarComentarios() {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.comentariosFiltrados = [...this.comentarios];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.comentariosFiltrados = this.comentarios.filter(c =>
        c.titulo?.toLowerCase().includes(term) ||
        (c.descripcion && c.descripcion.toLowerCase().includes(term))
      );
    }
  }

  limpiarBusqueda() {
    this.searchTerm = '';
    this.filtrarComentarios();
  }

  async guardarComentario() {
    if (!this.nuevoComentario.comentario?.trim() && !this.nuevoComentario.titulo?.trim()) {
      await this.mostrarToast('El comentario es requerido', 'warning');
      return;
    }

    this.isLoading = true;
    try {
      if (!this.userId) {
        await this.mostrarToast('Debes iniciar sesión para comentar', 'warning');
        return;
      }

      const nuevoComentarioData = {
        comentario: this.nuevoComentario.comentario || '',
        descripcion: this.nuevoComentario.descripcion || '',
        puntuacion: this.nuevoComentario.puntuacion || 5,
        usuario_id: this.userId
      };

      console.log('Insertando comentario:', nuevoComentarioData);

      const resultado = await this.db.insert<Comentario>('comentario', nuevoComentarioData);

      if (!resultado) {
        throw new Error('No se pudo crear el comentario');
      }
      
      this.analytics.trackComentarioCreated(5);
      this.analytics.logEvent('comentario_creado', {
        categoria: this.nuevoComentario.categoria
      });
      
      this.nuevoComentario = { 
        comentario: '',
        titulo: '', 
        descripcion: '',
        puntuacion: 5,
        categoria: 'general',
        prioridad: 'media',
        estado: 'pendiente'
      };
      
      await this.mostrarToast('Comentario creado exitosamente', 'success');
      await this.cargarComentarios();
    } catch (error: any) {
      console.error('Error completo al guardar comentario:', error);
      console.error('Error details:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      });
      const errorMsg = error?.message || error?.details || error?.hint || 'Error desconocido';
      await this.mostrarToast(`Error al guardar: ${errorMsg}`, 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  editar(c: Comentario) {
    this.editando = { ...c };
  }

  cancelarEdicion() {
    this.editando = null;
  }

  async actualizarComentario() {
    const updateId = this.editando?.id_comentario || this.editando?.id;
    if (!updateId) {
      await this.mostrarToast('No hay comentario para actualizar', 'warning');
      return;
    }

    if (!this.userId) {
      await this.mostrarToast('Debes iniciar sesión', 'warning');
      return;
    }

    this.isLoading = true;
    try {
      await this.db.update<Comentario>(
        'comentario',
        updateId,
        {
          comentario: this.editando?.comentario,
          descripcion: this.editando?.descripcion,
          puntuacion: this.editando?.puntuacion
        },
        'id_comentario'
      );
      
      this.analytics.logEvent('comentario_actualizado', { id: updateId });
      await this.mostrarToast('Comentario actualizado', 'success');
      this.editando = null;
      await this.cargarComentarios();
    } catch (error) {
      console.error('Error al actualizar', error);
      await this.mostrarToast('Error al actualizar comentario', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async eliminarComentario(id?: number) {
    if (!id) return;

    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: '¿Deseás eliminar este comentario?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            this.isLoading = true;
            try {
              await this.db.delete('comentario', id, 'id_comentario');
              this.analytics.logEvent('comentario_eliminado', { id });
              await this.mostrarToast('Comentario eliminado', 'success');
              await this.cargarComentarios();
            } catch (error) {
              console.error('Error al eliminar', error);
              await this.mostrarToast('Error al eliminar comentario', 'danger');
            } finally {
              this.isLoading = false;
            }
          },
        },
      ],
    });
    await alert.present();
  }

  private async mostrarToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
    });
    await toast.present();
  }

  getPrioridadColor(prioridad?: string): string {
    switch (prioridad) {
      case 'alta': return 'danger';
      case 'media': return 'warning';
      case 'baja': return 'success';
      default: return 'medium';
    }
  }

  getEstadoColor(estado?: string): string {
    switch (estado) {
      case 'completado': return 'success';
      case 'en_proceso': return 'warning';
      case 'pendiente': return 'medium';
      default: return 'medium';
    }
  }
}


