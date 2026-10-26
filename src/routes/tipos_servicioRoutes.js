const express = require('express');
const router = express.Router();

const {
    obtenerTiposServicio,
    obtenerTipoServicioPorId,
    crearTipoServicio,
    actualizarTipoServicio,
    eliminarTipoServicio
} = require('../controllers/tipos_servicioController');

// Listar tipos de servicio
router.get('/', obtenerTiposServicio);

// Consultar tipo de servicio por ID
router.get('/:id', obtenerTipoServicioPorId);

// Crear tipo de servicio
router.post('/', crearTipoServicio);

// Actualizar tipo de servicio
router.put('/:id', actualizarTipoServicio);

// Eliminar tipo de servicio
router.delete('/:id', eliminarTipoServicio);

module.exports = router;