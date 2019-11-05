var express = require('express');
var mdAutenticacion = require('../middleware/autenticacion');
var app = express();

var Medico = require('../models/medico');

app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({})
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .skip(desde)
        .limit(5)
        .exec((err, medicos) => {
            if (err)
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    errors: err
                });
            Medico.count({}, (err, total) => {
                return res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: total
                });
            });
            return true;
        });
});

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });
    medico.save((err, medicoSave) => {
        if (err)
            return res.status(400).json({
                ok: false,
                mensaje: 'Error creando Hospital',
                errors: err
            });
        return res.status(200).json({
            ok: true,
            usuario: medicoSave,
            usuarioToken: req.usuario
        });
    });
});

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Medico.findById(id, (err, medico) => {
        if (err)
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando medico',
                errors: err
            });
        if (!medico)
            return res.status(400).json({
                ok: false,
                mensaje: 'Medico con el id ' + id + ' no existe',
                errors: { message: 'No existe medico con ese Id' }
            });
        medico.nombre = body.nombre;
        medico.img = body.img;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;
        medico.save((err, medicoSave) => {
            if (err)
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            return res.status(200).json({
                ok: true,
                hospital: medicoSave,
                usuarioToken: req.usuario
            });
        });
        return true;
    });
});

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err)
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al eliminar medico',
                errors: err
            });
        return res.status(200).json({
            ok: true,
            hospital: medicoBorrado,
            usuarioToken: req.usuario
        });
    });
});

module.exports = app;
