var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

app.get('/todo/:busqueda', (req, res) => {
    var busqueda = req.params.busqueda;
    var regexp = new RegExp(busqueda, 'i');
    Promise.all([buscarHospitales(regexp),
    buscarMedicos(regexp),
    buscarUsuarios(regexp)]).then(respuesta => {
        res.status(200).json({
            ok: true,
            hospitales: respuesta[0],
            medicos: respuesta[1],
            usuarios: respuesta[2]
        });
    });
});

app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regexp = new RegExp(busqueda, 'i');
    var promesa;
    switch (tabla) {
        case 'hospitales':
            promesa = buscarHospitales(regexp);
            break;
        case 'medicos':
            promesa = buscarMedicos(regexp);
            break;
        case 'usuarios':
            promesa = buscarUsuarios(regexp);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'la busqueda sólo es posible en hospitales, usuarios o medicos'
            });
    }
    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });

});

function buscarHospitales(regexp) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regexp })
            .populate('usuario', 'nombre, email')
            .exec((err, hospitales) => {
                if (err)
                    reject('error al cargar hospitales');
                else
                    resolve(hospitales);
            });
    });
}

function buscarMedicos(regexp) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regexp })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err)
                    reject('error al cargar medicos');
                else
                    resolve(medicos);
            });
    });
}

function buscarUsuarios(regexp) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ nombre: regexp }, { email: regexp }])
            .exec((err, usuarios) => {
                if (err)
                    reject('error al cargar usuarios');
                else
                    resolve(usuarios);
            });
    });
}

module.exports = app;
