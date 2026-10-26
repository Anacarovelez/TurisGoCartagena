const db = require('../config/db');

// =====================================================
// GET: Listar todos los tipos de servicio
// Endpoint: GET /api/tipos-servicio
// =====================================================
const obtenerTiposServicio = async (req, res) => {
    try {
        const [tipos] = await db.query(`
            SELECT
                id_tipo_servicio,
                nombre_servicio,
                descripcion,
                capacidad_minima,
                capacidad_maxima,
                tarifa_base,
                estado_servicio
            FROM tipo_servicio
            ORDER BY id_tipo_servicio DESC
        `);

        return res.status(200).json(tipos);
    } catch (error) {
        console.error('Error al consultar tipos de servicio:', error);

        return res.status(500).json({
            mensaje: 'Error al consultar los tipos de servicio',
            error: error.message
        });
    }
};


// =====================================================
// GET: Consultar un tipo de servicio por ID
// Endpoint: GET /api/tipos-servicio/:id
// =====================================================
const obtenerTipoServicioPorId = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID del tipo de servicio no es válido'
            });
        }

        const [tipos] = await db.query(
            `SELECT
                id_tipo_servicio,
                nombre_servicio,
                descripcion,
                capacidad_minima,
                capacidad_maxima,
                tarifa_base,
                estado_servicio
             FROM tipo_servicio
             WHERE id_tipo_servicio = ?`,
            [id]
        );

        if (tipos.length === 0) {
            return res.status(404).json({
                mensaje: 'Tipo de servicio no encontrado'
            });
        }

        return res.status(200).json(tipos[0]);
    } catch (error) {
        console.error('Error al consultar tipo de servicio:', error);

        return res.status(500).json({
            mensaje: 'Error al consultar el tipo de servicio',
            error: error.message
        });
    }
};


