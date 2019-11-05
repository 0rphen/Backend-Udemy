var express = require('express');

var app = express();
const path = require('path');
const fs = require('fs');

app.get('/:tipo/:img', (req, res) => {
    var tipo = req.params.tipo;
    var img = req.params.img;
    var tiposValidos = ['usuarios', 'medicos', 'hospitales'];

    if (tiposValidos.indexOf(tipo) > 0) {
        var pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`);
        console.log(pathImagen);
        if (fs.existsSync(pathImagen))
            return res.sendFile(pathImagen);
        else {
            var pathNoImage = path.resolve(__dirname, '../assets/no-img.jpg');
            console.log(pathNoImage);
            return res.sendFile(pathNoImage);
        }
    }
    return true;
});

module.exports = app;
