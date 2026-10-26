const db = require('../config/db');

const obtenerDisponibilidades = async (req, res) => {
    try {
        const [filas] = await db.query(`
            SELECT
                d.id_disponibilidad,
                d.id_experiencia,
                e.nombre_experiencia,
                a.nombre_agencia,
                d.fecha,
                d.hora_inicio,
                d.hora_fin,
                d.cupos_totales,
                d.cupos_reservados,
                (d.cupos_totales - d.cupos_reservados)
                    AS cupos_disponibles,
                d.estado_disponibilidad,
                d.creado_en
            FROM disponibilidad_experiencia d
            INNER JOIN experiencia e
                ON e.id_experiencia = d.id_experiencia
            INNER JOIN agencia a
                ON a.id_agencia = e.id_agencia
            ORDER BY d.fecha, d.hora_inicio
        `);

        return res.status(200).json(filas);
    } catch (error) {
        console.error('Error al listar disponibilidades:', error);
        return res.status(500).json({
            mensaje: 'Error al consultar disponibilidades',
            error: error.message
        });
    }
};


const obtenerDisponibilidadPorId = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'ID de disponibilidad no válido'
            });
        }

        const [filas] = await db.query(`
            SELECT
                d.*,
                e.nombre_experiencia,
                e.precio_por_persona,
                a.nombre_agencia,
                (d.cupos_totales - d.cupos_reservados)
                    AS cupos_disponibles
            FROM disponibilidad_experiencia d
            INNER JOIN experiencia e
                ON e.id_experiencia = d.id_experiencia
            INNER JOIN agencia a
                ON a.id_agencia = e.id_agencia
            WHERE d.id_disponibilidad = ?
        `, [id]);

        if (filas.length === 0) {
            return res.status(404).json({
                mensaje: 'Disponibilidad no encontrada'
            });
        }

        return res.status(200).json(filas[0]);
    } catch (error) {
        console.error('Error al consultar disponibilidad:', error);
        return res.status(500).json({
            mensaje: 'Error al consultar la disponibilidad',
            error: error.message
        });
    }
};


