const db = require('../config/db');

// =====================================================
// GET: Listar todos los vendedores
// GET /api/vendedores
// =====================================================
const obtenerVendedores = async (req, res) => {
    try {
        const [vendedores] = await db.query(`
            SELECT
                id_vendedor,
                nombres,
                apellidos,
                telefono,
                email,
                tipo_vinculo,
                comision_porcentaje,
                estado_vendedor
            FROM vendedor
            ORDER BY id_vendedor DESC
        `);

        return res.status(200).json(vendedores);
    } catch (error) {
        console.error('Error al consultar vendedores:', error);

        return res.status(500).json({
            mensaje: 'Error al consultar los vendedores',
            error: error.message
        });
    }
};


// =====================================================
// GET: Consultar un vendedor por ID
// GET /api/vendedores/:id
// =====================================================
const obtenerVendedorPorId = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID del vendedor no es válido'
            });
        }

        const [vendedores] = await db.query(
            `SELECT
                id_vendedor,
                nombres,
                apellidos,
                telefono,
                email,
                tipo_vinculo,
                comision_porcentaje,
                estado_vendedor
             FROM vendedor
             WHERE id_vendedor = ?`,
            [id]
        );

        if (vendedores.length === 0) {
            return res.status(404).json({
                mensaje: 'Vendedor no encontrado'
            });
        }

        return res.status(200).json(vendedores[0]);
    } catch (error) {
        console.error('Error al consultar vendedor:', error);

        return res.status(500).json({
            mensaje: 'Error al consultar el vendedor',
            error: error.message
        });
    }
};


// =====================================================
// POST: Registrar un vendedor
// POST /api/vendedores
// =====================================================
const crearVendedor = async (req, res) => {
    try {
        const {
            nombres,
            apellidos,
            telefono,
            email,
            tipo_vinculo,
            comision_porcentaje,
            estado_vendedor
        } = req.body || {};

        if (
            typeof nombres !== 'string' ||
            nombres.trim() === '' ||
            typeof apellidos !== 'string' ||
            apellidos.trim() === ''
        ) {
            return res.status(400).json({
                mensaje: 'Los nombres y apellidos del vendedor son obligatorios'
            });
        }

        let comision = null;

        if (
            comision_porcentaje !== undefined &&
            comision_porcentaje !== null &&
            comision_porcentaje !== ''
        ) {
            comision = Number(comision_porcentaje);

            if (
                !Number.isFinite(comision) ||
                comision < 0 ||
                comision > 100
            ) {
                return res.status(400).json({
                    mensaje: 'La comisión debe ser un número entre 0 y 100'
                });
            }
        }

        const [resultado] = await db.query(
            `INSERT INTO vendedor (
                nombres,
                apellidos,
                telefono,
                email,
                tipo_vinculo,
                comision_porcentaje,
                estado_vendedor
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                nombres.trim(),
                apellidos.trim(),
                telefono || null,
                email || null,
                tipo_vinculo || null,
                comision,
                estado_vendedor || 'Activo'
            ]
        );

        return res.status(201).json({
            mensaje: 'Vendedor registrado correctamente',
            id_vendedor: resultado.insertId
        });
    } catch (error) {
        console.error('Error al registrar vendedor:', error);

        return res.status(500).json({
            mensaje: 'Error al registrar el vendedor',
            error: error.message
        });
    }
};


// =====================================================
// PUT: Actualizar un vendedor
// PUT /api/vendedores/:id
// =====================================================
const actualizarVendedor = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID del vendedor no es válido'
            });
        }

        const {
            nombres,
            apellidos,
            telefono,
            email,
            tipo_vinculo,
            comision_porcentaje,
            estado_vendedor
        } = req.body || {};

        if (
            typeof nombres !== 'string' ||
            nombres.trim() === '' ||
            typeof apellidos !== 'string' ||
            apellidos.trim() === ''
        ) {
            return res.status(400).json({
                mensaje: 'Los nombres y apellidos del vendedor son obligatorios'
            });
        }

        let comision = null;

        if (
            comision_porcentaje !== undefined &&
            comision_porcentaje !== null &&
            comision_porcentaje !== ''
        ) {
            comision = Number(comision_porcentaje);

            if (
                !Number.isFinite(comision) ||
                comision < 0 ||
                comision > 100
            ) {
                return res.status(400).json({
                    mensaje: 'La comisión debe ser un número entre 0 y 100'
                });
            }
        }

        const [resultado] = await db.query(
            `UPDATE vendedor SET
                nombres = ?,
                apellidos = ?,
                telefono = ?,
                email = ?,
                tipo_vinculo = ?,
                comision_porcentaje = ?,
                estado_vendedor = ?
             WHERE id_vendedor = ?`,
            [
                nombres.trim(),
                apellidos.trim(),
                telefono || null,
                email || null,
                tipo_vinculo || null,
                comision,
                estado_vendedor || 'Activo',
                id
            ]
        );

        if (resultado.affectedRows === 0) {
            const [vendedores] = await db.query(
                `SELECT id_vendedor
                 FROM vendedor
                 WHERE id_vendedor = ?`,
                [id]
            );

            if (vendedores.length === 0) {
                return res.status(404).json({
                    mensaje: 'Vendedor no encontrado'
                });
            }
        }

        return res.status(200).json({
            mensaje: 'Vendedor actualizado correctamente',
            id_vendedor: id
        });
    } catch (error) {
        console.error('Error al actualizar vendedor:', error);

        return res.status(500).json({
            mensaje: 'Error al actualizar el vendedor',
            error: error.message
        });
    }
};


// =====================================================
// DELETE: Eliminar un vendedor
// DELETE /api/vendedores/:id
// =====================================================
const eliminarVendedor = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID del vendedor no es válido'
            });
        }

        const [resultado] = await db.query(
            'DELETE FROM vendedor WHERE id_vendedor = ?',
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Vendedor no encontrado'
            });
        }

        return res.status(200).json({
            mensaje: 'Vendedor eliminado correctamente',
            id_vendedor: id
        });
    } catch (error) {
        console.error('Error al eliminar vendedor:', error);

        if (
            error.code === 'ER_ROW_IS_REFERENCED_2' ||
            error.code === 'ER_ROW_IS_REFERENCED'
        ) {
            return res.status(409).json({
                mensaje: 'No se puede eliminar el vendedor porque tiene clientes u otros registros relacionados'
            });
        }

        return res.status(500).json({
            mensaje: 'Error al eliminar el vendedor',
            error: error.message
        });
    }
};


// =====================================================
// Exportar funciones del controlador
// =====================================================
module.exports = {
    obtenerVendedores,
    obtenerVendedorPorId,
    crearVendedor,
    actualizarVendedor,
    eliminarVendedor
};