import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SolicitudesService } from '../../services/solicitudes.service';
import { SolicitudAcademica } from '../../models/solicitud.model';
import { StatusBadgeDirective } from '../../directives/status-badge.directive';
import { SolicitudDetalleModal } from '../solicitud-detalle-modal/solicitud-detalle-modal';

@Component({
  selector: 'app-solicitudes-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatusBadgeDirective,
    SolicitudDetalleModal
  ],
  templateUrl: './solicitudes-list.html',
  styleUrl: './solicitudes-list.scss'
})

export class SolicitudesList implements OnInit {
  protected readonly solicitudesService = inject(SolicitudesService);

  // Consumo directo de la lista reactiva de solicitudes
  protected readonly solicitudes = this.solicitudesService.solicitudes;

  // Estado para el modal de detalle
  protected readonly solicitudSeleccionada = signal<SolicitudAcademica | null>(null);

  // Página activa
  protected readonly paginaActual = signal<number>(1);

  ngOnInit(): void {
    // Consumo inicial de la API REST mediante HttpClient
    this.solicitudesService.cargarSolicitudes().subscribe();
  }

  /**
   * Abre el modal con la información detallada del radicado
   */
  abrirDetalle(solicitud: SolicitudAcademica): void {
    this.solicitudSeleccionada.set(solicitud);
  }

  /**
   * Cierra el modal de detalle
   */
  cerrarDetalle(): void {
    this.solicitudSeleccionada.set(null);
  }
}

