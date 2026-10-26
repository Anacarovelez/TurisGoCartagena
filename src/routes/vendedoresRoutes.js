const express = require('express');
const router = express.Router();

const {
    obtenerVendedores,
    obtenerVendedorPorId,
    crearVendedor,
    actualizarVendedor,
    eliminarVendedor
} = require('../controllers/vendedoresController');

router.get('/', obtenerVendedores);
router.get('/:id', obtenerVendedorPorId);
router.post('/', crearVendedor);
router.put('/:id', actualizarVendedor);
router.delete('/:id', eliminarVendedor);

module.exports = router;