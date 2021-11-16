var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/hola', function(req, res, next) {
  //let usu = res.form.usuario
  res.render('index', { title: 'Hola Gustavo' });
});

module.exports = router;
