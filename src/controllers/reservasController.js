const db = require('../config/db');

const ESTADOS_RESERVA = [
    'Pendiente',
    'Confirmada',
    'Cancelada',
    'Completada'
];

const obtenerReservas = async (req, res) => {
    try {
        const [reservas] = await db.query(`
            SELECT
                r.id_reserva,
                r.id_cliente,
                CONCAT(c.nombres, ' ', c.apellidos) AS nombre_cliente,
                r.id_disponibilidad,
                d.id_experiencia,
                e.nombre_experiencia,
                a.nombre_agencia,
                d.fecha AS fecha_experiencia,
                d.hora_inicio,
                r.fecha_reserva,
                r.cantidad_personas,
                r.precio_unitario,
                r.total,
                r.estado_reserva,
                r.observaciones
            FROM reserva r
            INNER JOIN cliente c ON c.id_cliente = r.id_cliente
            INNER JOIN disponibilidad_experiencia d
                ON d.id_disponibilidad = r.id_disponibilidad
            INNER JOIN experiencia e ON e.id_experiencia = d.id_experiencia
            INNER JOIN agencia a ON a.id_agencia = e.id_agencia
            ORDER BY r.id_reserva DESC
        `);

        return res.status(200).json(reservas);
    } catch (error) {
        console.error('Error al listar reservas:', error);
        return res.status(500).json({
            mensaje: 'Error al consultar las reservas',
            error: error.message
        });
    }
};


const obtenerReservaPorId = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'ID de reserva no válido'
            });
        }

        const [reservas] = await db.query(`
            SELECT
                r.*,
                CONCAT(c.nombres, ' ', c.apellidos) AS nombre_cliente,
                d.id_experiencia,
                e.nombre_experiencia,
                a.nombre_agencia,
                d.fecha AS fecha_experiencia,
                d.hora_inicio
            FROM reserva r
            INNER JOIN cliente c ON c.id_cliente = r.id_cliente
            INNER JOIN disponibilidad_experiencia d
                ON d.id_disponibilidad = r.id_disponibilidad
            INNER JOIN experiencia e ON e.id_experiencia = d.id_experiencia
            INNER JOIN agencia a ON a.id_agencia = e.id_agencia
            WHERE r.id_reserva = ?
        `, [id]);

        if (reservas.length === 0) {
            return res.status(404).json({
                mensaje: 'Reserva no encontrada'
            });
        }

        return res.status(200).json(reservas[0]);
    } catch (error) {
        console.error('Error al consultar reserva:', error);
        return res.status(500).json({
            mensaje: 'Error al consultar la reserva',
            error: error.message
        });
    }
};


