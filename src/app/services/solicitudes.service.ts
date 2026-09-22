import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {
  SolicitudAcademica,
  NuevaSolicitudDTO,
  EstadoSolicitud,
  Estudiante,
  MetricasSolicitudes
} from '../models/solicitud.model';

@Injectable({
  providedIn: 'root'
})
export class SolicitudesService {
  private readonly http = inject(HttpClient);
  public readonly apiUrl = 'http://localhost:3000/api';

  /**
   * Estado de conexión con la API REST
   */
  public readonly apiStatus = signal<'online' | 'offline' | 'loading'>('loading');
  public readonly apiError = signal<string | null>(null);
  public readonly cargando = signal<boolean>(false);

  /**
   * Registro institucional de estudiantes para vinculación y autocompletado
   */
  private readonly estudiantesRegistrados: Estudiante[] = [
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

  /**
   * Información del estudiante autenticado en sesión
   */
  private readonly estudianteActual: Estudiante = this.estudiantesRegistrados[0];

  /**
   * Datos iniciales de contingencia (fallback offline)
   */
  private readonly datosIniciales: SolicitudAcademica[] = [
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
      estudiante: this.estudianteActual,
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
      estudiante: {
        id: 'EST-2024-992',
        nombre: 'Carlos Mendoza',
        carrera: 'Ingeniería de Software',
        codigo: 'ISIL-738201',
        email: 'carlos.mendoza@isil.pe',
        avatarUrl: 'user.png'
      },
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
      estudiante: {
        id: 'EST-2024-985',
        nombre: 'Andrea Morales',
        carrera: 'Administración y Sistemas',
        codigo: 'ISIL-751094',
        email: 'andrea.morales@isil.pe',
        avatarUrl: 'user.png'
      },
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
      estudiante: this.estudianteActual,
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
      estudiante: {
        id: 'EST-2024-974',
        nombre: 'Mateo Salazar',
        carrera: 'Desarrollo de Software',
        codigo: 'ISIL-760342',
        email: 'mateo.salazar@isil.pe',
        avatarUrl: 'user.png'
      },
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
      estudiante: this.estudianteActual,
      justificacion: 'Postulación a la beca institucional de mérito académico e investigación por promedio acumulado superior a 18.5 y publicación en semillero.',
      comentariosRevision: 'Postulación recibida dentro del plazo estipulado. En revisión por el consejo de vicerrectoría.',
      adjuntos: ['articulo_semillero.pdf', 'carta_recomendacion_tutor.pdf']
    }
  ];

  // Estado reactivo con Signals (Angular moderno) y BehaviorSubject (RxJS)
  private readonly _solicitudesSignal = signal<SolicitudAcademica[]>([...this.datosIniciales]);
  private readonly _solicitudesSubject = new BehaviorSubject<SolicitudAcademica[]>([...this.datosIniciales]);

  // Readonly signal para consumo directo en componentes
  public readonly solicitudes = this._solicitudesSignal.asReadonly();

  // Observable para consumidores basados en RxJS
  public readonly solicitudes$ = this._solicitudesSubject.asObservable();

  // Signal computado para métricas globales (Uso de ES6+ reduce)
  public readonly metricas = computed<MetricasSolicitudes>(() => {
    const lista = this._solicitudesSignal();
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
  });

  /**
   * Carga las solicitudes académicas desde la API REST mediante HttpClient.
   * Si la API está activa actualiza el estado 'online'; si no responde conmuta a 'offline' sin romper la app.
   */
  public cargarSolicitudes(): Observable<SolicitudAcademica[]> {
    this.cargando.set(true);
    return this.http.get<SolicitudAcademica[]>(`${this.apiUrl}/solicitudes`).pipe(
      tap((datos) => {
        this._solicitudesSignal.set(datos);
        this._solicitudesSubject.next(datos);
        this.apiStatus.set('online');
        this.apiError.set(null);
        this.cargando.set(false);
      }),
      catchError((error) => {
        console.warn('API REST no disponible en', this.apiUrl, '- utilizando repositorio local de contingencia.', error);
        this.apiStatus.set('offline');
        this.apiError.set(`No se pudo conectar a ${this.apiUrl} (Modo Local Fallback activo)`);
        this.cargando.set(false);
        return of(this._solicitudesSignal());
      })
    );
  }

  /**
   * Obtiene la información del estudiante en sesión
   */
  public getEstudianteActual(): Estudiante {
    return { ...this.estudianteActual };
  }

  /**
   * Obtiene el listado completo de solicitudes en memoria
   */
  public getSolicitudes(): SolicitudAcademica[] {
    return [...this._solicitudesSignal()];
  }

  /**
   * Búsqueda de una solicitud por ID o código de radicado
   */
  public getSolicitudById(id: string): SolicitudAcademica | undefined {
    return this._solicitudesSignal().find((item) => item.id === id || item.codigoRadicado.toLowerCase() === id.toLowerCase());
  }

  /**
   * Búsqueda por código de radicado
   */
  public getSolicitudByRadicado(codigoRadicado: string): SolicitudAcademica | undefined {
    return this._solicitudesSignal().find((item) => item.codigoRadicado.toLowerCase() === codigoRadicado.toLowerCase());
  }

  /**
   * Búsqueda de un estudiante por su código institucional
   */
  public buscarEstudiantePorCodigo(codigo: string): Estudiante | undefined {
    if (!codigo) return undefined;
    const codLimpio = codigo.trim().toUpperCase();
    return this.estudiantesRegistrados.find((e) => e.codigo.toUpperCase() === codLimpio);
  }

