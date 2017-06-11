'use strict';

const express = require('express');
const controller = require('./controller');

const port = process.env.PORT || 3000;


let app = express();

app.set('view engine', 'pug');

app.use(express.static('./public'));

controller(app);


app.listen(port, function () {
  console.log('Voting App running on port ' + port);
})