const crearDisponibilidad = async (req, res) => {
    try {
        const {
            id_experiencia,
            fecha,
            hora_inicio,
            hora_fin,
            cupos_totales,
            estado_disponibilidad
        } = req.body || {};

        const experienciaId = Number(id_experiencia);
        const cupos = Number(cupos_totales);

        if (!Number.isInteger(experienciaId) || experienciaId <= 0) {
            return res.status(400).json({
                mensaje: 'Debes indicar un ID de experiencia válido'
            });
        }

        if (
            typeof fecha !== 'string' ||
            !/^\d{4}-\d{2}-\d{2}$/.test(fecha)
        ) {
            return res.status(400).json({
                mensaje: 'La fecha debe tener el formato YYYY-MM-DD'
            });
        }

        if (
            typeof hora_inicio !== 'string' ||
            !/^\d{2}:\d{2}(:\d{2})?$/.test(hora_inicio)
        ) {
            return res.status(400).json({
                mensaje: 'La hora de inicio debe tener formato HH:mm o HH:mm:ss'
            });
        }

        if (
            hora_fin &&
            (typeof hora_fin !== 'string' ||
                !/^\d{2}:\d{2}(:\d{2})?$/.test(hora_fin))
        ) {
            return res.status(400).json({
                mensaje: 'La hora de fin debe tener formato HH:mm o HH:mm:ss'
            });
        }

        if (!Number.isInteger(cupos) || cupos <= 0) {
            return res.status(400).json({
                mensaje: 'Los cupos totales deben ser un entero positivo'
            });
        }

        const estado = estado_disponibilidad || 'Activa';

        if (!['Activa', 'Inactiva'].includes(estado)) {
            return res.status(400).json({
                mensaje: 'El estado debe ser Activa o Inactiva'
            });
        }

        const [resultado] = await db.query(`
            INSERT INTO disponibilidad_experiencia (
                id_experiencia,
                fecha,
                hora_inicio,
                hora_fin,
                cupos_totales,
                estado_disponibilidad
            ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
            experienciaId,
            fecha,
            hora_inicio,
            hora_fin || null,
            cupos,
            estado
        ]);

        return res.status(201).json({
            mensaje: 'Disponibilidad creada correctamente',
            id_disponibilidad: resultado.insertId
        });
    } catch (error) {
        console.error('Error al crear disponibilidad:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                mensaje: 'Ya existe un horario para esa experiencia, fecha y hora'
            });
        }

        if (
            error.code === 'ER_NO_REFERENCED_ROW_2' ||
            error.code === 'ER_NO_REFERENCED_ROW'
        ) {
            return res.status(400).json({
                mensaje: 'La experiencia indicada no existe'
            });
        }

        return res.status(500).json({
            mensaje: 'Error al crear la disponibilidad',
            error: error.message
        });
    }
};


const actualizarDisponibilidad = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const cuerpo = req.body || {};

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'ID de disponibilidad no válido'
            });
        }

        const permitidos = [
            'id_experiencia',
            'fecha',
            'hora_inicio',
            'hora_fin',
            'cupos_totales',
            'estado_disponibilidad'
        ];

        const campos = Object.keys(cuerpo).filter(
            campo => permitidos.includes(campo)
        );

        if (campos.length === 0) {
            return res.status(400).json({
                mensaje: 'Envía al menos un campo válido para actualizar'
            });
        }

        if (cuerpo.id_experiencia !== undefined) {
            const valor = Number(cuerpo.id_experiencia);

            if (!Number.isInteger(valor) || valor <= 0) {
                return res.status(400).json({
                    mensaje: 'El ID de experiencia debe ser válido'
                });
            }

            cuerpo.id_experiencia = valor;
        }

        if (cuerpo.fecha !== undefined &&
            (typeof cuerpo.fecha !== 'string' ||
                !/^\d{4}-\d{2}-\d{2}$/.test(cuerpo.fecha))) {
            return res.status(400).json({
                mensaje: 'La fecha debe tener formato YYYY-MM-DD'
            });
        }

        for (const campo of ['hora_inicio', 'hora_fin']) {
            if (
                cuerpo[campo] !== undefined &&
                cuerpo[campo] !== null &&
                cuerpo[campo] !== '' &&
                (typeof cuerpo[campo] !== 'string' ||
                    !/^\d{2}:\d{2}(:\d{2})?$/.test(cuerpo[campo]))
            ) {
                return res.status(400).json({
                    mensaje: `${campo} debe tener formato HH:mm o HH:mm:ss`
                });
            }
        }

        if (cuerpo.cupos_totales !== undefined) {
            cuerpo.cupos_totales = Number(cuerpo.cupos_totales);

            if (!Number.isInteger(cuerpo.cupos_totales) ||
                cuerpo.cupos_totales <= 0) {
                return res.status(400).json({
                    mensaje: 'Los cupos totales deben ser un entero positivo'
                });
            }
        }

        if (
            cuerpo.estado_disponibilidad !== undefined &&
            !['Activa', 'Inactiva'].includes(cuerpo.estado_disponibilidad)
        ) {
            return res.status(400).json({
                mensaje: 'El estado debe ser Activa o Inactiva'
            });
        }

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const [actuales] = await connection.query(
                `SELECT * FROM disponibilidad_experiencia
                 WHERE id_disponibilidad = ?
                 FOR UPDATE`,
                [id]
            );

            if (actuales.length === 0) {
                await connection.rollback();

                return res.status(404).json({
                    mensaje: 'Disponibilidad no encontrada'
                });
            }

            const actual = actuales[0];
            const cuposNuevo =
                cuerpo.cupos_totales === undefined
                    ? actual.cupos_totales
                    : cuerpo.cupos_totales;

            if (cuposNuevo < actual.cupos_reservados) {
                await connection.rollback();

                return res.status(409).json({
                    mensaje: 'Los cupos totales no pueden ser inferiores a los ya reservados',
                    cupos_reservados: actual.cupos_reservados
                });
            }

            const valores = campos.map(campo => cuerpo[campo]);
            const asignaciones = campos
                .map(campo => `\`${campo}\` = ?`)
                .join(', ');

            await connection.query(
                `UPDATE disponibilidad_experiencia
                 SET ${asignaciones}
                 WHERE id_disponibilidad = ?`,
                [...valores, id]
            );

            await connection.commit();

            return res.status(200).json({
                mensaje: 'Disponibilidad actualizada correctamente',
                id_disponibilidad: id
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error al actualizar disponibilidad:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                mensaje: 'Ya existe una disponibilidad para ese horario'
            });
        }

        return res.status(500).json({
            mensaje: 'Error al actualizar la disponibilidad',
            error: error.message
        });
    }
};


const eliminarDisponibilidad = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'ID de disponibilidad no válido'
            });
        }

        const [resultado] = await db.query(
            `DELETE FROM disponibilidad_experiencia
             WHERE id_disponibilidad = ?`,
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Disponibilidad no encontrada'
            });
        }

        return res.status(200).json({
            mensaje: 'Disponibilidad eliminada correctamente',
            id_disponibilidad: id
        });
    } catch (error) {
        console.error('Error al eliminar disponibilidad:', error);

        if (
            error.code === 'ER_ROW_IS_REFERENCED_2' ||
            error.code === 'ER_ROW_IS_REFERENCED'
        ) {
            return res.status(409).json({
                mensaje: 'No se puede eliminar una disponibilidad con reservas relacionadas'
            });
        }

        return res.status(500).json({
            mensaje: 'Error al eliminar la disponibilidad',
            error: error.message
        });
    }
};


module.exports = {
    obtenerDisponibilidades,
    obtenerDisponibilidadPorId,
    crearDisponibilidad,
    actualizarDisponibilidad,
    eliminarDisponibilidad
};