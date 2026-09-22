import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitudesService } from '../../services/solicitudes.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly solicitudesService = inject(SolicitudesService);
  protected readonly estudiante = this.solicitudesService.getEstudianteActual();
}
