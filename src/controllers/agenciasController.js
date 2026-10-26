const db = require('../config/db');

// GET /api/agencias
const obtenerAgencias = async (req, res) => {
    try {
        const [agencias] = await db.query(
            `SELECT * FROM agencia ORDER BY id_agencia DESC`
        );

        return res.status(200).json(agencias);
    } catch (error) {
        console.error('Error al listar agencias:', error);
        return res.status(500).json({
            mensaje: 'Error al consultar las agencias',
            error: error.message
        });
    }
};

// GET /api/agencias/:id
const obtenerAgenciaPorId = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID de la agencia no es válido'
            });
        }

        const [agencias] = await db.query(
            'SELECT * FROM agencia WHERE id_agencia = ?',
            [id]
        );

        if (agencias.length === 0) {
            return res.status(404).json({
                mensaje: 'Agencia no encontrada'
            });
        }

        return res.status(200).json(agencias[0]);
    } catch (error) {
        console.error('Error al consultar agencia:', error);
        return res.status(500).json({
            mensaje: 'Error al consultar la agencia',
            error: error.message
        });
    }
};

// POST /api/agencias
const crearAgencia = async (req, res) => {
    try {
        const {
            nombre_agencia,
            nit,
            telefono,
            email,
            direccion,
            contacto_principal,
            estado_agencia
        } = req.body || {};

        if (
            typeof nombre_agencia !== 'string' ||
            nombre_agencia.trim() === ''
        ) {
            return res.status(400).json({
                mensaje: 'El nombre de la agencia es obligatorio'
            });
        }

        const [resultado] = await db.query(
            `INSERT INTO agencia (
                nombre_agencia,
                nit,
                telefono,
                email,
                direccion,
                contacto_principal,
                estado_agencia
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                nombre_agencia.trim(),
                nit || null,
                telefono || null,
                email || null,
                direccion || null,
                contacto_principal || null,
                estado_agencia || 'Activa'
            ]
        );

        return res.status(201).json({
            mensaje: 'Agencia creada correctamente',
            id_agencia: resultado.insertId
        });
    } catch (error) {
        console.error('Error al crear agencia:', error);
        return res.status(500).json({
            mensaje: 'Error al crear la agencia',
            error: error.message
        });
    }
};

// PUT /api/agencias/:id
const actualizarAgencia = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID de la agencia no es válido'
            });
        }

        const {
            nombre_agencia,
            nit,
            telefono,
            email,
            direccion,
            contacto_principal,
            estado_agencia
        } = req.body || {};

        if (
            typeof nombre_agencia !== 'string' ||
            nombre_agencia.trim() === ''
        ) {
            return res.status(400).json({
                mensaje: 'El nombre de la agencia es obligatorio'
            });
        }

        const [resultado] = await db.query(
            `UPDATE agencia SET
                nombre_agencia = ?,
                nit = ?,
                telefono = ?,
                email = ?,
                direccion = ?,
                contacto_principal = ?,
                estado_agencia = ?
             WHERE id_agencia = ?`,
            [
                nombre_agencia.trim(),
                nit || null,
                telefono || null,
                email || null,
                direccion || null,
                contacto_principal || null,
                estado_agencia || 'Activa',
                id
            ]
        );

        if (resultado.affectedRows === 0) {
            const [agencias] = await db.query(
                'SELECT id_agencia FROM agencia WHERE id_agencia = ?',
                [id]
            );

            if (agencias.length === 0) {
                return res.status(404).json({
                    mensaje: 'Agencia no encontrada'
                });
            }
        }

        return res.status(200).json({
            mensaje: 'Agencia actualizada correctamente',
            id_agencia: id
        });
    } catch (error) {
        console.error('Error al actualizar agencia:', error);
        return res.status(500).json({
            mensaje: 'Error al actualizar la agencia',
            error: error.message
        });
    }
};

// DELETE /api/agencias/:id
const eliminarAgencia = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID de la agencia no es válido'
            });
        }

        const [resultado] = await db.query(
            'DELETE FROM agencia WHERE id_agencia = ?',
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Agencia no encontrada'
            });
        }

        return res.status(200).json({
            mensaje: 'Agencia eliminada correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar agencia:', error);

        if (
            error.code === 'ER_ROW_IS_REFERENCED_2' ||
            error.code === 'ER_ROW_IS_REFERENCED'
        ) {
            return res.status(409).json({
                mensaje: 'No se puede eliminar la agencia porque tiene registros relacionados'
            });
        }

        return res.status(500).json({
            mensaje: 'Error al eliminar la agencia',
            error: error.message
        });
    }
};

module.exports = {
    obtenerAgencias,
    obtenerAgenciaPorId,
    crearAgencia,
    actualizarAgencia,
    eliminarAgencia
};