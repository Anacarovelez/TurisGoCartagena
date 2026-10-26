const express = require('express');
const router = express.Router();

const controlador = require('../controllers/asignacionesController');

// GET: listar todas las asignaciones
router.get('/', controlador.listar);

// GET: consultar una asignación por ID
router.get('/:id', controlador.obtenerPorId);

// POST: crear una asignación
router.post('/', controlador.crear);

// PUT: actualizar una asignación
router.put('/:id', controlador.actualizar);

// DELETE: eliminar una asignación
router.delete('/:id', controlador.eliminar);

module.exports = router;