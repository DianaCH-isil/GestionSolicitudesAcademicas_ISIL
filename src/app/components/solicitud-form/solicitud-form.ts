import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SolicitudesService } from '../../services/solicitudes.service';
import { Estudiante, NuevaSolicitudDTO } from '../../models/solicitud.model';

/**
 * Validador personalizado ES6+: Verifica que el correo pertenezca al dominio institucional (@isil.pe o @isil.edu.pe)
 */
function validadorCorreoInstitucional(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  if (!valor || typeof valor !== 'string') return null;
  const valorTrim = valor.trim().toLowerCase();
  if (!valorTrim) return null;

  // Formato de email general
  const esEmailValido = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(valorTrim);
  if (!esEmailValido) {
    return { correoInvalido: true };
  }

  // Dominio institucional ISIL
  const esDominioInstitucional = /^[a-zA-Z0-9._%+-]+@(isil\.pe|isil\.edu\.pe)$/.test(valorTrim);
  if (!esDominioInstitucional) {
    return { dominioNoInstitucional: true };
  }

  return null;
}

/**
 * Validador personalizado ES6+: Verifica que el texto no contenga solo espacios en blanco
 */
function validadorSinEspaciosVacios(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  if (valor && typeof valor === 'string' && valor.trim().length === 0) {
    return { soloEspacios: true };
  }
  return null;
}

