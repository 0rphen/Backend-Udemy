var express = require('express');
var mdAutenticacion = require('../middleware/autenticacion');
var app = express();

var Hospital = require('../models/hospital');

app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({})
	.populate('usuario', 'nombre email')
        .skip(desde)
        .limit(5)
	.exec((err, hospitales) => {
        if (err)
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando hospitales',
                errors: err
            });
	    Hospital.count({}, (err, total) => {
		return res.status(200).json({
		    ok: true,
		    hospitales: hospitales,
		    total: total
		});
	    });
	    return true;
    });
});

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });
    hospital.save((err, hospitalSave) => {
        if (err)
            return res.status(400).json({
                ok: false,
                mensaje: 'Error creando Hospital',
                errors: err
            });
        return res.status(200).json({
            ok: true,
            usuario: hospitalSave,
            usuarioToken: req.usuario
        });
    });
});

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Hospital.findById(id, (err, hospital) => {
        if (err)
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando hospital',
                errors: err
            });
        if (!hospital)
            return res.status(400).json({
                ok: false,
                mensaje: 'Hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe hospital con ese Id' }
            });
        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;
        hospital.save((err, hospitalSave) => {
            if (err)
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            return res.status(200).json({
                ok: true,
                hospital: hospitalSave,
                usuarioToken: req.usuario
            });
        });
        return true;
    });
});

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err)
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al eliminar hospital',
                errors: err
            });
        return res.status(200).json({
            ok: true,
            hospital: hospitalBorrado,
            usuarioToken: req.usuario
        });
    });
});

module.exports = app;
