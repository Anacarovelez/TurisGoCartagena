
const pool = require('../config/db');

const consultaClientes = `
    SELECT
        c.id_cliente,
        c.tipo_documento,
        c.numero_documento,
        c.nombres,
        c.apellidos,
        c.telefono,
        c.email,
        c.nacionalidad,
        c.observaciones,
        c.id_origen_cliente,
        oc.tipo_origen,
        oc.descripcion AS descripcion_origen,
        c.id_agencia,
        a.nombre_agencia,
        c.id_vendedor,
        v.nombres AS nombres_vendedor,
        v.apellidos AS apellidos_vendedor
    FROM cliente c
    LEFT JOIN origen_cliente oc
        ON c.id_origen_cliente = oc.id_origen_cliente
    LEFT JOIN agencia a
        ON c.id_agencia = a.id_agencia
    LEFT JOIN vendedor v
        ON c.id_vendedor = v.id_vendedor
`;

// Validar IDs opcionales de las relaciones
function normalizarIdOpcional(valor) {
    if (valor === undefined || valor === null || valor === '') {
        return null;
    }

    const id = Number(valor);

    if (!Number.isInteger(id) || id <= 0) {
        return NaN;
    }

    return id;
}

function esIdValido(id) {
    return Number.isInteger(Number(id)) && Number(id) > 0;
}

// GET: consultar todos los clientes
async function obtenerClientes(req, res) {
    try {
        const [clientes] = await pool.query(`
            ${consultaClientes}
            ORDER BY c.id_cliente DESC
            LIMIT 50
        `);

        return res.status(200).json({
            total: clientes.length,
            clientes
        });
    } catch (error) {
        console.error('Error al consultar clientes:', error.message);

        return res.status(500).json({
            mensaje: 'Error al consultar los clientes'
        });
    }
}

// GET: consultar un cliente por ID
async function obtenerClientePorId(req, res) {
    try {
        const { id } = req.params;

        if (!esIdValido(id)) {
            return res.status(400).json({
                mensaje: 'El ID del cliente debe ser un entero positivo'
            });
        }

        const [clientes] = await pool.query(`
            ${consultaClientes}
            WHERE c.id_cliente = ?
        `, [Number(id)]);

        if (clientes.length === 0) {
            return res.status(404).json({
                mensaje: 'Cliente no encontrado'
            });
        }

        return res.status(200).json(clientes[0]);
    } catch (error) {
        console.error('Error al consultar cliente:', error.message);

        return res.status(500).json({
            mensaje: 'Error al consultar el cliente'
        });
    }
}

