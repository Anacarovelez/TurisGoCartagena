const db = require('../config/db');

// =====================================================
// GET: Listar todos los orígenes de clientes
// Endpoint: GET /api/origenes-clientes
// =====================================================
const obtenerOrigenesClientes = async (req, res) => {
    try {
        const [origenes] = await db.query(`
            SELECT
                id_origen_cliente,
                tipo_origen,
                descripcion
            FROM origen_cliente
            ORDER BY id_origen_cliente DESC
        `);

        return res.status(200).json(origenes);
    } catch (error) {
        console.error('Error al consultar orígenes de clientes:', error);

        return res.status(500).json({
            mensaje: 'Error al consultar los orígenes de clientes',
            error: error.message
        });
    }
};


// =====================================================
// GET: Consultar un origen por ID
// Endpoint: GET /api/origenes-clientes/:id
// =====================================================
const obtenerOrigenClientePorId = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID del origen no es válido'
            });
        }

        const [origenes] = await db.query(
            `SELECT
                id_origen_cliente,
                tipo_origen,
                descripcion
             FROM origen_cliente
             WHERE id_origen_cliente = ?`,
            [id]
        );

        if (origenes.length === 0) {
            return res.status(404).json({
                mensaje: 'Origen de cliente no encontrado'
            });
        }

        return res.status(200).json(origenes[0]);
    } catch (error) {
        console.error('Error al consultar origen de cliente:', error);

        return res.status(500).json({
            mensaje: 'Error al consultar el origen de cliente',
            error: error.message
        });
    }
};


// =====================================================
// POST: Registrar un origen de cliente
// Endpoint: POST /api/origenes-clientes
// =====================================================
const crearOrigenCliente = async (req, res) => {
    try {
        const { tipo_origen, descripcion } = req.body || {};

        if (
            typeof tipo_origen !== 'string' ||
            tipo_origen.trim() === ''
        ) {
            return res.status(400).json({
                mensaje: 'El tipo de origen es obligatorio'
            });
        }

        const [resultado] = await db.query(
            `INSERT INTO origen_cliente (
                tipo_origen,
                descripcion
            ) VALUES (?, ?)`,
            [
                tipo_origen.trim(),
                descripcion || null
            ]
        );

        return res.status(201).json({
            mensaje: 'Origen de cliente creado correctamente',
            id_origen_cliente: resultado.insertId
        });
    } catch (error) {
        console.error('Error al crear origen de cliente:', error);

        return res.status(500).json({
            mensaje: 'Error al crear el origen de cliente',
            error: error.message
        });
    }
};


// =====================================================
// PUT: Actualizar un origen de cliente
// Endpoint: PUT /api/origenes-clientes/:id
// =====================================================
const actualizarOrigenCliente = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID del origen no es válido'
            });
        }

        const { tipo_origen, descripcion } = req.body || {};

        if (
            typeof tipo_origen !== 'string' ||
            tipo_origen.trim() === ''
        ) {
            return res.status(400).json({
                mensaje: 'El tipo de origen es obligatorio'
            });
        }

        const [resultado] = await db.query(
            `UPDATE origen_cliente
             SET tipo_origen = ?,
                 descripcion = ?
             WHERE id_origen_cliente = ?`,
            [
                tipo_origen.trim(),
                descripcion || null,
                id
            ]
        );

        if (resultado.affectedRows === 0) {
            const [origenes] = await db.query(
                `SELECT id_origen_cliente
                 FROM origen_cliente
                 WHERE id_origen_cliente = ?`,
                [id]
            );

            if (origenes.length === 0) {
                return res.status(404).json({
                    mensaje: 'Origen de cliente no encontrado'
                });
            }
        }

        return res.status(200).json({
            mensaje: 'Origen de cliente actualizado correctamente',
            id_origen_cliente: id
        });
    } catch (error) {
        console.error('Error al actualizar origen de cliente:', error);

        return res.status(500).json({
            mensaje: 'Error al actualizar el origen de cliente',
            error: error.message
        });
    }
};


// =====================================================
// DELETE: Eliminar un origen de cliente
// Endpoint: DELETE /api/origenes-clientes/:id
// =====================================================
const eliminarOrigenCliente = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID del origen no es válido'
            });
        }

        const [resultado] = await db.query(
            `DELETE FROM origen_cliente
             WHERE id_origen_cliente = ?`,
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Origen de cliente no encontrado'
            });
        }

        return res.status(200).json({
            mensaje: 'Origen de cliente eliminado correctamente',
            id_origen_cliente: id
        });
    } catch (error) {
        console.error('Error al eliminar origen de cliente:', error);

        if (
            error.code === 'ER_ROW_IS_REFERENCED_2' ||
            error.code === 'ER_ROW_IS_REFERENCED'
        ) {
            return res.status(409).json({
                mensaje:
                    'No se puede eliminar este origen porque tiene clientes relacionados'
            });
        }

        return res.status(500).json({
            mensaje: 'Error al eliminar el origen de cliente',
            error: error.message
        });
    }
};


// =====================================================
// Exportar funciones del controlador
// =====================================================
module.exports = {
    obtenerOrigenesClientes,
    obtenerOrigenClientePorId,
    crearOrigenCliente,
    actualizarOrigenCliente,
    eliminarOrigenCliente
};
