import express, { Request, Response } from 'express';
import cors from 'cors';
import {
  SolicitudAcademica,
  NuevaSolicitudDTO,
  EstadoSolicitud,
  Estudiante,
  MetricasSolicitudes
} from './models/solicitud.model';
import { ESTUDIANTES_INICIALES, SOLICITUDES_INICIALES } from './data/initial-data';

const app = express();
const PORT = process.env['PORT'] ? parseInt(process.env['PORT'], 10) : 3000;

// Middlewares estándar
app.use(cors({ origin: '*' }));
app.use(express.json());

// Base de datos en memoria para el servidor
let solicitudesDb: SolicitudAcademica[] = [...SOLICITUDES_INICIALES];
const estudiantesDb: Estudiante[] = [...ESTUDIANTES_INICIALES];

/**
 * Helpers y utilidades con ES6+
 */
const calcularMetricas = (lista: SolicitudAcademica[]): MetricasSolicitudes => {
  return lista.reduce<MetricasSolicitudes>(
    (acc, { estado }) => {
      acc.total++;
      if (estado === 'Aprobada') acc.aprobadas++;
      else if (estado === 'En Revisión') acc.enRevision++;
      else if (estado === 'Pendiente') acc.pendientes++;
      else if (estado === 'Rechazada') acc.rechazadas++;
      return acc;
    },
    { total: 0, aprobadas: 0, enRevision: 0, pendientes: 0, rechazadas: 0 }
  );
};

const obtenerFechaActualFormateada = (): string => {
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const ahora = new Date();
  const dia = String(ahora.getDate()).padStart(2, '0');
  const mes = meses[ahora.getMonth()];
  const anio = ahora.getFullYear();
  return `${dia} ${mes} ${anio}`;
};

const generarProximoRadicado = (): string => {
  const anio = new Date().getFullYear();
  const numero = String(solicitudesDb.length + 1).padStart(3, '0');
  return `SOL-${anio}-${numero}`;
};

const determinarIcono = (tipoDependencia: string = '', tipoTramite: string = ''): string => {
  const texto = `${tipoDependencia} ${tipoTramite}`.toLowerCase();
  if (texto.includes('cálculo') || texto.includes('matemática') || texto.includes('calificación')) return 'sigma';
  if (texto.includes('física') || texto.includes('laboratorio') || texto.includes('cancelación')) return 'flask';
  if (texto.includes('transferencia') || texto.includes('homologación')) return 'transfer';
  if (texto.includes('registro') || texto.includes('certificado')) return 'building';
  if (texto.includes('álgebra') || texto.includes('supletorio') || texto.includes('habilitación')) return 'matrix';
  if (texto.includes('beca') || texto.includes('vicerrectoría') || texto.includes('investigación')) return 'grad';
  return 'building';
};

// Middleware de registro de peticiones (Logging)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

/* ============================================================================
 * ENDPOINTS DE LA API REST
 * ============================================================================ */

/**
 * GET /api/health
 * Estado del servicio de la API REST
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    servicio: 'API REST - Gestión de Solicitudes Académicas ISIL',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    totalSolicitudes: solicitudesDb.length
  });
});

/**
 * GET /api/solicitudes
 * Retorna el listado completo de solicitudes académicas
 */
app.get('/api/solicitudes', (req: Request, res: Response) => {
  const { estado, codigoAlumno } = req.query;

  let resultado = [...solicitudesDb];

  if (typeof estado === 'string' && estado.trim().length > 0) {
    resultado = resultado.filter((s) => s.estado.toLowerCase() === estado.toLowerCase());
  }

  if (typeof codigoAlumno === 'string' && codigoAlumno.trim().length > 0) {
    resultado = resultado.filter((s) => s.estudiante.codigo.toLowerCase() === codigoAlumno.toLowerCase());
  }

  res.status(200).json(resultado);
});

/**
 * GET /api/solicitudes/:id
 * Retorna una solicitud académica específica por ID o código de radicado
 */
app.get('/api/solicitudes/:id', (req: Request, res: Response) => {
  const id = String(req.params['id'] || '');
  const encontrada = solicitudesDb.find(
    (s) => s.id === id || s.codigoRadicado.toLowerCase() === id.toLowerCase()
  );

  if (!encontrada) {
    return res.status(404).json({
      error: 'Solicitud no encontrada',
      mensaje: `No se encontró ningún trámite con identificador '${id}'`
    });
  }

  return res.status(200).json(encontrada);
});

/**
 * POST /api/solicitudes
 * Registra una nueva solicitud académica
 */
