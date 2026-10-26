const express = require('express');
const router = express.Router();

const {
    obtenerAgencias,
    obtenerAgenciaPorId,
    crearAgencia,
    actualizarAgencia,
    eliminarAgencia
} = require('../controllers/agenciasController');

// GET: listar todas las agencias
router.get('/', obtenerAgencias);

// GET: consultar agencia por ID
router.get('/:id', obtenerAgenciaPorId);

// POST: registrar una agencia
router.post('/', crearAgencia);

// PUT: actualizar una agencia
router.put('/:id', actualizarAgencia);

// DELETE: eliminar una agencia
router.delete('/:id', eliminarAgencia);

module.exports = router;