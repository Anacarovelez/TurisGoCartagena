const db = require('../config/db');

const TABLA = 'asignacion_servicio';

// Obtener la estructura real de la tabla
const obtenerEstructura = async () => {
    const [columnas] = await db.query(
        'SHOW COLUMNS FROM `asignacion_servicio`'
    );

    const primaria = columnas.find(columna => columna.Key === 'PRI');

    if (!primaria) {
        throw new Error(
            'No se encontró la clave primaria de asignacion_servicio'
        );
    }

    const camposEditables = columnas
        .filter(columna =>
            columna.Field !== primaria.Field &&
            !String(columna.Extra || '').toLowerCase().includes('auto_increment') &&
            !String(columna.Extra || '').toLowerCase().includes('generated')
        )
        .map(columna => columna.Field);

    return {
        id: primaria.Field,
        camposEditables
    };
};

// GET: listar todas las asignaciones
// GET /api/asignaciones
const obtenerAsignaciones = async (req, res) => {
    try {
        const { id } = await obtenerEstructura();

        const [asignaciones] = await db.query(
            `SELECT * FROM \`${TABLA}\` ORDER BY \`${id}\` DESC`
        );

        return res.status(200).json(asignaciones);
    } catch (error) {
        console.error('Error al consultar asignaciones:', error);

        return res.status(500).json({
            mensaje: 'Error al consultar las asignaciones',
            error: error.message
        });
    }
};

// GET: consultar una asignación por ID
// GET /api/asignaciones/:id
const obtenerAsignacionPorId = async (req, res) => {
    try {
        const { id: clavePrimaria } = await obtenerEstructura();
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID de la asignación no es válido'
            });
        }

        const [asignaciones] = await db.query(
            `SELECT * FROM \`${TABLA}\` WHERE \`${clavePrimaria}\` = ?`,
            [id]
        );

        if (asignaciones.length === 0) {
            return res.status(404).json({
                mensaje: 'Asignación no encontrada'
            });
        }

        return res.status(200).json(asignaciones[0]);
    } catch (error) {
        console.error('Error al consultar asignación:', error);

        return res.status(500).json({
            mensaje: 'Error al consultar la asignación',
            error: error.message
        });
    }
};

// POST: crear una asignación
// POST /api/asignaciones
const crearAsignacion = async (req, res) => {
    try {
        const { id, camposEditables } = await obtenerEstructura();
        const cuerpo = req.body;

        if (
            !cuerpo ||
            typeof cuerpo !== 'object' ||
            Array.isArray(cuerpo)
        ) {
            return res.status(400).json({
                mensaje: 'Debes enviar los datos en formato JSON'
            });
        }

        const campos = Object.keys(cuerpo).filter(
            campo =>
                camposEditables.includes(campo) &&
                cuerpo[campo] !== undefined
        );

        if (campos.length === 0) {
            return res.status(400).json({
                mensaje: 'No se recibieron campos válidos para la asignación'
            });
        }

        const columnasSQL = campos
            .map(campo => `\`${campo}\``)
            .join(', ');

        const marcadores = campos.map(() => '?').join(', ');
        const valores = campos.map(campo => cuerpo[campo]);

        const [resultado] = await db.query(
            `INSERT INTO \`${TABLA}\` (${columnasSQL})
             VALUES (${marcadores})`,
            valores
        );

        return res.status(201).json({
            mensaje: 'Asignación creada correctamente',
            [id]: resultado.insertId
        });
    } catch (error) {
        console.error('Error al crear asignación:', error);

        if (
            error.code === 'ER_NO_REFERENCED_ROW_2' ||
            error.code === 'ER_NO_REFERENCED_ROW'
        ) {
            return res.status(400).json({
                mensaje: 'Una de las referencias enviadas no existe',
                error: error.message
            });
        }

        return res.status(500).json({
            mensaje: 'Error al crear la asignación',
            error: error.message
        });
    }
};

// PUT: actualizar una asignación
// PUT /api/asignaciones/:id
const actualizarAsignacion = async (req, res) => {
    try {
        const { id: clavePrimaria, camposEditables } =
            await obtenerEstructura();

        const id = Number(req.params.id);
        const cuerpo = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID de la asignación no es válido'
            });
        }

        if (
            !cuerpo ||
            typeof cuerpo !== 'object' ||
            Array.isArray(cuerpo)
        ) {
            return res.status(400).json({
                mensaje: 'Debes enviar los datos en formato JSON'
            });
        }

        const campos = Object.keys(cuerpo).filter(
            campo =>
                camposEditables.includes(campo) &&
                cuerpo[campo] !== undefined
        );

        if (campos.length === 0) {
            return res.status(400).json({
                mensaje: 'Envía al menos un campo válido para actualizar'
            });
        }

        const asignacionesSQL = campos
            .map(campo => `\`${campo}\` = ?`)
            .join(', ');

        const valores = campos.map(campo => cuerpo[campo]);

        const [resultado] = await db.query(
            `UPDATE \`${TABLA}\`
             SET ${asignacionesSQL}
             WHERE \`${clavePrimaria}\` = ?`,
            [...valores, id]
        );

        if (resultado.affectedRows === 0) {
            const [existentes] = await db.query(
                `SELECT \`${clavePrimaria}\`
                 FROM \`${TABLA}\`
                 WHERE \`${clavePrimaria}\` = ?`,
                [id]
            );

            if (existentes.length === 0) {
                return res.status(404).json({
                    mensaje: 'Asignación no encontrada'
                });
            }
        }

        return res.status(200).json({
            mensaje: 'Asignación actualizada correctamente',
            id
        });
    } catch (error) {
        console.error('Error al actualizar asignación:', error);

        return res.status(500).json({
            mensaje: 'Error al actualizar la asignación',
            error: error.message
        });
    }
};

// DELETE: eliminar una asignación
// DELETE /api/asignaciones/:id
const eliminarAsignacion = async (req, res) => {
    try {
        const { id: clavePrimaria } = await obtenerEstructura();
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID de la asignación no es válido'
            });
        }

        const [resultado] = await db.query(
            `DELETE FROM \`${TABLA}\` WHERE \`${clavePrimaria}\` = ?`,
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Asignación no encontrada'
            });
        }

        return res.status(200).json({
            mensaje: 'Asignación eliminada correctamente',
            id
        });
    } catch (error) {
        console.error('Error al eliminar asignación:', error);

        if (
            error.code === 'ER_ROW_IS_REFERENCED_2' ||
            error.code === 'ER_ROW_IS_REFERENCED'
        ) {
            return res.status(409).json({
                mensaje: 'No se puede eliminar la asignación porque tiene registros relacionados'
            });
        }

        return res.status(500).json({
            mensaje: 'Error al eliminar la asignación',
            error: error.message
        });
    }
};

// Exportar funciones específicas y genéricas
module.exports = {
    obtenerAsignaciones,
    obtenerAsignacionPorId,
    crearAsignacion,
    actualizarAsignacion,
    eliminarAsignacion,

    listar: obtenerAsignaciones,
    obtenerPorId: obtenerAsignacionPorId,
    crear: crearAsignacion,
    actualizar: actualizarAsignacion,
    eliminar: eliminarAsignacion,

    obtenerAsignacionesServicio: obtenerAsignaciones,
    obtenerAsignacionServicioPorId: obtenerAsignacionPorId,
    crearAsignacionServicio: crearAsignacion,
    actualizarAsignacionServicio: actualizarAsignacion,
    eliminarAsignacionServicio: eliminarAsignacion
};