app.post('/api/solicitudes', (req: Request, res: Response) => {
  const dto: NuevaSolicitudDTO = req.body;

  // Validación de campos requeridos
  if (!dto.tipoTramite || !dto.estudianteCodigo || !dto.estudianteEmail || !dto.justificacion) {
    return res.status(400).json({
      error: 'Datos incompletos',
      mensaje: 'Los campos tipoTramite, estudianteCodigo, estudianteEmail y justificacion son obligatorios.'
    });
  }

  // Validación de aceptación de términos
  if (dto.aceptaTerminos !== true) {
    return res.status(400).json({
      error: 'Términos no aceptados',
      mensaje: 'Debe aceptar los términos y condiciones institucionales para radicar la solicitud.'
    });
  }

  // Búsqueda del estudiante registrado
  const codLimpio = dto.estudianteCodigo.trim().toUpperCase();
  const estudianteEncontrado = estudiantesDb.find((e) => e.codigo.toUpperCase() === codLimpio);

  const nombreFinal = estudianteEncontrado?.nombre || dto.estudianteNombre?.trim() || 'Estudiante ISIL';
  const carreraFinal = estudianteEncontrado?.carrera || 'Ingeniería de Sistemas';
  const avatarFinal = estudianteEncontrado?.avatarUrl || 'user.png';

  const catDependencia = dto.tipoDependencia || 'proceso';
  const iconoTipo = determinarIcono(catDependencia, dto.tipoTramite);
  const nuevoRadicado = generarProximoRadicado();
  const nuevoId = String(Date.now());

  const nuevaSolicitud: SolicitudAcademica = {
    id: nuevoId,
    codigoRadicado: nuevoRadicado,
    tipoTramite: dto.tipoTramite,
    descripcionDetalle: dto.descripcionDetalle?.trim() || 'Trámite en gestión académica',
    asignaturaDependencia: dto.asignaturaDependencia?.trim() || 'Gestión Académica Central',
    tipoDependencia: catDependencia,
    iconoTipo,
    fechaRadicacion: obtenerFechaActualFormateada(),
    estado: 'Pendiente',
    estudiante: {
      id: estudianteEncontrado?.id || `EST-${Date.now().toString().slice(-4)}`,
      nombre: nombreFinal,
      codigo: dto.estudianteCodigo.trim().toUpperCase(),
      carrera: carreraFinal,
      email: dto.estudianteEmail.trim().toLowerCase(),
      avatarUrl: avatarFinal
    },
    justificacion: dto.justificacion.trim(),
    comentariosRevision: 'Solicitud radicada con éxito vía API REST. En cola de revisión por el área académica.',
    adjuntos: []
  };

  // Inserción al inicio de la lista
  solicitudesDb = [nuevaSolicitud, ...solicitudesDb];

  return res.status(201).json(nuevaSolicitud);
});

/**
 * PATCH /api/solicitudes/:id/estado
 * Actualiza el estado de una solicitud existente
 */
app.patch('/api/solicitudes/:id/estado', (req: Request, res: Response) => {
  const id = String(req.params['id'] || '');
  const { estado, comentario } = req.body as { estado: EstadoSolicitud; comentario?: string };

  const estadosValidos: EstadoSolicitud[] = ['Aprobada', 'En Revisión', 'Pendiente', 'Rechazada'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({
      error: 'Estado inválido',
      mensaje: `El estado debe ser uno de: ${estadosValidos.join(', ')}`
    });
  }

  const index = solicitudesDb.findIndex((s) => s.id === id || s.codigoRadicado.toLowerCase() === id.toLowerCase());
  if (index === -1) {
    return res.status(404).json({
      error: 'Solicitud no encontrada',
      mensaje: `No se encontró la solicitud '${id}'`
    });
  }

  solicitudesDb[index] = {
    ...solicitudesDb[index],
    estado,
    comentariosRevision: comentario || solicitudesDb[index].comentariosRevision
  };

  return res.status(200).json(solicitudesDb[index]);
});

/**
 * GET /api/estudiantes
 * Retorna todos los estudiantes registrados
 */
app.get('/api/estudiantes', (_req: Request, res: Response) => {
  res.status(200).json(estudiantesDb);
});

/**
 * GET /api/estudiantes/:codigo
 * Busca un estudiante por su código institucional
 */
app.get('/api/estudiantes/:codigo', (req: Request, res: Response) => {
  const codigo = String(req.params['codigo'] || '');
  const codLimpio = codigo.trim().toUpperCase();
  const encontrado = estudiantesDb.find((e) => e.codigo.toUpperCase() === codLimpio);

  if (!encontrado) {
    return res.status(404).json({
      error: 'Estudiante no encontrado',
      mensaje: `No existe estudiante registrado con el código '${codigo}'`
    });
  }

  return res.status(200).json(encontrado);
});

/**
 * GET /api/metricas
 * Retorna las métricas globales calculadas con reduce
 */
app.get('/api/metricas', (_req: Request, res: Response) => {
  const metricas = calcularMetricas(solicitudesDb);
  res.status(200).json(metricas);
});

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`🚀 API REST de Solicitudes Académicas ISIL ejecutándose`);
  console.log(`📡 URL Base: http://localhost:${PORT}`);
  console.log(`📋 Endpoints disponibles:`);
  console.log(`   - GET   http://localhost:${PORT}/api/solicitudes`);
  console.log(`   - POST  http://localhost:${PORT}/api/solicitudes`);
  console.log(`   - GET   http://localhost:${PORT}/api/solicitudes/:id`);
  console.log(`   - PATCH http://localhost:${PORT}/api/solicitudes/:id/estado`);
  console.log(`   - GET   http://localhost:${PORT}/api/estudiantes`);
  console.log(`   - GET   http://localhost:${PORT}/api/metricas`);
  console.log(`   - GET   http://localhost:${PORT}/api/health`);
  console.log(`================================================================`);
});

export default app;
