const db = require('../config/db');

// =====================================================
// GET: Listar todos los conductores
// Endpoint: GET /api/conductores
// =====================================================
const obtenerConductores = async (req, res) => {
    try {
        const [conductores] = await db.query(`
            SELECT
                id_conductor,
                tipo_documento,
                numero_documento,
                nombres,
                apellidos,
                telefono,
                numero_licencia,
                categoria_licencia,
                fecha_vencimiento_licencia,
                estado_conductor
            FROM conductor
            ORDER BY id_conductor DESC
        `);

        return res.status(200).json(conductores);

    } catch (error) {
        console.error('Error al consultar conductores:', error);

        return res.status(500).json({
            mensaje: 'Error al consultar los conductores',
            error: error.message
        });
    }
};


// =====================================================
// GET: Consultar un conductor por ID
// Endpoint: GET /api/conductores/:id
// =====================================================
const obtenerConductorPorId = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID del conductor no es válido'
            });
        }

        const [conductores] = await db.query(
            `SELECT
                id_conductor,
                tipo_documento,
                numero_documento,
                nombres,
                apellidos,
                telefono,
                numero_licencia,
                categoria_licencia,
                fecha_vencimiento_licencia,
                estado_conductor
             FROM conductor
             WHERE id_conductor = ?`,
            [id]
        );

        if (conductores.length === 0) {
            return res.status(404).json({
                mensaje: 'Conductor no encontrado'
            });
        }

        return res.status(200).json(conductores[0]);

    } catch (error) {
        console.error('Error al consultar conductor:', error);

        return res.status(500).json({
            mensaje: 'Error al consultar el conductor',
            error: error.message
        });
    }
};


// =====================================================
// POST: Registrar un conductor
// Endpoint: POST /api/conductores
// =====================================================
const crearConductor = async (req, res) => {
    try {
        const {
            tipo_documento,
            numero_documento,
            nombres,
            apellidos,
            telefono,
            numero_licencia,
            categoria_licencia,
            fecha_vencimiento_licencia,
            estado_conductor
        } = req.body || {};

        // Validar los campos mínimos para registrar.
        if (
            !nombres ||
            typeof nombres !== 'string' ||
            !nombres.trim() ||
            !apellidos ||
            typeof apellidos !== 'string' ||
            !apellidos.trim()
        ) {
            return res.status(400).json({
                mensaje: 'Los nombres y apellidos del conductor son obligatorios'
            });
        }

        const [resultado] = await db.query(
            `INSERT INTO conductor (
                tipo_documento,
                numero_documento,
                nombres,
                apellidos,
                telefono,
                numero_licencia,
                categoria_licencia,
                fecha_vencimiento_licencia,
                estado_conductor
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                tipo_documento || null,
                numero_documento || null,
                nombres.trim(),
                apellidos.trim(),
                telefono || null,
                numero_licencia || null,
                categoria_licencia || null,
                fecha_vencimiento_licencia || null,
                estado_conductor || 'Activo'
            ]
        );

        return res.status(201).json({
            mensaje: 'Conductor registrado correctamente',
            id_conductor: resultado.insertId
        });

    } catch (error) {
        console.error('Error al registrar conductor:', error);

        return res.status(500).json({
            mensaje: 'Error al registrar el conductor',
            error: error.message
        });
    }
};


// =====================================================
// PUT: Actualizar un conductor
// Endpoint: PUT /api/conductores/:id
// =====================================================
const actualizarConductor = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID del conductor no es válido'
            });
        }

        const {
            tipo_documento,
            numero_documento,
            nombres,
            apellidos,
            telefono,
            numero_licencia,
            categoria_licencia,
            fecha_vencimiento_licencia,
            estado_conductor
        } = req.body || {};

        if (
            !nombres ||
            typeof nombres !== 'string' ||
            !nombres.trim() ||
            !apellidos ||
            typeof apellidos !== 'string' ||
            !apellidos.trim()
        ) {
            return res.status(400).json({
                mensaje: 'Los nombres y apellidos del conductor son obligatorios'
            });
        }

        const [resultado] = await db.query(
            `UPDATE conductor SET
                tipo_documento = ?,
                numero_documento = ?,
                nombres = ?,
                apellidos = ?,
                telefono = ?,
                numero_licencia = ?,
                categoria_licencia = ?,
                fecha_vencimiento_licencia = ?,
                estado_conductor = ?
             WHERE id_conductor = ?`,
            [
                tipo_documento || null,
                numero_documento || null,
                nombres.trim(),
                apellidos.trim(),
                telefono || null,
                numero_licencia || null,
                categoria_licencia || null,
                fecha_vencimiento_licencia || null,
                estado_conductor || 'Activo',
                id
            ]
        );

        // Si no cambió ninguna columna, verificar que exista.
        if (resultado.affectedRows === 0) {
            const [conductores] = await db.query(
                'SELECT id_conductor FROM conductor WHERE id_conductor = ?',
                [id]
            );

            if (conductores.length === 0) {
                return res.status(404).json({
                    mensaje: 'Conductor no encontrado'
                });
            }
        }

        return res.status(200).json({
            mensaje: 'Conductor actualizado correctamente',
            id_conductor: id
        });

    } catch (error) {
        console.error('Error al actualizar conductor:', error);

        return res.status(500).json({
            mensaje: 'Error al actualizar el conductor',
            error: error.message
        });
    }
};


// =====================================================
// DELETE: Eliminar un conductor
// Endpoint: DELETE /api/conductores/:id
// =====================================================
const eliminarConductor = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID del conductor no es válido'
            });
        }

        const [resultado] = await db.query(
            'DELETE FROM conductor WHERE id_conductor = ?',
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Conductor no encontrado'
            });
        }

        return res.status(200).json({
            mensaje: 'Conductor eliminado correctamente',
            id_conductor: id
        });

    } catch (error) {
        console.error('Error al eliminar conductor:', error);

        if (
            error.code === 'ER_ROW_IS_REFERENCED_2' ||
            error.code === 'ER_ROW_IS_REFERENCED'
        ) {
            return res.status(409).json({
                mensaje:
                    'No se puede eliminar el conductor porque tiene asignaciones de servicio relacionadas'
            });
        }

        return res.status(500).json({
            mensaje: 'Error al eliminar el conductor',
            error: error.message
        });
    }
};


// =====================================================
// Exportar funciones
// =====================================================
module.exports = {
    obtenerConductores,
    obtenerConductorPorId,
    crearConductor,
    actualizarConductor,
    eliminarConductor
};