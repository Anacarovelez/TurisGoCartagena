# TurisGo Cartagena

API REST para la gestión de servicios turísticos en Cartagena de Indias, desarrollada como proyecto académico de Ingeniería de Sistemas.

## 1. Descripción

TurisGo Cartagena busca facilitar la gestión de operaciones de empresas turísticas mediante una API que centraliza la información de clientes, agencias, experiencias turísticas, servicios, reservas, disponibilidades, pagos, conductores, vehículos y asignaciones.

El proyecto se encuentra en desarrollo. La documentación y las funcionalidades se actualizarán a medida que avance su implementación.

## 2. Tecnologías

- Node.js
- Express.js
- MySQL
- `mysql2/promise`
- dotenv para la configuración mediante variables de entorno
- Helmet para encabezados HTTP de seguridad
- CORS para la configuración de solicitudes entre orígenes
- Git y GitHub para el control de versiones

## 3. Requisitos

- Node.js y npm.
- MySQL.
- Git.
- Un cliente HTTP, como Postman, para probar los endpoints.

## 4. Instalación local

Clona el repositorio:

```bash
git clone https://github.com/Anacarovelez/TurisGoCartagena.git
cd TurisGoCartagena
```

Instala las dependencias:

```bash
npm install
```

Crea un archivo `.env` a partir de `.env.example` y configura las variables de conexión a tu base de datos.

Importa los scripts SQL necesarios de la carpeta `database` en MySQL, respetando las dependencias entre tablas.

## 5. Variables de entorno

La configuración de la base de datos utiliza las siguientes variables:

```dotenv
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=
DB_PASSWORD=
DB_NAME=sistema_turismo_cartagena
```

Los valores de ejemplo deben ajustarse al entorno local o de despliegue.

**No publiques el archivo `.env` ni incluyas contraseñas, claves de AWS o credenciales reales en el repositorio.**

## 6. Ejecución

Inicia el servidor en modo desarrollo:

```bash
npm run dev
```

Para iniciar el servidor con el script de producción definido en `package.json`:

```bash
npm start
```

La API local utiliza, por defecto:

`http://localhost:3000`

## 7. Comprobación de salud

Endpoint de verificación:

```http
GET /api/health
```

En las pruebas locales realizadas, este endpoint respondió con estado HTTP 200 e informó que el servicio estaba activo y la base de datos conectada.

## 8. Recursos de la API

La aplicación registra rutas para los siguientes recursos:

| Prefijo | Recurso |
|---|---|
| `/api/clientes` | Clientes |
| `/api/agencias` | Agencias |
| `/api/servicios` | Servicios turísticos |
| `/api/tours` | Experiencias turísticas |
| `/api/tipos-servicio` | Tipos de servicio |
| `/api/disponibilidades` | Disponibilidad |
| `/api/reservas` | Reservas |
| `/api/pagos` | Pagos |
| `/api/conductores` | Conductores |
| `/api/vehiculos` | Vehículos |
| `/api/vendedores` | Vendedores |
| `/api/origenes-clientes` | Orígenes de clientes |
| `/api/asignaciones` | Asignaciones de servicios |

Los métodos HTTP, parámetros, validaciones y formatos de respuesta deben documentarse a partir de las rutas y controladores implementados.

## 9. Seguridad

El estado actual incluye el uso de Helmet, configuración de CORS, variables de entorno para la conexión a MySQL y un límite de tamaño para las solicitudes JSON.

Antes de considerar el sistema listo para producción, se deben verificar y completar, según corresponda:

- Validación y normalización de datos de entrada.
- Manejo seguro de errores y consultas SQL.
- Autenticación y autorización.
- Protección de credenciales y permisos de acceso.
- Configuración de CORS según los orígenes autorizados.
- HTTPS, registros y monitoreo.
- Copias de seguridad y recuperación de la base de datos.

La presencia de estas tareas en la documentación no significa que ya estén implementadas.

## 10. Despliegue

El despliegue en AWS se realizará después de verificar las dependencias, las variables de entorno, la conectividad con MySQL, la seguridad y los costos de los servicios seleccionados.

## 11. Estado del proyecto

Proyecto en desarrollo. Se continuará con pruebas funcionales, documentación técnica, revisión de seguridad y despliegue progresivo.

## 12. Licencia

El proyecto declara actualmente la licencia ISC en `package.json`. La licencia definitiva y sus condiciones de distribución deben confirmarse antes de publicar el código de forma abierta.
