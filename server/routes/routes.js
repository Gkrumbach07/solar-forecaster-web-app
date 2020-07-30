const express = require('express');
const request = require('request');

const router = express.Router();

router.get('/', function(req, res) {
  res.render('index')
});

/* GET users listing. */
router.get('/users', function(req, res, next) {
  res.json([
    {id:1, username:"some"},
    {id:2, username:"some2"}
  ]);
});


module.exports = router;
