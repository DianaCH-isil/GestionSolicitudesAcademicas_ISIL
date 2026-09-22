/**
 * ============================================================================
 * MODELOS E INTERFACES - API REST GESTIÓN DE SOLICITUDES ACADÉMICAS
 * ============================================================================
 * Modelos con tipado estático riguroso y recursos ES6+ para Node.js / Express.
 */

export type EstadoSolicitud = 'Aprobada' | 'En Revisión' | 'Pendiente' | 'Rechazada';

export type CategoriaDependencia = 'asignatura' | 'dependencia' | 'proceso';

export interface Estudiante {
  id: string;
  nombre: string;
  carrera: string;
  codigo: string;
  email: string;
  avatarUrl?: string;
}

export interface SolicitudAcademica {
  id: string;
  codigoRadicado: string;
  tipoTramite: string;
  descripcionDetalle: string;
  asignaturaDependencia?: string;
  tipoDependencia?: CategoriaDependencia;
  iconoTipo?: string;
  fechaRadicacion: string;
  estado: EstadoSolicitud;
  estudiante: Estudiante;
  justificacion: string;
  comentariosRevision?: string;
  adjuntos?: string[];
}

export interface NuevaSolicitudDTO {
  tipoTramite: string;
  descripcionDetalle?: string;
  asignaturaDependencia?: string;
  tipoDependencia?: CategoriaDependencia;
  estudianteNombre?: string;
  estudianteCodigo: string;
  estudianteEmail: string;
  justificacion: string;
  aceptaTerminos: boolean;
}

export interface MetricasSolicitudes {
  total: number;
  aprobadas: number;
  enRevision: number;
  pendientes: number;
  rechazadas: number;
}