// =====================================================
// POST: Registrar un tipo de servicio
// Endpoint: POST /api/tipos-servicio
// =====================================================
const crearTipoServicio = async (req, res) => {
    try {
        const {
            nombre_servicio,
            descripcion,
            capacidad_minima,
            capacidad_maxima,
            tarifa_base,
            estado_servicio
        } = req.body || {};

        if (
            typeof nombre_servicio !== 'string' ||
            nombre_servicio.trim() === ''
        ) {
            return res.status(400).json({
                mensaje: 'El nombre del servicio es obligatorio'
            });
        }

        // Validar valores numéricos cuando se proporcionen.
        const capacidadMinima = convertirNumero(
            capacidad_minima,
            'capacidad_minima',
            true
        );

        const capacidadMaxima = convertirNumero(
            capacidad_maxima,
            'capacidad_maxima',
            true
        );

        const tarifaBase = convertirNumero(
            tarifa_base,
            'tarifa_base',
            false
        );

        if (
            capacidadMinima.error ||
            capacidadMaxima.error ||
            tarifaBase.error
        ) {
            return res.status(400).json({
                mensaje: 'Revisa las capacidades y la tarifa: deben ser valores numéricos válidos'
            });
        }

        if (
            capacidadMinima.valor !== null &&
            !Number.isInteger(capacidadMinima.valor)
        ) {
            return res.status(400).json({
                mensaje: 'La capacidad mínima debe ser un número entero'
            });
        }

        if (
            capacidadMaxima.valor !== null &&
            !Number.isInteger(capacidadMaxima.valor)
        ) {
            return res.status(400).json({
                mensaje: 'La capacidad máxima debe ser un número entero'
            });
        }

        if (
            capacidadMinima.valor !== null &&
            capacidadMinima.valor < 0
        ) {
            return res.status(400).json({
                mensaje: 'La capacidad mínima no puede ser negativa'
            });
        }

        if (
            capacidadMaxima.valor !== null &&
            capacidadMaxima.valor < 0
        ) {
            return res.status(400).json({
                mensaje: 'La capacidad máxima no puede ser negativa'
            });
        }

        if (
            capacidadMinima.valor !== null &&
            capacidadMaxima.valor !== null &&
            capacidadMinima.valor > capacidadMaxima.valor
        ) {
            return res.status(400).json({
                mensaje: 'La capacidad mínima no puede superar la capacidad máxima'
            });
        }

        if (tarifaBase.valor !== null && tarifaBase.valor < 0) {
            return res.status(400).json({
                mensaje: 'La tarifa base no puede ser negativa'
            });
        }

        const [resultado] = await db.query(
            `INSERT INTO tipo_servicio (
                nombre_servicio,
                descripcion,
                capacidad_minima,
                capacidad_maxima,
                tarifa_base,
                estado_servicio
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                nombre_servicio.trim(),
                descripcion || null,
                capacidadMinima.valor,
                capacidadMaxima.valor,
                tarifaBase.valor,
                estado_servicio || 'Activo'
            ]
        );

        return res.status(201).json({
            mensaje: 'Tipo de servicio creado correctamente',
            id_tipo_servicio: resultado.insertId
        });
    } catch (error) {
        console.error('Error al crear tipo de servicio:', error);

        return res.status(500).json({
            mensaje: 'Error al crear el tipo de servicio',
            error: error.message
        });
    }
};


// =====================================================
// PUT: Actualizar un tipo de servicio
// Endpoint: PUT /api/tipos-servicio/:id
// =====================================================
const actualizarTipoServicio = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID del tipo de servicio no es válido'
            });
        }

        const {
            nombre_servicio,
            descripcion,
            capacidad_minima,
            capacidad_maxima,
            tarifa_base,
            estado_servicio
        } = req.body || {};

        if (
            typeof nombre_servicio !== 'string' ||
            nombre_servicio.trim() === ''
        ) {
            return res.status(400).json({
                mensaje: 'El nombre del servicio es obligatorio'
            });
        }

        const capacidadMinima = convertirNumero(
            capacidad_minima,
            'capacidad_minima',
            true
        );

        const capacidadMaxima = convertirNumero(
            capacidad_maxima,
            'capacidad_maxima',
            true
        );

        const tarifaBase = convertirNumero(
            tarifa_base,
            'tarifa_base',
            false
        );

        if (
            capacidadMinima.error ||
            capacidadMaxima.error ||
            tarifaBase.error
        ) {
            return res.status(400).json({
                mensaje: 'Revisa las capacidades y la tarifa: deben ser valores numéricos válidos'
            });
        }

        if (
            capacidadMinima.valor !== null &&
            !Number.isInteger(capacidadMinima.valor)
        ) {
            return res.status(400).json({
                mensaje: 'La capacidad mínima debe ser un número entero'
            });
        }

        if (
            capacidadMaxima.valor !== null &&
            !Number.isInteger(capacidadMaxima.valor)
        ) {
            return res.status(400).json({
                mensaje: 'La capacidad máxima debe ser un número entero'
            });
        }

        if (
            capacidadMinima.valor !== null &&
            capacidadMinima.valor < 0
        ) {
            return res.status(400).json({
                mensaje: 'La capacidad mínima no puede ser negativa'
            });
        }

        if (
            capacidadMaxima.valor !== null &&
            capacidadMaxima.valor < 0
        ) {
            return res.status(400).json({
                mensaje: 'La capacidad máxima no puede ser negativa'
            });
        }

        if (
            capacidadMinima.valor !== null &&
            capacidadMaxima.valor !== null &&
            capacidadMinima.valor > capacidadMaxima.valor
        ) {
            return res.status(400).json({
                mensaje: 'La capacidad mínima no puede superar la capacidad máxima'
            });
        }

        if (tarifaBase.valor !== null && tarifaBase.valor < 0) {
            return res.status(400).json({
                mensaje: 'La tarifa base no puede ser negativa'
            });
        }

        const [resultado] = await db.query(
            `UPDATE tipo_servicio SET
                nombre_servicio = ?,
                descripcion = ?,
                capacidad_minima = ?,
                capacidad_maxima = ?,
                tarifa_base = ?,
                estado_servicio = ?
             WHERE id_tipo_servicio = ?`,
            [
                nombre_servicio.trim(),
                descripcion || null,
                capacidadMinima.valor,
                capacidadMaxima.valor,
                tarifaBase.valor,
                estado_servicio || 'Activo',
                id
            ]
        );

        if (resultado.affectedRows === 0) {
            const [tipos] = await db.query(
                `SELECT id_tipo_servicio
                 FROM tipo_servicio
                 WHERE id_tipo_servicio = ?`,
                [id]
            );

            if (tipos.length === 0) {
                return res.status(404).json({
                    mensaje: 'Tipo de servicio no encontrado'
                });
            }
        }

        return res.status(200).json({
            mensaje: 'Tipo de servicio actualizado correctamente',
            id_tipo_servicio: id
        });
    } catch (error) {
        console.error('Error al actualizar tipo de servicio:', error);

        return res.status(500).json({
            mensaje: 'Error al actualizar el tipo de servicio',
            error: error.message
        });
    }
};


// =====================================================
// DELETE: Eliminar un tipo de servicio
// Endpoint: DELETE /api/tipos-servicio/:id
// =====================================================
const eliminarTipoServicio = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID del tipo de servicio no es válido'
            });
        }

        const [resultado] = await db.query(
            `DELETE FROM tipo_servicio
             WHERE id_tipo_servicio = ?`,
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Tipo de servicio no encontrado'
            });
        }

        return res.status(200).json({
            mensaje: 'Tipo de servicio eliminado correctamente',
            id_tipo_servicio: id
        });
    } catch (error) {
        console.error('Error al eliminar tipo de servicio:', error);

        if (
            error.code === 'ER_ROW_IS_REFERENCED_2' ||
            error.code === 'ER_ROW_IS_REFERENCED'
        ) {
            return res.status(409).json({
                mensaje: 'No se puede eliminar este tipo de servicio porque tiene servicios relacionados'
            });
        }

        return res.status(500).json({
            mensaje: 'Error al eliminar el tipo de servicio',
            error: error.message
        });
    }
};


// =====================================================
// Función auxiliar para validar números opcionales
// =====================================================
function convertirNumero(valor, campo, debeSerEntero) {
    if (valor === undefined || valor === null || valor === '') {
        return { valor: null, error: false };
    }

    const numero = Number(valor);

    if (
        !Number.isFinite(numero) ||
        (debeSerEntero && !Number.isInteger(numero))
    ) {
        return { valor: null, error: true };
    }

    return { valor: numero, error: false };
}


// =====================================================
// Exportar funciones
// =====================================================
module.exports = {
    obtenerTiposServicio,
    obtenerTipoServicioPorId,
    crearTipoServicio,
    actualizarTipoServicio,
    eliminarTipoServicio
};