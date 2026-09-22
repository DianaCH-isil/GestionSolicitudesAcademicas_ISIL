import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  Renderer2,
  SimpleChanges
} from '@angular/core';
import { EstadoSolicitud } from '../models/solicitud.model';

@Directive({
  selector: '[appStatusBadge]',
  standalone: true
})
export class StatusBadgeDirective implements OnChanges {
  @Input('appStatusBadge') estado: EstadoSolicitud | string = 'Pendiente';

  constructor(
    private readonly el: ElementRef,
    private readonly renderer: Renderer2
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['estado']) {
      this.aplicarEstilosEstado();
    }
  }

  private aplicarEstilosEstado(): void {
    const elemento = this.el.nativeElement as HTMLElement;

    // Remover clases previas
    this.renderer.removeClass(elemento, 'badge-aprobada');
    this.renderer.removeClass(elemento, 'badge-en-revision');
    this.renderer.removeClass(elemento, 'badge-pendiente');
    this.renderer.removeClass(elemento, 'badge-rechazada');

    // Mapeo dinámico de estilos usando recursos ES6+ (Template literals y Switch/Object mapping)
    const estadoNormalizado = (this.estado || '').toLowerCase().trim();

    if (estadoNormalizado.includes('aprobada')) {
      this.renderer.addClass(elemento, 'badge-aprobada');
      this.renderer.setAttribute(elemento, 'title', 'Solicitud formalmente aprobada por el comité académico');
    } else if (estadoNormalizado.includes('revisión') || estadoNormalizado.includes('revision')) {
      this.renderer.addClass(elemento, 'badge-en-revision');
      this.renderer.setAttribute(elemento, 'title', 'Trámite en evaluación técnica por la coordinación');
    } else if (estadoNormalizado.includes('rechazada')) {
      this.renderer.addClass(elemento, 'badge-rechazada');
      this.renderer.setAttribute(elemento, 'title', 'Solicitud denegada conforme a reglamento');
    } else {
      this.renderer.addClass(elemento, 'badge-pendiente');
      this.renderer.setAttribute(elemento, 'title', 'En cola de espera para asignación');
    }
  }
}
