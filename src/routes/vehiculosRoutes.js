const express = require('express');
const router = express.Router();

const {
    obtenerVehiculos,
    obtenerVehiculoPorId,
    crearVehiculo,
    actualizarVehiculo,
    eliminarVehiculo
} = require('../controllers/vehiculosController');

router.get('/', obtenerVehiculos);
router.get('/:id', obtenerVehiculoPorId);
router.post('/', crearVehiculo);
router.put('/:id', actualizarVehiculo);
router.delete('/:id', eliminarVehiculo);

module.exports = router;