import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitudAcademica } from '../../models/solicitud.model';
import { StatusBadgeDirective } from '../../directives/status-badge.directive';

@Component({
  selector: 'app-solicitud-detalle-modal',
  standalone: true,
  imports: [CommonModule, StatusBadgeDirective],
  templateUrl: './solicitud-detalle-modal.html',
  styleUrl: './solicitud-detalle-modal.scss'
})
export class SolicitudDetalleModal {
  @Input() solicitud: SolicitudAcademica | null = null;
  @Output() cerrar = new EventEmitter<void>();

  onCerrar(): void {
    this.cerrar.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.onCerrar();
    }
  }
}
