var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

app.post('/', (req, res) => {
    var body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioBD) => {
        if (err)
            return res.status(500).json({
                ok: false,
                mensaje: 'Error buscando usuario',
                errors: err
            });
        if (!usuarioBD)
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales Incorrectas - email',
                errors: err
            });
        if (!bcrypt.compareSync(body.password, usuarioBD.password))
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales Incorrectas - password',
                errors: err
            });
        var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 });//4 horas
        usuarioBD.password = ':)';
        return res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            id: usuarioBD._id,
            token: token,
            message: 'Login Post OK'
        });
    });
});

module.exports = app;
