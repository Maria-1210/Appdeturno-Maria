export interface Usuario {
  id?: string;
  email?: string;
  nombre?: string;
  apellido?: string;
  dni?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  direccion?: string;
  avatar?: string;
  rol?: 'paciente' | 'admin' | 'prestador';
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UsuarioProfile extends Usuario {
  // Campos adicionales para el perfil completo
  obra_social?: string;
  numero_afiliado?: string;
  contacto_emergencia?: string;
  telefono_emergencia?: string;
}
