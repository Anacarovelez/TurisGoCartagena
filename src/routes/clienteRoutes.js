const express = require('express');
const router = express.Router();


const {
obtenerClientes,
obtenerClientePorId,
crearCliente,
actualizarCliente,
eliminarCliente
} = require('../controllers/clienteController');

// GET: listar clientes
router.get('/', obtenerClientes);

// GET: consultar un cliente por ID
router.get('/:id', obtenerClientePorId);

// POST: registrar un cliente
router.post('/', crearCliente);

// PUT: actualizar un cliente por ID
router.put('/:id', actualizarCliente);

// DELETE: eliminar un cliente por ID
router.delete('/:id', eliminarCliente);

module.exports = router;