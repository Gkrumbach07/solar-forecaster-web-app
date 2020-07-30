const express = require('express');
const path = require('path');
//var router = express.Router();

const app = express();

app.use(express.static(path.join(__dirname, 'client/build')));

/* GET users listing. */
app.get('/users', function(req, res, next) {
  res.json([
    {id:1, username:"some"},
    {id:2, username:"some2"}
  ]);
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`listening on ${port}`);

//module.exports = router;
