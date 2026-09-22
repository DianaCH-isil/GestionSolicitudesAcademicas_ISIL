# API REST - Gestión de Solicitudes Académicas ISIL

Servicio HTTP que el frontend Angular consume para radicar, consultar y
actualizar solicitudes académicas.

## Información general

| Atributo       | Valor                                              |
|----------------|----------------------------------------------------|
| URL base       | `http://localhost:3000`                            |
| Prefijo        | `/api`                                             |
| Formato        | JSON                                               |
| CORS           | `Access-Control-Allow-Origin: *`                   |
| Puerto config. | Variable de entorno `PORT` (por defecto `3000`)    |

## Modelos de datos

### `SolicitudAcademica`

```ts
interface SolicitudAcademica {
  id: string;
  codigoRadicado: string;
  tipoTramite: string;
  descripcionDetalle: string;
  asignaturaDependencia?: string;
  tipoDependencia?: 'asignatura' | 'dependencia' | 'proceso';
  iconoTipo?: 'sigma' | 'flask' | 'transfer' | 'building' | 'matrix' | 'grad';
  fechaRadicacion: string;          // '21 Sep 2026'
  estado: 'Aprobada' | 'En Revisión' | 'Pendiente' | 'Rechazada';
  estudiante: Estudiante;
  justificacion: string;
  comentariosRevision?: string;
  adjuntos?: string[];
}
```

### `Estudiante`

```ts
interface Estudiante {
  id: string;                       // 'EST-2024-998'
  nombre: string;
  carrera: string;
  codigo: string;                   // 'ISIL-742910'
  email: string;                    // 'usuario@isil.pe'
  avatarUrl?: string;
}
```

### `NuevaSolicitudDTO`

Cuerpo aceptado por `POST /api/solicitudes`.

```ts
interface NuevaSolicitudDTO {
  tipoTramite: string;
  descripcionDetalle?: string;
  asignaturaDependencia?: string;
  tipoDependencia?: 'asignatura' | 'dependencia' | 'proceso';
  estudianteNombre?: string;
  estudianteCodigo: string;
  estudianteEmail: string;
  justificacion: string;
  aceptaTerminos: boolean;
}
```

### `MetricasSolicitudes`

```ts
interface MetricasSolicitudes {
  total: number;
  aprobadas: number;
  enRevision: number;
  pendientes: number;
  rechazadas: number;
}
```

## Endpoints

### `GET /api/health`

Devuelve el estado del servicio.

**Respuesta `200`**

```json
{
  "status": "OK",
  "servicio": "API REST - Gestión de Solicitudes Académicas ISIL",
  "version": "1.0.0",
  "timestamp": "2026-09-22T17:13:01.397Z",
  "totalSolicitudes": 6
}
```

```bash
curl http://localhost:3000/api/health
```

### `GET /api/solicitudes`

Lista todas las solicitudes radicadas.

**Query params opcionales**:

| Nombre         | Tipo   | Descripción                                            |
|----------------|--------|--------------------------------------------------------|
| `estado`       | string | Filtra por estado exacto (`Pendiente`, etc.).          |
| `codigoAlumno` | string | Filtra por código de estudiante.                       |

**Respuesta `200`**: arreglo de `SolicitudAcademica`.

```bash
curl http://localhost:3000/api/solicitudes
curl "http://localhost:3000/api/solicitudes?estado=Aprobada"
curl "http://localhost:3000/api/solicitudes?codigoAlumno=ISIL-742910"
```

### `GET /api/solicitudes/:id`

Devuelve una solicitud por su `id` interno o por su `codigoRadicado`
(`SOL-2024-001`, etc.).

**Respuestas**:

| Código | Caso                                          |
|--------|-----------------------------------------------|
| `200`  | Solicitud encontrada.                         |
| `404`  | No existe la solicitud con ese identificador. |

```bash
curl http://localhost:3000/api/solicitudes/1
curl http://localhost:3000/api/solicitudes/SOL-2024-001
```

### `POST /api/solicitudes`

Registra una nueva solicitud.

**Body**: `NuevaSolicitudDTO`.

**Reglas de validación**:

- `tipoTramite`, `estudianteCodigo`, `estudianteEmail` y `justificacion` son
  obligatorios.
- `aceptaTerminos` debe ser `true`.

**Respuestas**:

| Código | Caso                                                                       |
|--------|----------------------------------------------------------------------------|
| `201`  | Solicitud creada. Devuelve el recurso `SolicitudAcademica` poblado.        |
| `400`  | Datos incompletos o términos no aceptados.                                 |

```bash
curl -X POST http://localhost:3000/api/solicitudes \
  -H "Content-Type: application/json" \
  -d '{
    "tipoTramite": "Cambio de Turno / Horario",
    "descripcionDetalle": "Cambio de seccion por motivos laborales",
    "estudianteCodigo": "ISIL-742910",
    "estudianteEmail": "valeria.restrepo@isil.pe",
    "justificacion": "Necesito cambiarme de la seccion A a la C por motivos laborales.",
    "aceptaTerminos": true
  }'
```

**Ejemplo de respuesta `201`**:

```json
{
  "id": "1790097189624",
  "codigoRadicado": "SOL-2026-007",
  "tipoTramite": "Cambio de Turno / Horario",
  "descripcionDetalle": "Cambio de seccion por motivos laborales",
  "asignaturaDependencia": "Gestión Académica Central",
  "tipoDependencia": "proceso",
  "iconoTipo": "building",
  "fechaRadicacion": "22 Sep 2026",
  "estado": "Pendiente",
  "estudiante": {
    "id": "EST-2024-998",
    "nombre": "Valeria Restrepo",
    "carrera": "Ingeniería de Sistemas",
    "codigo": "ISIL-742910",
    "email": "valeria.restrepo@isil.pe",
    "avatarUrl": "user.png"
  },
  "justificacion": "Necesito cambiarme de la seccion A a la C por motivos laborales.",
  "comentariosRevision": "Solicitud radicada con éxito vía API REST. En cola de revisión por el área académica.",
  "adjuntos": []
}
```

### `PATCH /api/solicitudes/:id/estado`

Actualiza el estado de una solicitud existente.

**Body**:

```ts
{
  estado: 'Aprobada' | 'En Revisión' | 'Pendiente' | 'Rechazada';
  comentario?: string;
}
```

**Respuestas**:

| Código | Caso                                                |
|--------|-----------------------------------------------------|
| `200`  | Estado actualizado. Devuelve la solicitud completa. |
| `400`  | Estado fuera del dominio permitido.                 |
| `404`  | No existe la solicitud indicada.                    |

```bash
curl -X PATCH http://localhost:3000/api/solicitudes/1/estado \
  -H "Content-Type: application/json" \
  -d '{ "estado": "Rechazada", "comentario": "Verificacion API" }'
```

### `GET /api/estudiantes`

Lista todos los estudiantes registrados.

```bash
curl http://localhost:3000/api/estudiantes
```

### `GET /api/estudiantes/:codigo`

Busca un estudiante por su código institucional.

```bash
curl http://localhost:3000/api/estudiantes/ISIL-742910
```

**Respuestas**:

| Código | Caso                              |
|--------|-----------------------------------|
| `200`  | Estudiante encontrado.            |
| `404`  | Código no registrado.            |

### `GET /api/metricas`

Devuelve los conteos agregados del estado de las solicitudes.

```bash
curl http://localhost:3000/api/metricas
```

**Respuesta `200`**:

```json
{
  "total": 6,
  "aprobadas": 3,
  "enRevision": 1,
  "pendientes": 2,
  "rechazadas": 0
}
```

## Códigos de error

| Código | Significado           | Cuerpo típico                                                   |
|--------|-----------------------|-----------------------------------------------------------------|
| `400`  | Solicitud inválida    | `{ "error": "...", "mensaje": "..." }`                          |
| `404`  | Recurso no encontrado | `{ "error": "Solicitud no encontrada", "mensaje": "..." }`     |

## Persistencia

La API opera con un repositorio en memoria poblado desde
`server/src/data/initial-data.ts`. Los cambios realizados durante una sesión
del servidor no se persisten tras un reinicio, lo que la hace adecuada para
la práctica y las demostraciones de la Actividad 4.
