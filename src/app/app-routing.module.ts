import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SolicitudesList } from './components/solicitudes-list/solicitudes-list';
import { SolicitudForm } from './components/solicitud-form/solicitud-form';

/**
 * Tabla de rutas de la aplicación expuesta como NgModule clásico
 * (RouterModule.forRoot) para conservar el patrón tradicional de routing
 * y, a la vez, mantener la compatibilidad con provideRouter().
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'bandeja',
    pathMatch: 'full'
  },
  {
    path: 'bandeja',
    component: SolicitudesList,
    title: 'Bandeja de Solicitudes'
  },
  {
    path: 'nueva-solicitud',
    component: SolicitudForm,
    title: 'Nueva Solicitud'
  },
  {
    path: '**',
    redirectTo: 'bandeja'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