// POST: registrar un cliente
async function crearCliente(req, res) {
    try {
        const datos = req.body || {};

        const {
            tipo_documento,
            numero_documento,
            nombres,
            apellidos,
            telefono,
            email,
            nacionalidad,
            observaciones
        } = datos;

        if (
            typeof nombres !== 'string' ||
            !nombres.trim() ||
            typeof apellidos !== 'string' ||
            !apellidos.trim()
        ) {
            return res.status(400).json({
                mensaje: 'Los nombres y apellidos son obligatorios'
            });
        }

        if (
            email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            return res.status(400).json({
                mensaje: 'El correo electrónico no tiene un formato válido'
            });
        }

        const idOrigen = normalizarIdOpcional(datos.id_origen_cliente);
        const idAgencia = normalizarIdOpcional(datos.id_agencia);
        const idVendedor = normalizarIdOpcional(datos.id_vendedor);

        if (
            Number.isNaN(idOrigen) ||
            Number.isNaN(idAgencia) ||
            Number.isNaN(idVendedor)
        ) {
            return res.status(400).json({
                mensaje: 'Los IDs de origen, agencia y vendedor deben ser válidos'
            });
        }

        const [resultado] = await pool.query(`
            INSERT INTO cliente (
                tipo_documento,
                numero_documento,
                nombres,
                apellidos,
                telefono,
                email,
                nacionalidad,
                observaciones,
                id_origen_cliente,
                id_agencia,
                id_vendedor
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            tipo_documento || null,
            numero_documento || null,
            nombres.trim(),
            apellidos.trim(),
            telefono || null,
            email || null,
            nacionalidad || null,
            observaciones || null,
            idOrigen,
            idAgencia,
            idVendedor
        ]);

        return res.status(201).json({
            mensaje: 'Cliente registrado correctamente',
            id_cliente: resultado.insertId
        });
    } catch (error) {
        console.error('Error al registrar cliente:', error.message);

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                mensaje: 'El origen, la agencia o el vendedor indicado no existe'
            });
        }

        return res.status(500).json({
            mensaje: 'Error al registrar el cliente'
        });
    }
}

// PUT: actualizar un cliente
async function actualizarCliente(req, res) {
    try {
        const { id } = req.params;
        const datos = req.body || {};

        if (!esIdValido(id)) {
            return res.status(400).json({
                mensaje: 'El ID del cliente debe ser un entero positivo'
            });
        }

        const camposPermitidos = [
            'tipo_documento',
            'numero_documento',
            'nombres',
            'apellidos',
            'telefono',
            'email',
            'nacionalidad',
            'observaciones',
            'id_origen_cliente',
            'id_agencia',
            'id_vendedor'
        ];

        const campos = Object.keys(datos).filter(
            campo => camposPermitidos.includes(campo)
        );

        if (campos.length === 0) {
            return res.status(400).json({
                mensaje: 'Debes enviar al menos un campo válido para actualizar'
            });
        }

        for (const campo of ['nombres', 'apellidos']) {
            if (
                Object.prototype.hasOwnProperty.call(datos, campo) &&
                (typeof datos[campo] !== 'string' || !datos[campo].trim())
            ) {
                return res.status(400).json({
                    mensaje: `${campo} no puede estar vacío`
                });
            }
        }

        if (
            datos.email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)
        ) {
            return res.status(400).json({
                mensaje: 'El correo electrónico no tiene un formato válido'
            });
        }

        const valores = [];

        for (const campo of campos) {
            let valor = datos[campo];

            if (
                ['id_origen_cliente', 'id_agencia', 'id_vendedor']
                    .includes(campo)
            ) {
                valor = normalizarIdOpcional(valor);

                if (Number.isNaN(valor)) {
                    return res.status(400).json({
                        mensaje: `El campo ${campo} debe contener un ID válido o null`
                    });
                }
            } else if (campo === 'nombres' || campo === 'apellidos') {
                valor = valor.trim();
            } else if (valor === '') {
                valor = null;
            }

            valores.push(valor);
        }

        const [existentes] = await pool.query(
            'SELECT id_cliente FROM cliente WHERE id_cliente = ?',
            [Number(id)]
        );

        if (existentes.length === 0) {
            return res.status(404).json({
                mensaje: 'Cliente no encontrado'
            });
        }

        const asignaciones = campos
            .map(campo => `\`${campo}\` = ?`)
            .join(', ');

        await pool.query(
            `UPDATE cliente SET ${asignaciones} WHERE id_cliente = ?`,
            [...valores, Number(id)]
        );

        return res.status(200).json({
            mensaje: 'Cliente actualizado correctamente',
            id_cliente: Number(id),
            campos_actualizados: campos
        });
    } catch (error) {
        console.error('Error al actualizar cliente:', error.message);

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                mensaje: 'El origen, la agencia o el vendedor indicado no existe'
            });
        }

        return res.status(500).json({
            mensaje: 'Error al actualizar el cliente'
        });
    }
}

// DELETE: eliminar un cliente
async function eliminarCliente(req, res) {
    try {
        const { id } = req.params;

        if (!esIdValido(id)) {
            return res.status(400).json({
                mensaje: 'El ID del cliente debe ser un entero positivo'
            });
        }

        const [resultado] = await pool.query(
            'DELETE FROM cliente WHERE id_cliente = ?',
            [Number(id)]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Cliente no encontrado'
            });
        }

        return res.status(200).json({
            mensaje: 'Cliente eliminado correctamente',
            id_cliente: Number(id)
        });
    } catch (error) {
        console.error('Error al eliminar cliente:', error.message);

        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                mensaje: 'No se puede eliminar el cliente porque tiene servicios asociados'
            });
        }

        return res.status(500).json({
            mensaje: 'Error al eliminar el cliente'
        });
    }
}

module.exports = {
    obtenerClientes,
    obtenerClientePorId,
    crearCliente,
    actualizarCliente,
    eliminarCliente
};
