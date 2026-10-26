const db = require('../config/db');

// =====================================================
// GET: Listar experiencias turísticas
// GET /api/tours
// =====================================================
const obtenerTours = async (req, res) => {
    try {
        const [tours] = await db.query(`
            SELECT
                e.*,
                a.nombre_agencia
            FROM experiencia e
            INNER JOIN agencia a
                ON e.id_agencia = a.id_agencia
            ORDER BY e.id_experiencia DESC
        `);

        return res.status(200).json(tours);
    } catch (error) {
        console.error('Error al consultar tours:', error);

        return res.status(500).json({
            mensaje: 'Error al consultar las experiencias turísticas',
            error: error.message
        });
    }
};


// =====================================================
// GET: Consultar un tour por ID
// GET /api/tours/:id
// =====================================================
const obtenerTourPorId = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID del tour no es válido'
            });
        }

        const [tours] = await db.query(`
            SELECT
                e.*,
                a.nombre_agencia
            FROM experiencia e
            INNER JOIN agencia a
                ON e.id_agencia = a.id_agencia
            WHERE e.id_experiencia = ?
        `, [id]);

        if (tours.length === 0) {
            return res.status(404).json({
                mensaje: 'Tour no encontrado'
            });
        }

        return res.status(200).json(tours[0]);
    } catch (error) {
        console.error('Error al consultar tour:', error);

        return res.status(500).json({
            mensaje: 'Error al consultar el tour',
            error: error.message
        });
    }
};


