const express = require('express');
const router = express.Router();

const {
    obtenerPagos,
    obtenerPagoPorId,
    crearPago,
    actualizarPago,
    eliminarPago
} = require('../controllers/pagosController');

// Listar todos los pagos
router.get('/', obtenerPagos);

// Consultar un pago por ID
router.get('/:id', obtenerPagoPorId);

// Registrar un pago
router.post('/', crearPago);

// Actualizar un pago
router.put('/:id', actualizarPago);

// Eliminar un pago
router.delete('/:id', eliminarPago);

module.exports = router;