var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/users', function(req, res, next) {
  res.json([
    {id:1, username:"some"},
    {id:2, username:"some2"}
  ]);
});

module.exports = router;
