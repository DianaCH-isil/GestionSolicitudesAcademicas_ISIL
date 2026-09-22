# Arquitectura y decisiones de estructura

Documento que registra las decisiones de diseño adoptadas en el proyecto
**GestionSolicitudesAcademicas_ISIL**, en el marco de la Actividad 1
("Base tipada y modular del caso").

## 1. Capas del proyecto

El proyecto se divide en dos procesos independientes y dos carpetas de código:

```
/                           # workspace raíz
├── src/                    # frontend (Angular)
└── server/                 # backend (Express + TS)
```

Cada proceso tiene su propio `tsconfig.json` y su propio `package.json` lógicos
(gestionados desde el `package.json` raíz mediante scripts npm). Esto permite
compilarlos, versionarlos y desplegarlos por separado.

## 2. Capa de dominio (`models/`)

Las entidades principales se definen como **interfaces TypeScript** y se
exportan tanto desde `src/app/models/solicitud.model.ts` como desde
`server/src/models/solicitud.model.ts`. Se mantienen dos copias por las
siguientes razones:

- El frontend y el backend son procesos independientes: no comparten el árbol
  de código fuente en tiempo de compilación.
- Cada lado aplica tipado estático con `strict: true` y mensajes de error
  contextualizados a su runtime (Angular / Node).
- La forma de los modelos coincide 1:1 con el contrato REST (JSON). Cualquier
  divergencia se detecta en el endpoint de la API.

Entidades definidas:

- `SolicitudAcademica`: tramite académico radicado.
- `Estudiante`: datos del solicitante.
- `NuevaSolicitudDTO`: cuerpo del `POST /api/solicitudes`.
- `EstadoSolicitud`: unión tipada de cuatro valores posibles
  (`Aprobada`, `En Revisión`, `Pendiente`, `Rechazada`).
- `CategoriaDependencia`: tipado del ícono visual por categoría.
- `MetricasSolicitudes`: agregados calculados en el servidor.

## 3. Capa de servicio (`services/`)

`SolicitudesService` (`src/app/services/solicitudes.service.ts`) concentra
toda la lógica de acceso a datos del frontend. Se declara como `@Injectable({
providedIn: 'root' })`, por lo que existe una única instancia para toda la
aplicación (patrón singleton).

Responsabilidades:

- Consumir la API REST mediante `HttpClient`.
- Exponer el estado reactivo (`signal` + `BehaviorSubject`).
- Calcular métricas locales con `Array.prototype.reduce`.
- Aplicar fallback automático si la API no responde.
- Generar códigos de radicado correlativos en modo local.

### 3.1. Estado reactivo: Signals + RxJS

Se combinan dos enfoques para que cada consumidor pueda elegir:

| Mecanismo         | Uso típico                                                |
|-------------------|-----------------------------------------------------------|
| `signal()`        | Vistas basadas en plantillas (`@if`, `@for`, interpolación). |
| `BehaviorSubject` | Componentes que requieren suscripción imperativa.         |
| `computed()`      | Métricas agregadas derivadas del estado.                  |

La fuente de verdad única es el `_solicitudesSignal`. Tras cada actualización
se sincroniza con `_solicitudesSubject` mediante `next()`, de forma que ambos
mecanismos reflejen el mismo conjunto de datos.

### 3.2. Fallback offline

Cuando una petición HTTP falla (`catchError` de RxJS), el servicio:

1. Marca `apiStatus` como `'offline'`.
2. Conserva el repositorio local (`datosIniciales` + cualquier radicado local).
3. Devuelve el último estado conocido a los componentes suscritos.
4. Muestra un aviso en la cabecera de la bandeja.

De este modo la aplicación nunca queda en blanco si la API no está disponible:
degrada con elegancia hacia el modo local.

## 4. Capa de presentación (`components/`)

La UI sigue el principio de **separación de responsabilidades**. Cada componente
tiene tres archivos:

- `*.ts`: clase con la lógica del componente.
- `*.html`: plantilla declarativa.
- `*.scss`: estilos encapsulados.

Componentes:

| Componente              | Ruta                 | Responsabilidad                                          |
|-------------------------|----------------------|----------------------------------------------------------|
| `Header`                | (layout)             | Cabecera superior con datos del estudiante en sesión.    |
| `Sidebar`               | (layout)             | Navegación principal e identidad institucional.          |
| `Footer`                | (layout)             | Pie de página.                                           |
| `SolicitudesList`       | `/bandeja`           | Bandeja de radicados con tabla y métricas.               |
| `SolicitudForm`         | `/nueva-solicitud`   | Formulario reactivo con validaciones.                    |
| `SolicitudDetalleModal` | (modal)              | Detalle completo de un radicado seleccionado.            |

`App` (`src/app/app.ts`) ensambla `Header`, `Sidebar`, `Footer` y
`<router-outlet>` como composición de layout. Los componentes son
**standalone** (Angular 14+) e importan únicamente lo necesario.

## 5. Routing

