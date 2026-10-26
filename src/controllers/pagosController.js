const db = require('../config/db');

// =====================================================
// Obtener la estructura real de la tabla pago
// =====================================================
const obtenerEstructuraPagos = async () => {
    const [columnas] = await db.query('SHOW COLUMNS FROM `pago`');

    if (columnas.length === 0) {
        throw new Error('La tabla pago no contiene columnas');
    }

    const clavePrimaria = columnas.find(
        columna => columna.Key === 'PRI'
    );

    if (!clavePrimaria) {
        throw new Error('No se encontró la clave primaria de la tabla pago');
    }

    const camposEditables = columnas
        .filter(columna =>
            columna.Field !== clavePrimaria.Field &&
            !String(columna.Extra || '')
                .toLowerCase()
                .includes('auto_increment') &&
            !String(columna.Extra || '')
                .toLowerCase()
                .includes('generated')
        )
        .map(columna => columna.Field);

    return {
        columnas,
        id: clavePrimaria.Field,
        camposEditables
    };
};


// =====================================================
// GET: Listar todos los pagos
// Endpoint: GET /api/pagos
// =====================================================
const obtenerPagos = async (req, res) => {
    try {
        const { id } = await obtenerEstructuraPagos();

        const [pagos] = await db.query(
            `SELECT * FROM \`pago\` ORDER BY \`${id}\` DESC`
        );

        return res.status(200).json(pagos);

    } catch (error) {
        console.error('Error al consultar pagos:', error);

        return res.status(500).json({
            mensaje: 'Error al consultar los pagos',
            error: error.message
        });
    }
};


// =====================================================
// GET: Consultar un pago por ID
// Endpoint: GET /api/pagos/:id
// =====================================================
const obtenerPagoPorId = async (req, res) => {
    try {
        const { id: clavePrimaria } = await obtenerEstructuraPagos();
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID del pago no es válido'
            });
        }

        const [pagos] = await db.query(
            `SELECT * FROM \`pago\` WHERE \`${clavePrimaria}\` = ?`,
            [id]
        );

        if (pagos.length === 0) {
            return res.status(404).json({
                mensaje: 'Pago no encontrado'
            });
        }

        return res.status(200).json(pagos[0]);

    } catch (error) {
        console.error('Error al consultar el pago:', error);

        return res.status(500).json({
            mensaje: 'Error al consultar el pago',
            error: error.message
        });
    }
};


// =====================================================
// POST: Registrar un pago
// Endpoint: POST /api/pagos
// =====================================================
const crearPago = async (req, res) => {
    try {
        const {
            id,
            camposEditables
        } = await obtenerEstructuraPagos();

        const cuerpo = req.body;

        if (
            !cuerpo ||
            typeof cuerpo !== 'object' ||
            Array.isArray(cuerpo)
        ) {
            return res.status(400).json({
                mensaje: 'Debes enviar los datos del pago en formato JSON'
            });
        }

        // Solo acepta campos que existen en la tabla.
        // La clave primaria autoincremental no se envía.
        const camposRecibidos = Object.keys(cuerpo).filter(
            campo =>
                camposEditables.includes(campo) &&
                cuerpo[campo] !== undefined
        );

        if (camposRecibidos.length === 0) {
            return res.status(400).json({
                mensaje: 'No se recibieron campos válidos para registrar el pago'
            });
        }

        const columnasSQL = camposRecibidos
            .map(campo => `\`${campo}\``)
            .join(', ');

        const marcadores = camposRecibidos
            .map(() => '?')
            .join(', ');

        const valores = camposRecibidos.map(
            campo => cuerpo[campo]
        );

        const [resultado] = await db.query(
            `INSERT INTO \`pago\` (${columnasSQL})
             VALUES (${marcadores})`,
            valores
        );

        return res.status(201).json({
            mensaje: 'Pago registrado correctamente',
            [id]: resultado.insertId
        });

    } catch (error) {
        console.error('Error al registrar pago:', error);

        return res.status(500).json({
            mensaje: 'Error al registrar el pago',
            error: error.message
        });
    }
};


// =====================================================
// PUT: Actualizar un pago
// Endpoint: PUT /api/pagos/:id
// =====================================================
const actualizarPago = async (req, res) => {
    try {
        const {
            id: clavePrimaria,
            camposEditables
        } = await obtenerEstructuraPagos();

        const id = Number(req.params.id);
        const cuerpo = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID del pago no es válido'
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

        const camposRecibidos = Object.keys(cuerpo).filter(
            campo =>
                camposEditables.includes(campo) &&
                cuerpo[campo] !== undefined
        );

        if (camposRecibidos.length === 0) {
            return res.status(400).json({
                mensaje: 'No se recibieron campos válidos para actualizar'
            });
        }

        const asignacionesSQL = camposRecibidos
            .map(campo => `\`${campo}\` = ?`)
            .join(', ');

        const valores = camposRecibidos.map(
            campo => cuerpo[campo]
        );

        const [resultado] = await db.query(
            `UPDATE \`pago\`
             SET ${asignacionesSQL}
             WHERE \`${clavePrimaria}\` = ?`,
            [...valores, id]
        );

        if (resultado.affectedRows === 0) {
            const [existentes] = await db.query(
                `SELECT \`${clavePrimaria}\`
                 FROM \`pago\`
                 WHERE \`${clavePrimaria}\` = ?`,
                [id]
            );

            if (existentes.length === 0) {
                return res.status(404).json({
                    mensaje: 'Pago no encontrado'
                });
            }
        }

        return res.status(200).json({
            mensaje: 'Pago actualizado correctamente',
            [clavePrimaria]: id
        });

    } catch (error) {
        console.error('Error al actualizar pago:', error);

        return res.status(500).json({
            mensaje: 'Error al actualizar el pago',
            error: error.message
        });
    }
};


// =====================================================
// DELETE: Eliminar un pago
// Endpoint: DELETE /api/pagos/:id
// =====================================================
const eliminarPago = async (req, res) => {
    try {
        const { id: clavePrimaria } = await obtenerEstructuraPagos();
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID del pago no es válido'
            });
        }

        const [resultado] = await db.query(
            `DELETE FROM \`pago\` WHERE \`${clavePrimaria}\` = ?`,
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Pago no encontrado'
            });
        }

        return res.status(200).json({
            mensaje: 'Pago eliminado correctamente',
            [clavePrimaria]: id
        });

    } catch (error) {
        console.error('Error al eliminar pago:', error);

        if (
            error.code === 'ER_ROW_IS_REFERENCED_2' ||
            error.code === 'ER_ROW_IS_REFERENCED'
        ) {
            return res.status(409).json({
                mensaje: 'No se puede eliminar el pago porque tiene registros relacionados'
            });
        }

        return res.status(500).json({
            mensaje: 'Error al eliminar el pago',
            error: error.message
        });
    }
};


// =====================================================
// Exportar funciones del controlador
// =====================================================
module.exports = {
    obtenerPagos,
    obtenerPagoPorId,
    crearPago,
    actualizarPago,
    eliminarPago
};