@Component({
  selector: 'app-solicitud-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './solicitud-form.html',
  styleUrl: './solicitud-form.scss'
})
export class SolicitudForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly solicitudesService = inject(SolicitudesService);

  // Formulario Reactivo
  protected solicitudForm!: FormGroup;

  // Código correlativo calculado
  protected proximoRadicado = signal<string>('');

  // Notificación de éxito
  protected mensajeExito = signal<string | null>(null);

  // Estado de envío en curso
  protected guardando = signal<boolean>(false);

  // Estudiante detectado automáticamente a partir del código ingresado
  protected estudianteDetectado = signal<Estudiante | null>(null);

  // Opciones de trámites curriculares
  protected readonly listaTramites = [
    'Revisión de Calificación Final',
    'Cancelación Extemporánea',
    'Homologación de Créditos',
    'Certificado de Notas con Apostilla',
    'Habilitación Supletoria',
    'Beca de Excelencia e Investigación',
    'Cambio de Turno / Horario',
    'Otros'
  ];

  ngOnInit(): void {
    this.proximoRadicado.set(this.solicitudesService.generarProximoRadicado());
    this.inicializarFormulario();
  }

  private inicializarFormulario(): void {
    const estudianteActual = this.solicitudesService.getEstudianteActual();

    this.solicitudForm = this.fb.group({
      codigoRadicado: [{ value: this.proximoRadicado(), disabled: true }],
      tipoTramite: ['', [Validators.required]],
      descripcionDetalle: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(100),
          validadorSinEspaciosVacios
        ]
      ],
      estudianteCodigo: [
        estudianteActual.codigo,
        [
          Validators.required,
          Validators.pattern(/^(ISIL-\d{6}|\d{8})$/),
          validadorSinEspaciosVacios
        ]
      ],
      estudianteEmail: [
        estudianteActual.email,
        [
          Validators.required,
          Validators.email,
          validadorCorreoInstitucional
        ]
      ],
      justificacion: [
        '',
        [
          Validators.required,
          Validators.minLength(20),
          Validators.maxLength(500),
          validadorSinEspaciosVacios
        ]
      ]
    });

    // Vinculación inicial con los datos del alumno actual
    this.actualizarEstudiantePorCodigo(estudianteActual.codigo);

    // Escucha reactiva al cambiar el código para vincular datos del alumno
    this.solicitudForm.get('estudianteCodigo')?.valueChanges.subscribe((cod: string) => {
      this.actualizarEstudiantePorCodigo(cod);
    });
  }

  /**
   * Vincula automáticamente los datos del alumno en función de su código
   */
  private actualizarEstudiantePorCodigo(codigo: string): void {
    if (!codigo) {
      this.estudianteDetectado.set(null);
      return;
    }
    const encontrado = this.solicitudesService.buscarEstudiantePorCodigo(codigo);
    if (encontrado) {
      this.estudianteDetectado.set(encontrado);
      const emailCtrl = this.solicitudForm.get('estudianteEmail');
      // Si el email está vacío o no ha sido modificado manualmente, auto-rellenar con el correo institucional
      if (emailCtrl && (!emailCtrl.value || emailCtrl.pristine)) {
        emailCtrl.setValue(encontrado.email);
      }
    } else {
      this.estudianteDetectado.set(null);
    }
  }

  // Getters para facilitar validaciones en la plantilla (Recursos ES6+)
  get f() {
    return this.solicitudForm.controls;
  }

  get justificacionControl(): AbstractControl | null {
    return this.solicitudForm.get('justificacion');
  }

  get conteoCaracteres(): number {
    return this.justificacionControl?.value?.length ?? 0;
  }

  /**
   * Helper para verificar si un control tiene error y ha sido tocado
   */
  esInvalido(nombreCampo: string): boolean {
    const control = this.solicitudForm.get(nombreCampo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Helper para verificar si un control es válido y ha sido tocado
   */
  esValido(nombreCampo: string): boolean {
    const control = this.solicitudForm.get(nombreCampo);
    return !!(control && control.valid && (control.dirty || control.touched));
  }

  /**
   * Carga un escenario de prueba con datos completamente VÁLIDOS
   */
  cargarCasoValido(): void {
    this.solicitudForm.patchValue({
      tipoTramite: 'Revisión de Calificación Final',
      descripcionDetalle: 'Corte 3 • Revisión de rúbrica evaluación continua',
      estudianteCodigo: 'ISIL-742910',
      estudianteEmail: 'valeria.restrepo@isil.pe',
      justificacion: 'Solicito formalmente la revisión del entregable final de arquitectura debido a que el porcentaje de despliegue en AWS cumple con todos los criterios exigidos en la rúbrica.'
    });
    this.actualizarEstudiantePorCodigo('ISIL-742910');
    this.solicitudForm.markAllAsTouched();
    this.mensajeExito.set(null);
  }

  /**
   * Carga un escenario de prueba con datos INVÁLIDOS para evidenciar los mensajes de error
   */
  cargarCasoInvalido(): void {
    this.solicitudForm.patchValue({
      tipoTramite: '',
      descripcionDetalle: 'Ab', // Muy corto (< 5)
      estudianteCodigo: 'ABC-12', // Patrón erróneo
      estudianteEmail: 'correo-no-valido', // Email inválido
      justificacion: 'Pocos caracteres' // Muy corto (< 20)
    });
    this.actualizarEstudiantePorCodigo('ABC-12');
    this.solicitudForm.markAllAsTouched();
    this.mensajeExito.set(null);
  }

  /**
   * Limpia y reinicia el formulario
   */
  limpiarFormulario(): void {
    const estudianteActual = this.solicitudesService.getEstudianteActual();
    this.solicitudForm.reset({
      codigoRadicado: this.solicitudesService.generarProximoRadicado(),
      tipoTramite: '',
      descripcionDetalle: '',
      estudianteCodigo: estudianteActual.codigo,
      estudianteEmail: estudianteActual.email,
      justificacion: ''
    });
    this.actualizarEstudiantePorCodigo(estudianteActual.codigo);
    this.mensajeExito.set(null);
  }

  /**
   * Envío del formulario reactivo
   */
  onSubmit(): void {
    if (this.solicitudForm.invalid || this.guardando()) {
      this.solicitudForm.markAllAsTouched();
      return;
    }

    // Uso de ES6+ Object destructuring
    const formValues = this.solicitudForm.getRawValue();
    const alumno = this.estudianteDetectado();

    const dto: NuevaSolicitudDTO = {
      tipoTramite: formValues.tipoTramite,
      descripcionDetalle: formValues.descripcionDetalle,
      estudianteNombre: alumno?.nombre,
      estudianteCodigo: formValues.estudianteCodigo,
      estudianteEmail: formValues.estudianteEmail,
      justificacion: formValues.justificacion,
      aceptaTerminos: true
    };

    this.guardando.set(true);

    this.solicitudesService.crearSolicitud(dto).subscribe({
      next: (nueva) => {
        this.guardando.set(false);
        this.mensajeExito.set(`¡Solicitud ${nueva.codigoRadicado} radicada con éxito vía API REST! Redirigiendo a la bandeja...`);

        // Redirección a la bandeja tras 1.5 segundos
        setTimeout(() => {
          this.router.navigate(['/bandeja']);
        }, 1500);
      },
      error: (error) => {
        this.guardando.set(false);
        console.error('Error al registrar la solicitud:', error);
      }
    });
  }
}
