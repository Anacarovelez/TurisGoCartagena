const express = require('express');
const router = express.Router();

const {
    obtenerDisponibilidades,
    obtenerDisponibilidadPorId,
    crearDisponibilidad,
    actualizarDisponibilidad,
    eliminarDisponibilidad
} = require('../controllers/disponibilidadesController');

router.get('/', obtenerDisponibilidades);
router.get('/:id', obtenerDisponibilidadPorId);
router.post('/', crearDisponibilidad);
router.put('/:id', actualizarDisponibilidad);
router.delete('/:id', eliminarDisponibilidad);

module.exports = router;