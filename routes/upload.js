var express = require('express');
const fileUpload = require('express-fileupload');

var app = express();
var fs = require('fs');
app.use(fileUpload());
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

app.put('/:tipo/:id', (req, res) => {
    var tipo = req.params.tipo;
    var id = req.params.id;
    if (!req.files)
        return res.status(400).json({
            ok: false,
            mensaje: 'Error cargando Archivo',
            errors: { message: 'Debe seleccionar un archivo' }
        });
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extencion = nombreCortado[nombreCortado.length - 1];
    var extencionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0)
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo no valido',
            errors: { message: 'Los tipos validos son ' + tiposValidos.join(', ') }
        });
    if (extencionesValidas.indexOf(extencion) < 0)
        return res.status(400).json({
            ok: false,
            mensaje: 'Extención no valida',
            errors: { message: 'Las extensiones validas son ' + extencionesValidas.join(', ') }
        });
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extencion}`;
    var path = `./uploads/${tipo}/${nombreArchivo}`;
    archivo.mv(path, err => {
        if (err)
            return res.status(500).json({
                ok: false,
                mensaje: 'Error moviendo el archivo',
                extencion: extencion
            });
        return subirPorTipo(tipo, id, nombreArchivo, res);
    });
    return true;
});

function subirPorTipo(tipo, id, nombreArchivo, response) {
    if (tipo === 'usuarios')
        Usuario.findById(id, (err, usuario) => {
            if (!usuario)
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                });
            var pathViejo = './uploads/usuarios' + usuario.img;
            if (fs.existsSync(pathViejo))
                fs.unlink(pathViejo);
            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';
                return response.status(200).json({
                    ok: true,
                    message: 'Imagen de usuario Actualizado',
                    usuarioActualizado: usuarioActualizado
                });
            });
            return true;
        });
    if (tipo === 'medicos')
        Medico.findById(id, (err, medico) => {
            if (!medico)
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                });
            var pathViejo = './uploads/medicos' + medico.img;
            if (fs.existsSync(pathViejo))
                fs.unlink(pathViejo);
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                medicoActualizado.password = ':)';
                return response.status(200).json({
                    ok: true,
                    message: 'Imagen de medico Actualizado',
                    medicoActualizado: medicoActualizado
                });
            });
            return true;
        });
    if (tipo === 'hospitales')
        Hospital.findById(id, (err, hospital) => {
            if (!hospital)
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                });
            var pathViejo = './uploads/hospitales' + hospital.img;
            if (fs.existsSync(pathViejo))
                fs.unlink(pathViejo);
            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                hospitalActualizado.password = ':)';
                return response.status(200).json({
                    ok: true,
                    message: 'Imagen de hospital Actualizado',
                    hospitalActualizado: hospitalActualizado
                });
            });
            return true;
        });
    return response;
}

module.exports = app;
