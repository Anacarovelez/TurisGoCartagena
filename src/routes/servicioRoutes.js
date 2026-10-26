const express = require('express');
const router = express.Router();


const {
obtenerServicios,
obtenerServicioPorId,
crearServicio,
actualizarServicio,
eliminarServicio
} = require('../controllers/servicioController');

// GET: consultar todos los servicios
router.get('/', obtenerServicios);

// GET: consultar un servicio por ID
router.get('/:id', obtenerServicioPorId);

// POST: registrar un servicio
router.post('/', crearServicio);

// PUT: actualizar un servicio por ID
router.put('/:id', actualizarServicio);

// DELETE: eliminar un servicio por ID
router.delete('/:id', eliminarServicio);

module.exports = router;