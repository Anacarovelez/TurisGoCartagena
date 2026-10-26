const express = require('express');
const cors = require('cors');
require('dotenv').config();

const helmet = require('helmet');

const app = express();
const PORT = Number(process.env.PORT || 3000);


app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/', (req, res) => {
    res.status(200).json({
        mensaje: 'Bienvenido a la API de TurisGo Cartagena',
        estado: 'Servidor funcionando',
        documentacion: 'Consulta ENDPOINTS_POSTMAN.md'
    });
});

app.get('/api/health', async (req, res) => {
    try {
        const pool = require('./config/db');
        await pool.query('SELECT 1');
        res.status(200).json({ estado: 'OK', servicio: 'TurisGo Cartagena API', base_datos: 'conectada' });
    } catch (error) {
        console.error('Health check DB:', error.message);
        res.status(503).json({ estado: 'DEGRADADO', servicio: 'TurisGo Cartagena API', base_datos: 'no disponible' });
    }
});

app.use('/api/clientes', require('./routes/clienteRoutes'));
app.use('/api/servicios', require('./routes/servicioRoutes'));
app.use('/api/tours', require('./routes/tours'));
app.use('/api/agencias', require('./routes/agenciasRoutes'));
app.use('/api/conductores', require('./routes/conductoresRoutes'));
app.use('/api/origenes-clientes', require('./routes/origenes_clientesRoutes'));
app.use('/api/pagos', require('./routes/pagosRoutes'));
app.use('/api/tipos-servicio', require('./routes/tipos_servicioRoutes'));
app.use('/api/vehiculos', require('./routes/vehiculosRoutes'));
app.use('/api/vendedores', require('./routes/vendedoresRoutes'));
app.use('/api/asignaciones', require('./routes/asignacionesRoutes'));
app.use(
    '/api/disponibilidades',
    require('./routes/disponibilidadesRoutes')
);

app.use(
    '/api/reservas',
    require('./routes/reservasRoutes')
);

app.use((req, res) => {
    res.status(404).json({ mensaje: 'Ruta no encontrada', metodo: req.method, ruta: req.originalUrl });
});

app.use((error, req, res, next) => {
    console.error('Error no controlado:', error.message);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
