export interface Comentario {
  id?: number;
  id_comentario?: number;
  titulo?: string;
  comentario?: string;
  descripcion?: string;
  categoria?: string;
  prioridad?: 'baja' | 'media' | 'alta';
  estado?: 'pendiente' | 'en_proceso' | 'completado';
  puntuacion?: number;
  fecha_creacion?: string;
  fecha_comentario?: string;
  fecha_actualizacion?: string;
  usuario_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ComentarioStats {
  total: number;
  por_categoria: { [key: string]: number };
  por_prioridad: { [key: string]: number };
  por_estado: { [key: string]: number };
}
