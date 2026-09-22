/**
 * ============================================================================
 * MODELOS E INTERFACES - GESTIÓN DE SOLICITUDES ACADÉMICAS
 * ============================================================================
 * Entidades y tipos con tipado estático riguroso y recursos ES6+.
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
  codigoRadicado: string;           // Ejemplo: 'SOL-2024-001'
  tipoTramite: string;              // Ejemplo: 'Revisión de Calificación Final'
  descripcionDetalle: string;       // Ejemplo: 'Corte 3 • Calificación 2.8 a 3.5'
  asignaturaDependencia?: string;    // Ejemplo: 'Cálculo Multivariable'
  tipoDependencia?: CategoriaDependencia; // Tipo para determinar icono visual
  iconoTipo?: string;               // Identificador de icono ('sigma' | 'flask' | 'transfer' | 'building' | 'matrix' | 'grad')
  fechaRadicacion: string;          // Ejemplo: '14 Feb 2024'
  estado: EstadoSolicitud;          // Estado actual de la solicitud
  estudiante: Estudiante;           // Información del solicitante
  justificacion: string;            // Detalle descriptivo de la solicitud
  comentariosRevision?: string;     // Observaciones del área académica
  adjuntos?: string[];              // Documentos de sustento
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