// =====================================================
// POST: Crear una experiencia turística
// POST /api/tours
// =====================================================
const crearTour = async (req, res) => {
    try {
        const {
            id_agencia,
            nombre_experiencia,
            descripcion,
            ubicacion,
            duracion_horas,
            precio_por_persona,
            capacidad_maxima,
            estado_experiencia,
            imagen_url
        } = req.body || {};

        const agenciaId = Number(id_agencia);
        const precio = Number(precio_por_persona);

        if (
            !Number.isInteger(agenciaId) ||
            agenciaId <= 0
        ) {
            return res.status(400).json({
                mensaje: 'Debes indicar un ID de agencia válido'
            });
        }

        if (
            typeof nombre_experiencia !== 'string' ||
            nombre_experiencia.trim() === ''
        ) {
            return res.status(400).json({
                mensaje: 'El nombre de la experiencia es obligatorio'
            });
        }

        if (
            precio_por_persona === undefined ||
            precio_por_persona === null ||
            precio_por_persona === '' ||
            !Number.isFinite(precio) ||
            precio < 0
        ) {
            return res.status(400).json({
                mensaje: 'El precio por persona debe ser un número igual o mayor que cero'
            });
        }

        const duracion = validarNumeroOpcional(
            duracion_horas,
            0
        );

        const capacidad = validarNumeroOpcional(
            capacidad_maxima,
            1
        );

        if (duracion.error || capacidad.error) {
            return res.status(400).json({
                mensaje: 'La duración debe ser positiva y la capacidad debe ser un entero positivo'
            });
        }

        const [resultado] = await db.query(`
            INSERT INTO experiencia (
                id_agencia,
                nombre_experiencia,
                descripcion,
                ubicacion,
                duracion_horas,
                precio_por_persona,
                capacidad_maxima,
                estado_experiencia,
                imagen_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            agenciaId,
            nombre_experiencia.trim(),
            descripcion || null,
            ubicacion || null,
            duracion.valor,
            precio,
            capacidad.valor,
            estado_experiencia || 'Activa',
            imagen_url || null
        ]);

        return res.status(201).json({
            mensaje: 'Experiencia turística creada correctamente',
            id_experiencia: resultado.insertId
        });
    } catch (error) {
        console.error('Error al crear tour:', error);

        if (
            error.code === 'ER_NO_REFERENCED_ROW_2' ||
            error.code === 'ER_NO_REFERENCED'
        ) {
            return res.status(400).json({
                mensaje: 'La agencia indicada no existe'
            });
        }

        return res.status(500).json({
            mensaje: 'Error al crear la experiencia turística',
            error: error.message
        });
    }
};


// =====================================================
// PUT: Actualizar una experiencia
// PUT /api/tours/:id
// =====================================================
const actualizarTour = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID del tour no es válido'
            });
        }

        const {
            id_agencia,
            nombre_experiencia,
            descripcion,
            ubicacion,
            duracion_horas,
            precio_por_persona,
            capacidad_maxima,
            estado_experiencia,
            imagen_url
        } = req.body || {};

        const agenciaId = Number(id_agencia);
        const precio = Number(precio_por_persona);

        if (!Number.isInteger(agenciaId) || agenciaId <= 0) {
            return res.status(400).json({
                mensaje: 'Debes indicar un ID de agencia válido'
            });
        }

        if (
            typeof nombre_experiencia !== 'string' ||
            nombre_experiencia.trim() === ''
        ) {
            return res.status(400).json({
                mensaje: 'El nombre de la experiencia es obligatorio'
            });
        }

        if (
            precio_por_persona === undefined ||
            precio_por_persona === null ||
            precio_por_persona === '' ||
            !Number.isFinite(precio) ||
            precio < 0
        ) {
            return res.status(400).json({
                mensaje: 'El precio por persona debe ser un número igual o mayor que cero'
            });
        }

        const duracion = validarNumeroOpcional(
            duracion_horas,
            0
        );

        const capacidad = validarNumeroOpcional(
            capacidad_maxima,
            1
        );

        if (duracion.error || capacidad.error) {
            return res.status(400).json({
                mensaje: 'La duración debe ser positiva y la capacidad debe ser un entero positivo'
            });
        }

        const [resultado] = await db.query(`
            UPDATE experiencia SET
                id_agencia = ?,
                nombre_experiencia = ?,
                descripcion = ?,
                ubicacion = ?,
                duracion_horas = ?,
                precio_por_persona = ?,
                capacidad_maxima = ?,
                estado_experiencia = ?,
                imagen_url = ?
            WHERE id_experiencia = ?
        `, [
            agenciaId,
            nombre_experiencia.trim(),
            descripcion || null,
            ubicacion || null,
            duracion.valor,
            precio,
            capacidad.valor,
            estado_experiencia || 'Activa',
            imagen_url || null,
            id
        ]);

        if (resultado.affectedRows === 0) {
            const [existentes] = await db.query(
                'SELECT id_experiencia FROM experiencia WHERE id_experiencia = ?',
                [id]
            );

            if (existentes.length === 0) {
                return res.status(404).json({
                    mensaje: 'Tour no encontrado'
                });
            }
        }

        return res.status(200).json({
            mensaje: 'Experiencia turística actualizada correctamente',
            id_experiencia: id
        });
    } catch (error) {
        console.error('Error al actualizar tour:', error);

        if (
            error.code === 'ER_NO_REFERENCED_ROW_2' ||
            error.code === 'ER_NO_REFERENCED'
        ) {
            return res.status(400).json({
                mensaje: 'La agencia indicada no existe'
            });
        }

        return res.status(500).json({
            mensaje: 'Error al actualizar la experiencia turística',
            error: error.message
        });
    }
};


// =====================================================
// DELETE: Eliminar una experiencia
// DELETE /api/tours/:id
// =====================================================
const eliminarTour = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID del tour no es válido'
            });
        }

        const [resultado] = await db.query(
            'DELETE FROM experiencia WHERE id_experiencia = ?',
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Tour no encontrado'
            });
        }

        return res.status(200).json({
            mensaje: 'Experiencia turística eliminada correctamente',
            id_experiencia: id
        });
    } catch (error) {
        console.error('Error al eliminar tour:', error);

        if (
            error.code === 'ER_ROW_IS_REFERENCED_2' ||
            error.code === 'ER_ROW_IS_REFERENCED'
        ) {
            return res.status(409).json({
                mensaje: 'No se puede eliminar la experiencia porque tiene registros relacionados'
            });
        }

        return res.status(500).json({
            mensaje: 'Error al eliminar la experiencia turística',
            error: error.message
        });
    }
};


// =====================================================
// Validación de números opcionales
// =====================================================
function validarNumeroOpcional(valor, minimo) {
    if (valor === undefined || valor === null || valor === '') {
        return { valor: null, error: false };
    }

    const numero = Number(valor);

    if (
        !Number.isFinite(numero) ||
        numero < minimo ||
        (minimo === 1 && !Number.isInteger(numero))
    ) {
        return { valor: null, error: true };
    }

    return { valor: numero, error: false };
}


// =====================================================
// Exportar funciones
// =====================================================
module.exports = {
    obtenerTours,
    obtenerTourPorId,
    crearTour,
    actualizarTour,
    eliminarTour
};