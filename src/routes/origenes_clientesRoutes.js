const express = require('express');
const router = express.Router();

const {
    obtenerOrigenesClientes,
    obtenerOrigenClientePorId,
    crearOrigenCliente,
    actualizarOrigenCliente,
    eliminarOrigenCliente
} = require('../controllers/origenes_clientesController');

// Listar orígenes
router.get('/', obtenerOrigenesClientes);

// Consultar un origen
router.get('/:id', obtenerOrigenClientePorId);

// Crear un origen
router.post('/', crearOrigenCliente);

// Actualizar un origen
router.put('/:id', actualizarOrigenCliente);

// Eliminar un origen
router.delete('/:id', eliminarOrigenCliente);

module.exports = router;