  /**
   * Genera el siguiente código correlativo de radicado
   */
  public generarProximoRadicado(): string {
    const total = this._solicitudesSignal().length + 1;
    const year = new Date().getFullYear();
    const numero = String(total).padStart(3, '0');
    return `SOL-${year}-${numero}`;
  }

  /**
   * Registra una nueva solicitud académica vía API REST (con HttpClient)
   * En caso de que la API esté temporalmente offline, aplica fallback localmente.
   */
  public crearSolicitud(dto: NuevaSolicitudDTO): Observable<SolicitudAcademica> {
    return this.http.post<SolicitudAcademica>(`${this.apiUrl}/solicitudes`, dto).pipe(
      tap((nueva) => {
        const nuevaLista = [nueva, ...this._solicitudesSignal()];
        this._solicitudesSignal.set(nuevaLista);
        this._solicitudesSubject.next(nuevaLista);
        this.apiStatus.set('online');
      }),
      catchError((error) => {
        console.warn('Fallo petición POST a la API REST. Guardando localmente...', error);
        this.apiStatus.set('offline');
        const local = this.crearSolicitudLocal(dto);
        return of(local);
      })
    );
  }

  /**
   * Lógica de contingencia local para registrar solicitudes
   */
  public crearSolicitudLocal(dto: NuevaSolicitudDTO): SolicitudAcademica {
    const {
      tipoTramite,
      descripcionDetalle,
      asignaturaDependencia,
      tipoDependencia,
      estudianteNombre,
      estudianteCodigo,
      estudianteEmail,
      justificacion
    } = dto;

    const fechaFormateada = this.obtenerFechaActualFormateada();
    const proximoCodigo = this.generarProximoRadicado();
    const nuevoId = String(Date.now());

    const catDependencia = tipoDependencia || 'proceso';
    const iconoTipo = this.determinarIcono(catDependencia, tipoTramite);

    const alumnoEncontrado = this.buscarEstudiantePorCodigo(estudianteCodigo);
    const nombreFinal = alumnoEncontrado?.nombre || estudianteNombre?.trim() || this.estudianteActual.nombre;
    const carreraFinal = alumnoEncontrado?.carrera || this.estudianteActual.carrera;
    const avatarFinal = alumnoEncontrado?.avatarUrl || 'user.png';

    const nuevaSolicitud: SolicitudAcademica = {
      id: nuevoId,
      codigoRadicado: proximoCodigo,
      tipoTramite,
      descripcionDetalle: descripcionDetalle?.trim() || 'Trámite en gestión académica',
      asignaturaDependencia: asignaturaDependencia?.trim() || 'Gestión Académica Central',
      tipoDependencia: catDependencia,
      iconoTipo,
      fechaRadicacion: fechaFormateada,
      estado: 'Pendiente',
      estudiante: {
        id: alumnoEncontrado?.id || `EST-${Date.now().toString().slice(-4)}`,
        nombre: nombreFinal,
        codigo: estudianteCodigo,
        carrera: carreraFinal,
        email: estudianteEmail,
        avatarUrl: avatarFinal
      },
      justificacion,
      comentariosRevision: 'Solicitud radicada con éxito en modo local. Pendiente de asignación académica.',
      adjuntos: []
    };

    const nuevaLista = [nuevaSolicitud, ...this._solicitudesSignal()];
    this._solicitudesSignal.set(nuevaLista);
    this._solicitudesSubject.next(nuevaLista);

    return nuevaSolicitud;
  }

  /**
   * Actualiza el estado de una solicitud existente vía API REST
   */
  public actualizarEstado(id: string, nuevoEstado: EstadoSolicitud): Observable<SolicitudAcademica | boolean> {
    return this.http
      .patch<SolicitudAcademica>(`${this.apiUrl}/solicitudes/${id}/estado`, { estado: nuevoEstado })
      .pipe(
        tap((actualizada) => {
          const lista = this._solicitudesSignal().map((s) => (s.id === id ? actualizada : s));
          this._solicitudesSignal.set(lista);
          this._solicitudesSubject.next(lista);
          this.apiStatus.set('online');
        }),
        catchError(() => {
          // Fallback local
          const index = this._solicitudesSignal().findIndex((s) => s.id === id);
          if (index !== -1) {
            const lista = [...this._solicitudesSignal()];
            lista[index] = { ...lista[index], estado: nuevoEstado };
            this._solicitudesSignal.set(lista);
            this._solicitudesSubject.next(lista);
          }
          return of(true);
        })
      );
  }

  /**
   * Formatea la fecha actual al formato de la UI (ej. '21 Sep 2026')
   */
  private obtenerFechaActualFormateada(): string {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const ahora = new Date();
    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = meses[ahora.getMonth()];
    const anio = ahora.getFullYear();
    return `${dia} ${mes} ${anio}`;
  }

  /**
   * Determina el icono visual apropiado
   */
  private determinarIcono(tipoDependencia: string = '', tipoTramite: string = ''): string {
    const texto = `${tipoDependencia || ''} ${tipoTramite || ''}`.toLowerCase();
    if (texto.includes('cálculo') || texto.includes('matemática') || texto.includes('calificación')) return 'sigma';
    if (texto.includes('física') || texto.includes('laboratorio') || texto.includes('cancelación')) return 'flask';
    if (texto.includes('transferencia') || texto.includes('homologación')) return 'transfer';
    if (texto.includes('registro') || texto.includes('certificado')) return 'building';
    if (texto.includes('álgebra') || texto.includes('supletorio') || texto.includes('habilitación')) return 'matrix';
    if (texto.includes('beca') || texto.includes('vicerrectoría') || texto.includes('investigación')) return 'grad';
    return 'building';
  }
}
