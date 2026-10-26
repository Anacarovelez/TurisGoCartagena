const express = require('express');
const router = express.Router();

const {
    obtenerTours,
    obtenerTourPorId,
    crearTour,
    actualizarTour,
    eliminarTour
} = require('../controllers/toursController');

router.get('/', obtenerTours);
router.get('/:id', obtenerTourPorId);
router.post('/', crearTour);
router.put('/:id', actualizarTour);
router.delete('/:id', eliminarTour);

module.exports = router;