const db = require('../config/db');

// =====================================================
// Obtener estructura real de la tabla vehiculo
// =====================================================
const obtenerEstructuraVehiculos = async () => {
    const [columnas] = await db.query('SHOW COLUMNS FROM `vehiculo`');

    if (columnas.length === 0) {
        throw new Error('La tabla vehiculo no contiene columnas');
    }

    const clavePrimaria = columnas.find(
        columna => columna.Key === 'PRI'
    );

    if (!clavePrimaria) {
        throw new Error('No se encontró la clave primaria de vehiculo');
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
        id: clavePrimaria.Field,
        camposEditables
    };
};


// =====================================================
// GET: Listar todos los vehículos
// GET /api/vehiculos
// =====================================================
const obtenerVehiculos = async (req, res) => {
    try {
        const { id } = await obtenerEstructuraVehiculos();

        const [vehiculos] = await db.query(
            `SELECT * FROM \`vehiculo\` ORDER BY \`${id}\` DESC`
        );

        return res.status(200).json(vehiculos);
    } catch (error) {
        console.error('Error al consultar vehículos:', error);

        return res.status(500).json({
            mensaje: 'Error al consultar los vehículos',
            error: error.message
        });
    }
};


// =====================================================
// GET: Consultar un vehículo por ID
// GET /api/vehiculos/:id
// =====================================================
const obtenerVehiculoPorId = async (req, res) => {
    try {
        const { id: clavePrimaria } =
            await obtenerEstructuraVehiculos();

        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID del vehículo no es válido'
            });
        }

        const [vehiculos] = await db.query(
            `SELECT * FROM \`vehiculo\`
             WHERE \`${clavePrimaria}\` = ?`,
            [id]
        );

        if (vehiculos.length === 0) {
            return res.status(404).json({
                mensaje: 'Vehículo no encontrado'
            });
        }

        return res.status(200).json(vehiculos[0]);
    } catch (error) {
        console.error('Error al consultar vehículo:', error);

        return res.status(500).json({
            mensaje: 'Error al consultar el vehículo',
            error: error.message
        });
    }
};


// =====================================================
// POST: Registrar un vehículo
// POST /api/vehiculos
// =====================================================
const crearVehiculo = async (req, res) => {
    try {
        const { id, camposEditables } =
            await obtenerEstructuraVehiculos();

        const cuerpo = req.body;

        if (
            !cuerpo ||
            typeof cuerpo !== 'object' ||
            Array.isArray(cuerpo)
        ) {
            return res.status(400).json({
                mensaje: 'Debes enviar los datos del vehículo en formato JSON'
            });
        }

        // Aceptar únicamente columnas existentes en MySQL.
        const camposRecibidos = Object.keys(cuerpo).filter(
            campo =>
                camposEditables.includes(campo) &&
                cuerpo[campo] !== undefined
        );

        if (camposRecibidos.length === 0) {
            return res.status(400).json({
                mensaje: 'No se recibieron campos válidos para registrar el vehículo'
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
            `INSERT INTO \`vehiculo\` (${columnasSQL})
             VALUES (${marcadores})`,
            valores
        );

        return res.status(201).json({
            mensaje: 'Vehículo registrado correctamente',
            id_vehiculo: resultado.insertId,
            id: resultado.insertId
        });
    } catch (error) {
        console.error('Error al registrar vehículo:', error);

        if (
            error.code === 'ER_NO_REFERENCED_ROW_2' ||
            error.code === 'ER_NO_REFERENCED_ROW'
        ) {
            return res.status(400).json({
                mensaje: 'No se pudo registrar el vehículo por una relación inválida',
                error: error.message
            });
        }

        return res.status(500).json({
            mensaje: 'Error al registrar el vehículo',
            error: error.message
        });
    }
};


// =====================================================
// PUT: Actualizar un vehículo
// PUT /api/vehiculos/:id
// =====================================================
const actualizarVehiculo = async (req, res) => {
    try {
        const { id: clavePrimaria, camposEditables } =
            await obtenerEstructuraVehiculos();

        const id = Number(req.params.id);
        const cuerpo = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID del vehículo no es válido'
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
            `UPDATE \`vehiculo\`
             SET ${asignacionesSQL}
             WHERE \`${clavePrimaria}\` = ?`,
            [...valores, id]
        );

        // Si los valores eran iguales, affectedRows puede ser cero.
        if (resultado.affectedRows === 0) {
            const [existentes] = await db.query(
                `SELECT \`${clavePrimaria}\`
                 FROM \`vehiculo\`
                 WHERE \`${clavePrimaria}\` = ?`,
                [id]
            );

            if (existentes.length === 0) {
                return res.status(404).json({
                    mensaje: 'Vehículo no encontrado'
                });
            }
        }

        return res.status(200).json({
            mensaje: 'Vehículo actualizado correctamente',
            id_vehiculo: id
        });
    } catch (error) {
        console.error('Error al actualizar vehículo:', error);

        return res.status(500).json({
            mensaje: 'Error al actualizar el vehículo',
            error: error.message
        });
    }
};


// =====================================================
// DELETE: Eliminar un vehículo
// DELETE /api/vehiculos/:id
// =====================================================
const eliminarVehiculo = async (req, res) => {
    try {
        const { id: clavePrimaria } =
            await obtenerEstructuraVehiculos();

        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID del vehículo no es válido'
            });
        }

        const [resultado] = await db.query(
            `DELETE FROM \`vehiculo\`
             WHERE \`${clavePrimaria}\` = ?`,
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Vehículo no encontrado'
            });
        }

        return res.status(200).json({
            mensaje: 'Vehículo eliminado correctamente',
            id_vehiculo: id
        });
    } catch (error) {
        console.error('Error al eliminar vehículo:', error);

        if (
            error.code === 'ER_ROW_IS_REFERENCED_2' ||
            error.code === 'ER_ROW_IS_REFERENCED'
        ) {
            return res.status(409).json({
                mensaje: 'No se puede eliminar el vehículo porque tiene asignaciones u otros registros relacionados'
            });
        }

        return res.status(500).json({
            mensaje: 'Error al eliminar el vehículo',
            error: error.message
        });
    }
};


// =====================================================
// Exportar funciones
// =====================================================
module.exports = {
    obtenerVehiculos,
    obtenerVehiculoPorId,
    crearVehiculo,
    actualizarVehiculo,
    eliminarVehiculo
};