La tabla de rutas se centraliza en
[`src/app/app-routing.module.ts`](../src/app/app-routing.module.ts), declarado
como `@NgModule` clásico para mantener la compatibilidad conceptual con la
métrica tradicional de Angular 16 (NgModules). El array de rutas se reexporta
desde [`src/app/app.routes.ts`](../src/app/app.routes.ts) para que el provider
`provideRouter` siga funcionando. Esta configuración dual evita romper el
arranque de la aplicación y, al mismo tiempo, expone un módulo de routing
explícito.

Rutas activas:

- `''` redirige a `'bandeja'`.
- `'bandeja'` carga `SolicitudesList`.
- `'nueva-solicitud'` carga `SolicitudForm`.
- `'**'` redirige a `'bandeja'` (catch-all).

## 6. Directivas

`StatusBadgeDirective`
(`src/app/directives/status-badge.directive.ts`) aplica clases CSS
dinámicamente al elemento host según el estado de la solicitud. Se eligió
implementarla como directiva (en lugar de un componente o un pipe) porque:

- No genera contenido propio: sólo modifica atributos del elemento host.
- Se aplica con un solo atributo (`[appStatusBadge]`) en cualquier elemento,
  manteniendo la sintaxis declarativa.
- Permite aislar la lógica de presentación (clases + `title`) del componente
  que muestra los datos.

## 7. Formulario reactivo y validaciones

`SolicitudForm` utiliza `ReactiveFormsModule` con un `FormGroup` definido
explícitamente en `ngOnInit`. Los validadores se organizan en tres categorías:

| Categoría                | Validador                                     |
|--------------------------|-----------------------------------------------|
| Built-in                 | `Validators.required`, `Validators.minLength`, `Validators.maxLength`, `Validators.pattern`, `Validators.email`, `Validators.requiredTrue`. |
| Personalizado            | `validadorCorreoInstitucional`: restringe el dominio a `@isil.pe` o `@isil.edu.pe`. |
| Personalizado            | `validadorSinEspaciosVacios`: rechaza strings que contengan sólo espacios. |

Los mensajes de error se muestran únicamente cuando el control es inválido
**y** fue tocado (`touched`) o modificado (`dirty`), evitando mostrar
advertencias sobre campos todavía no editados.

## 8. Tipado estático

El proyecto aplica `strict: true` en ambos procesos. En el frontend, además,
se activan:

- `noImplicitOverride`
- `noPropertyAccessFromIndexSignature`
- `noImplicitReturns`
- `noFallthroughCasesInSwitch`
- `strictTemplates`
- `strictInputAccessModifiers`
- `typeCheckHostBindings`
- `strictInjectionParameters`

Estas opciones provocan errores de compilación ante cualquier atajo que
relaje el contrato entre plantilla y clase, lo que resulta especialmente
útil en componentes con `@Input` y `@Output`.

## 9. Recursos ES6+ empleados

A lo largo del código se utilizan los siguientes recursos, todos cubiertos en
la sesión 1 del curso:

- **Clases** (`class SolicitudesService`, `class SolicitudForm`).
- **Arrow functions** en helpers y operadores RxJS.
- **Template literals** para mensajes y construcción de strings de radicado.
- **Destructuring** en handlers (`{ estado } => ...`).
- **Spread operator** (`{ ...this.estudianteActual }`).
- **Rest parameters** en acumuladores `reduce`.
- **Módulos ES** (`import`/`export`) en todos los archivos.
- **Métodos funcionales de `Array`**: `map`, `filter`, `reduce`, `find`,
  `findIndex`, `some`, `forEach`.
- **Promesas / `async`** mediante `HttpClient` (que devuelve `Observable`).
- **Parámetros por defecto** (`obtenerFechaActualFormateada()`, `determinarIcono()`).
- **Encadenamiento opcional** (`emailCtrl?.value`).

## 10. Separación de responsabilidades HTTP

Las llamadas a la API se hacen exclusivamente desde `SolicitudesService`. Los
componentes nunca invocan `HttpClient` directamente: consumen el servicio
mediante `inject(SolicitudesService)`. Esto:

- Centraliza la lógica de transformación de payloads.
- Facilita el cambio de transporte (por ejemplo, migrar de `HttpClient` a un
  cliente GraphQL) sin tocar las plantillas.
- Permite testear componentes con un mock del servicio.

## 11. Compatibilidad de versiones

El proyecto está escrito para Angular 20, que mantiene los conceptos exigidos
por la rúbrica (componentes, módulos, data binding, directivas, servicios
inyectados). El backend se compila con `target: ES2022` para Node.js.

## 12. Resumen de decisiones

| Decisión                                              | Justificación                                              |
|-------------------------------------------------------|------------------------------------------------------------|
| Standalone components en Angular 20                   | Carga diferida natural, reduce boilerplate de NgModules.   |
| NgModule de routing explícito                         | Conserva el patrón clásico visible en la rúbrica.         |
| Signals + BehaviorSubject                             | Compatibilidad con consumidores modernos y basados en RxJS. |
| Modelos duplicados frontend/backend                   | Acoplamiento cero entre procesos.                         |
| `strict: true` global                                 | Detección temprana de errores de contrato.                |
| `StatusBadgeDirective` como directiva                | Reutilización sin acoplar la lógica al componente.         |
| Fallback offline en el servicio                       | La UI nunca queda vacía si la API no responde.             |
