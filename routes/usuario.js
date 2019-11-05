var express = require('express');
var bcrypt = require('bcryptjs');
var mdAutenticacion = require('../middleware/autenticacion');
var app = express();

var Usuario = require('../models/usuario');

app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {
                if (err)
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                Usuario.count({}, (err, total) => {
                    return res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: total
                    });
                });
                return true;
            });
});

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });
    usuario.save((err, usuarioSave) => {
        if (err)
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        return res.status(201).json({
            ok: true,
            usuario: usuarioSave,
            usuarioToken: req.usuario
        });
    });
});

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Usuario.findById(id, (err, usuario) => {
        if (err)
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando usuarios',
                errors: err
            });
        if (!usuario)
            return res.status(400).json({
                ok: false,
                mensaje: 'Usuario existe el id ' + id + ' no existe',
                errors: { message: 'No existe el usuario con ese Id' }
            });
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;
        usuario.save((err, usuarioSave) => {
            if (err)
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            usuarioSave.password = ':)';
            return res.status(200).json({
                ok: true,
                usuario: usuarioSave,
                usuarioToken: req.usuario
            });
        });
        return true;
    });
});

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err)
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al eliminar usuario',
                errors: err
            });
        return res.status(200).json({
            ok: true,
            usuario: usuarioBorrado,
            usuarioToken: req.usuario
        });
    });
});

module.exports = app;
