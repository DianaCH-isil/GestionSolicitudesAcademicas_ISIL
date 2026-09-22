import { Estudiante, SolicitudAcademica } from '../models/solicitud.model';

export const ESTUDIANTES_INICIALES: Estudiante[] = [
  {
    id: 'EST-2024-998',
    nombre: 'Valeria Restrepo',
    carrera: 'Ingeniería de Sistemas',
    codigo: 'ISIL-742910',
    email: 'valeria.restrepo@isil.pe',
    avatarUrl: 'user.png'
  },
  {
    id: 'EST-2024-992',
    nombre: 'Carlos Mendoza',
    carrera: 'Ingeniería de Software',
    codigo: 'ISIL-738201',
    email: 'carlos.mendoza@isil.pe',
    avatarUrl: 'user.png'
  },
  {
    id: 'EST-2024-985',
    nombre: 'Andrea Morales',
    carrera: 'Administración y Sistemas',
    codigo: 'ISIL-751094',
    email: 'andrea.morales@isil.pe',
    avatarUrl: 'user.png'
  },
  {
    id: 'EST-2024-974',
    nombre: 'Mateo Salazar',
    carrera: 'Desarrollo de Software',
    codigo: 'ISIL-760342',
    email: 'mateo.salazar@isil.pe',
    avatarUrl: 'user.png'
  }
];

export const SOLICITUDES_INICIALES: SolicitudAcademica[] = [
  {
    id: '1',
    codigoRadicado: 'SOL-2024-001',
    tipoTramite: 'Revisión de Calificación Final',
    descripcionDetalle: 'Corte 3 • Calificación 2.8 a 3.5',
    asignaturaDependencia: 'Cálculo Multivariable',
    tipoDependencia: 'asignatura',
    iconoTipo: 'sigma',
    fechaRadicacion: '14 Feb 2024',
    estado: 'Aprobada',
    estudiante: ESTUDIANTES_INICIALES[0],
    justificacion: 'Solicito la recalificación del tercer examen parcial debido a que los puntos 3 y 4 fueron evaluados con base en una rúbrica desactualizada.',
    comentariosRevision: 'Revisión efectuada por el docente titular. Se constata error en sumatoria de puntos. Nota corregida a 3.5 en sistema académico.',
    adjuntos: ['examen_parcial_3.pdf', 'solucionario_oficial.pdf']
  },
  {
    id: '2',
    codigoRadicado: 'SOL-2024-002',
    tipoTramite: 'Cancelación Extemporánea',
    descripcionDetalle: 'Causa de Fuerza Mayor Médica',
    asignaturaDependencia: 'Física Mecánica',
    tipoDependencia: 'asignatura',
    iconoTipo: 'flask',
    fechaRadicacion: '18 Feb 2024',
    estado: 'En Revisión',
    estudiante: ESTUDIANTES_INICIALES[1],
    justificacion: 'Intervención quirúrgica imprevista con orden médica de incapacidad total durante el periodo de evaluaciones.',
    comentariosRevision: 'Expediente médico remitido al comité de bienestar estudiantil para validación de certificado médico.',
    adjuntos: ['certificado_medico_clinica.pdf']
  },
  {
    id: '3',
    codigoRadicado: 'SOL-2024-003',
    tipoTramite: 'Homologación de Créditos',
    descripcionDetalle: 'Electivas de Profundización (6 cr)',
    asignaturaDependencia: 'Transferencia Externa',
    tipoDependencia: 'proceso',
    iconoTipo: 'transfer',
    fechaRadicacion: '21 Feb 2024',
    estado: 'Pendiente',
    estudiante: ESTUDIANTES_INICIALES[2],
    justificacion: 'Homologación de dos asignaturas electivas cursadas y aprobadas en el programa previo de Ingeniería de Software.',
    comentariosRevision: 'En espera del dictamen de equivalencia de contenidos por parte de la coordinación académica.',
    adjuntos: ['silabos_certificados.pdf', 'certificado_calificaciones_origen.pdf']
  },
  {
    id: '4',
    codigoRadicado: 'SOL-2024-004',
    tipoTramite: 'Certificado de Notas con Apostilla',
    descripcionDetalle: 'Trámite Bilingüe Español / Inglés',
    asignaturaDependencia: 'Registro Académico',
    tipoDependencia: 'dependencia',
    iconoTipo: 'building',
    fechaRadicacion: '10 Feb 2024',
    estado: 'Aprobada',
    estudiante: ESTUDIANTES_INICIALES[0],
    justificacion: 'Emisión de certificado oficial de notas legalizado para postulación a pasantía de investigación internacional.',
    comentariosRevision: 'Documentos emitidos con firma digital y código de validación QR. Listos para retiro o descarga.',
    adjuntos: ['comprobante_pago_derecho.pdf']
  },
  {
    id: '5',
    codigoRadicado: 'SOL-2024-005',
    tipoTramite: 'Habilitación Supletoria',
    descripcionDetalle: 'Examen extraordinario aprobado con 4.0',
    asignaturaDependencia: 'Álgebra Lineal',
    tipoDependencia: 'asignatura',
    iconoTipo: 'matrix',
    fechaRadicacion: '02 Feb 2024',
    estado: 'Aprobada',
    estudiante: ESTUDIANTES_INICIALES[3],
    justificacion: 'Habilitación supletoria por cruce de horario justificado en el calendario regular de exámenes finales.',
    comentariosRevision: 'Acta de examen extraordinario asentada satisfactoriamente con nota final 4.0.',
    adjuntos: ['acta_supletorio_firmada.pdf']
  },
  {
    id: '6',
    codigoRadicado: 'SOL-2024-006',
    tipoTramite: 'Beca de Excelencia e Investigación',
    descripcionDetalle: 'Exención 100% Matrícula Semestre',
    asignaturaDependencia: 'Vicerrectoría Académica',
    tipoDependencia: 'dependencia',
    iconoTipo: 'grad',
    fechaRadicacion: '24 Feb 2024',
    estado: 'Pendiente',
    estudiante: ESTUDIANTES_INICIALES[0],
    justificacion: 'Postulación a la beca institucional de mérito académico e investigación por promedio acumulado superior a 18.5 y publicación en semillero.',
    comentariosRevision: 'Postulación recibida dentro del plazo estipulado. En revisión por el consejo de vicerrectoría.',
    adjuntos: ['articulo_semillero.pdf', 'carta_recomendacion_tutor.pdf']
  }
];
