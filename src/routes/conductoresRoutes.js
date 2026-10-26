const express = require('express');
const router = express.Router();

const {
    obtenerConductores,
    obtenerConductorPorId,
    crearConductor,
    actualizarConductor,
    eliminarConductor
} = require('../controllers/conductoresController');

router.get('/', obtenerConductores);
router.get('/:id', obtenerConductorPorId);
router.post('/', crearConductor);
router.put('/:id', actualizarConductor);
router.delete('/:id', eliminarConductor);

module.exports = router;