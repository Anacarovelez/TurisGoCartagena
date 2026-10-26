
const pool = require('../config/db');

// Consultar todos los servicios
async function obtenerServicios(req, res) {
    try {
        const [servicios] = await pool.query(`
            SELECT
                s.*,
                ts.nombre_servicio,
                ts.descripcion_servicio,
                a.nombre_agencia
            FROM servicio s
            LEFT JOIN tipo_servicio ts
                ON s.id_tipo_servicio = ts.id_tipo_servicio
            LEFT JOIN agencia a
                ON s.id_agencia = a.id_agencia
            ORDER BY s.id_servicio DESC
        `);

        res.status(200).json({
            total: servicios.length,
            servicios
        });
    } catch (error) {
        console.error('Error al consultar servicios:', error.message);
        res.status(500).json({
            mensaje: 'Error al consultar los servicios'
        });
    }
}

// Consultar un servicio por ID
async function obtenerServicioPorId(req, res) {
    try {
        const { id } = req.params;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                mensaje: 'El ID del servicio no es válido'
            });
        }

        const [servicios] = await pool.query(`
            SELECT
                s.*,
                ts.nombre_servicio,
                ts.descripcion_servicio,
                a.nombre_agencia
            FROM servicio s
            LEFT JOIN tipo_servicio ts
                ON s.id_tipo_servicio = ts.id_tipo_servicio
            LEFT JOIN agencia a
                ON s.id_agencia = a.id_agencia
            WHERE s.id_servicio = ?
        `, [id]);

        if (servicios.length === 0) {
            return res.status(404).json({
                mensaje: 'Servicio no encontrado'
            });
        }

        res.status(200).json(servicios[0]);
    } catch (error) {
        console.error('Error al consultar servicio:', error.message);
        res.status(500).json({
            mensaje: 'Error al consultar el servicio'
        });
    }
}

// Registrar un servicio
async function crearServicio(req, res) {
    try {
        const {
            fecha_servicio,
            hora_servicio,
            origen_ruta,
            destino_ruta,
            cantidad_pasajeros,
            valor_total,
            estado_servicio,
            observaciones,
            id_cliente,
            id_tipo_servicio,
            id_agencia
        } = req.body || {};

        if (
            !fecha_servicio ||
            !hora_servicio ||
            !origen_ruta ||
            !destino_ruta ||
            cantidad_pasajeros == null ||
            valor_total == null ||
            id_cliente == null ||
            id_tipo_servicio == null ||
            id_agencia == null
        ) {
            return res.status(400).json({
                mensaje: 'Faltan campos obligatorios para registrar el servicio'
            });
        }

        const [resultado] = await pool.query(`
            INSERT INTO servicio (
                fecha_servicio,
                hora_servicio,
                origen_ruta,
                destino_ruta,
                cantidad_pasajeros,
                valor_total,
                estado_servicio,
                observaciones,
                id_cliente,
                id_tipo_servicio,
                id_agencia
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            fecha_servicio,
            hora_servicio,
            origen_ruta,
            destino_ruta,
            cantidad_pasajeros,
            valor_total,
            estado_servicio || 'Disponible',
            observaciones || null,
            id_cliente,
            id_tipo_servicio,
            id_agencia
        ]);

        res.status(201).json({
            mensaje: 'Servicio creado correctamente',
            id_servicio: resultado.insertId
        });
    } catch (error) {
        console.error('Error al crear servicio:', error.message);
        res.status(500).json({
            mensaje: 'Error al crear el servicio'
        });
    }
}

// Actualizar un servicio por ID
async function actualizarServicio(req, res) {
    try {
        const { id } = req.params;
        const datos = req.body;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                mensaje: 'El ID del servicio no es válido'
            });
        }

        if (
            !datos ||
            typeof datos !== 'object' ||
            Array.isArray(datos)
        ) {
            return res.status(400).json({
                mensaje: 'Debes enviar los datos del servicio en formato JSON'
            });
        }

        const camposPermitidos = [
            'fecha_servicio',
            'hora_servicio',
            'origen_ruta',
            'destino_ruta',
            'cantidad_pasajeros',
            'valor_total',
            'estado_servicio',
            'observaciones',
            'id_cliente',
            'id_tipo_servicio',
            'id_agencia'
        ];

        const campos = Object.keys(datos).filter(campo =>
            camposPermitidos.includes(campo)
        );

        if (campos.length === 0) {
            return res.status(400).json({
                mensaje: 'No se enviaron campos válidos para actualizar'
            });
        }

        const valores = campos.map(campo => datos[campo]);
        const actualizaciones = campos
            .map(campo => `\`${campo}\` = ?`)
            .join(', ');

        const [resultado] = await pool.query(
            `UPDATE servicio SET ${actualizaciones} WHERE id_servicio = ?`,
            [...valores, id]
        );

        if (resultado.affectedRows === 0) {
            const [existentes] = await pool.query(
                'SELECT id_servicio FROM servicio WHERE id_servicio = ?',
                [id]
            );

            if (existentes.length === 0) {
                return res.status(404).json({
                    mensaje: 'Servicio no encontrado'
                });
            }
        }

        res.status(200).json({
            mensaje: 'Servicio actualizado correctamente',
            id_servicio: Number(id)
        });
    } catch (error) {
        console.error('Error al actualizar servicio:', error.message);
        res.status(500).json({
            mensaje: 'Error al actualizar el servicio'
        });
    }
}

// Eliminar un servicio por ID
async function eliminarServicio(req, res) {
    try {
        const { id } = req.params;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                mensaje: 'El ID del servicio no es válido'
            });
        }

        const [resultado] = await pool.query(
            'DELETE FROM servicio WHERE id_servicio = ?',
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Servicio no encontrado'
            });
        }

        res.status(200).json({
            mensaje: 'Servicio eliminado correctamente',
            id_servicio: Number(id)
        });
    } catch (error) {
        console.error('Error al eliminar servicio:', error.message);

        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                mensaje: 'No se puede eliminar el servicio porque tiene registros relacionados'
            });
        }

        res.status(500).json({
            mensaje: 'Error al eliminar el servicio'
        });
    }
}

module.exports = {
    obtenerServicios,
    obtenerServicioPorId,
    crearServicio,
    actualizarServicio,
    eliminarServicio
};