// POST: crea la reserva y aparta los cupos en una transacción.
const crearReserva = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const idCliente = Number(req.body?.id_cliente);
        const idDisponibilidad = Number(req.body?.id_disponibilidad);
        const cantidad = Number(req.body?.cantidad_personas);
        const observaciones = req.body?.observaciones || null;

        if (!Number.isInteger(idCliente) || idCliente <= 0) {
            return res.status(400).json({
                mensaje: 'Debes indicar un ID de cliente válido'
            });
        }

        if (!Number.isInteger(idDisponibilidad) || idDisponibilidad <= 0) {
            return res.status(400).json({
                mensaje: 'Debes indicar un ID de disponibilidad válido'
            });
        }

        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            return res.status(400).json({
                mensaje: 'La cantidad de personas debe ser un entero positivo'
            });
        }

        await connection.beginTransaction();

        const [disponibilidades] = await connection.query(`
            SELECT
                d.id_disponibilidad,
                d.cupos_totales,
                d.cupos_reservados,
                d.estado_disponibilidad,
                e.precio_por_persona
            FROM disponibilidad_experiencia d
            INNER JOIN experiencia e
                ON e.id_experiencia = d.id_experiencia
            WHERE d.id_disponibilidad = ?
            FOR UPDATE
        `, [idDisponibilidad]);

        if (disponibilidades.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                mensaje: 'Disponibilidad no encontrada'
            });
        }

        const disponibilidad = disponibilidades[0];

        if (disponibilidad.estado_disponibilidad !== 'Activa') {
            await connection.rollback();

            return res.status(409).json({
                mensaje: 'Esta disponibilidad no está activa'
            });
        }

        const disponibles =
            Number(disponibilidad.cupos_totales) -
            Number(disponibilidad.cupos_reservados);

        if (cantidad > disponibles) {
            await connection.rollback();

            return res.status(409).json({
                mensaje: 'No hay suficientes cupos disponibles',
                cupos_disponibles: disponibles
            });
        }

        const precioUnitario = Number(disponibilidad.precio_por_persona);
        const total = Number((precioUnitario * cantidad).toFixed(2));

        await connection.query(`
            UPDATE disponibilidad_experiencia
            SET cupos_reservados = cupos_reservados + ?
            WHERE id_disponibilidad = ?
        `, [cantidad, idDisponibilidad]);

        const [resultado] = await connection.query(`
            INSERT INTO reserva (
                id_cliente,
                id_disponibilidad,
                cantidad_personas,
                precio_unitario,
                total,
                estado_reserva,
                observaciones
            ) VALUES (?, ?, ?, ?, ?, 'Pendiente', ?)
        `, [
            idCliente,
            idDisponibilidad,
            cantidad,
            precioUnitario,
            total,
            observaciones
        ]);

        await connection.commit();

        return res.status(201).json({
            mensaje: 'Reserva creada correctamente',
            id_reserva: resultado.insertId,
            cantidad_personas: cantidad,
            precio_unitario: precioUnitario,
            total,
            estado_reserva: 'Pendiente'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error al crear reserva:', error);

        if (
            error.code === 'ER_NO_REFERENCED_ROW_2' ||
            error.code === 'ER_NO_REFERENCED_ROW'
        ) {
            return res.status(400).json({
                mensaje: 'El cliente indicado no existe'
            });
        }

        return res.status(500).json({
            mensaje: 'Error al crear la reserva',
            error: error.message
        });
    } finally {
        connection.release();
    }
};


// PUT: cambia estado, observaciones o número de personas,
// ajustando los cupos de forma transaccional.
const actualizarReserva = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const id = Number(req.params.id);
        const cuerpo = req.body || {};

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'ID de reserva no válido'
            });
        }

        const camposPermitidos = [
            'estado_reserva',
            'cantidad_personas',
            'observaciones'
        ];

        const camposRecibidos = Object.keys(cuerpo).filter(
            campo => camposPermitidos.includes(campo)
        );

        if (camposRecibidos.length === 0) {
            return res.status(400).json({
                mensaje: 'Envía estado_reserva, cantidad_personas u observaciones'
            });
        }

        if (
            cuerpo.estado_reserva !== undefined &&
            !ESTADOS_RESERVA.includes(cuerpo.estado_reserva)
        ) {
            return res.status(400).json({
                mensaje: `El estado debe ser uno de: ${ESTADOS_RESERVA.join(', ')}`
            });
        }

        if (cuerpo.cantidad_personas !== undefined) {
            cuerpo.cantidad_personas = Number(cuerpo.cantidad_personas);

            if (
                !Number.isInteger(cuerpo.cantidad_personas) ||
                cuerpo.cantidad_personas <= 0
            ) {
                return res.status(400).json({
                    mensaje: 'La cantidad de personas debe ser un entero positivo'
                });
            }
        }

        await connection.beginTransaction();

        const [filasReserva] = await connection.query(
            `SELECT * FROM reserva WHERE id_reserva = ? FOR UPDATE`,
            [id]
        );

        if (filasReserva.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                mensaje: 'Reserva no encontrada'
            });
        }

        const reserva = filasReserva[0];

        const [filasDisponibilidad] = await connection.query(
            `SELECT * FROM disponibilidad_experiencia
             WHERE id_disponibilidad = ?
             FOR UPDATE`,
            [reserva.id_disponibilidad]
        );

        if (filasDisponibilidad.length === 0) {
            await connection.rollback();

            return res.status(409).json({
                mensaje: 'No se encontró la disponibilidad de esta reserva'
            });
        }

        const disponibilidad = filasDisponibilidad[0];

        const estadoAnterior = reserva.estado_reserva;
        const nuevoEstado =
            cuerpo.estado_reserva === undefined
                ? estadoAnterior
                : cuerpo.estado_reserva;

        const cantidadAnterior = Number(reserva.cantidad_personas);
        const nuevaCantidad =
            cuerpo.cantidad_personas === undefined
                ? cantidadAnterior
                : cuerpo.cantidad_personas;

        const reservaAnteriorActiva = estadoAnterior !== 'Cancelada';
        const reservaNuevaActiva = nuevoEstado !== 'Cancelada';

        let cuposReservados = Number(disponibilidad.cupos_reservados);
        const cuposTotales = Number(disponibilidad.cupos_totales);

        if (reservaAnteriorActiva && !reservaNuevaActiva) {
            cuposReservados -= cantidadAnterior;
        } else if (!reservaAnteriorActiva && reservaNuevaActiva) {
            const disponibles = cuposTotales - cuposReservados;

            if (nuevaCantidad > disponibles) {
                await connection.rollback();

                return res.status(409).json({
                    mensaje: 'No hay suficientes cupos para reactivar esta reserva',
                    cupos_disponibles: disponibles
                });
            }

            cuposReservados += nuevaCantidad;
        } else if (reservaAnteriorActiva && reservaNuevaActiva) {
            const diferencia = nuevaCantidad - cantidadAnterior;

            if (diferencia > cuposTotales - cuposReservados) {
                await connection.rollback();

                return res.status(409).json({
                    mensaje: 'No hay suficientes cupos para aumentar esta reserva',
                    cupos_disponibles: cuposTotales - cuposReservados
                });
            }

            cuposReservados += diferencia;
        }

        await connection.query(
            `UPDATE disponibilidad_experiencia
             SET cupos_reservados = ?
             WHERE id_disponibilidad = ?`,
            [cuposReservados, reserva.id_disponibilidad]
        );

        const precio = Number(reserva.precio_unitario);
        const total = Number((precio * nuevaCantidad).toFixed(2));
        const observaciones =
            cuerpo.observaciones === undefined
                ? reserva.observaciones
                : cuerpo.observaciones;

        await connection.query(`
            UPDATE reserva
            SET cantidad_personas = ?,
                total = ?,
                estado_reserva = ?,
                observaciones = ?
            WHERE id_reserva = ?
        `, [
            nuevaCantidad,
            total,
            nuevoEstado,
            observaciones,
            id
        ]);

        await connection.commit();

        return res.status(200).json({
            mensaje: 'Reserva actualizada correctamente',
            id_reserva: id,
            cantidad_personas: nuevaCantidad,
            total,
            estado_reserva: nuevoEstado
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error al actualizar reserva:', error);

        return res.status(500).json({
            mensaje: 'Error al actualizar la reserva',
            error: error.message
        });
    } finally {
        connection.release();
    }
};


// DELETE: cancela la reserva y devuelve los cupos.
// Se conserva el historial, en lugar de borrar físicamente la reserva.
const eliminarReserva = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'ID de reserva no válido'
            });
        }

        await connection.beginTransaction();

        const [filas] = await connection.query(
            `SELECT * FROM reserva WHERE id_reserva = ? FOR UPDATE`,
            [id]
        );

        if (filas.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                mensaje: 'Reserva no encontrada'
            });
        }

        const reserva = filas[0];

        if (reserva.estado_reserva !== 'Cancelada') {
            await connection.query(`
                UPDATE disponibilidad_experiencia
                SET cupos_reservados =
                    cupos_reservados - ?
                WHERE id_disponibilidad = ?
            `, [
                reserva.cantidad_personas,
                reserva.id_disponibilidad
            ]);

            await connection.query(`
                UPDATE reserva
                SET estado_reserva = 'Cancelada'
                WHERE id_reserva = ?
            `, [id]);
        }

        await connection.commit();

        return res.status(200).json({
            mensaje: 'Reserva cancelada y cupos liberados',
            id_reserva: id
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error al cancelar reserva:', error);

        return res.status(500).json({
            mensaje: 'Error al cancelar la reserva',
            error: error.message
        });
    } finally {
        connection.release();
    }
};


module.exports = {
    obtenerReservas,
    obtenerReservaPorId,
    crearReserva,
    actualizarReserva,
    eliminarReserva
};