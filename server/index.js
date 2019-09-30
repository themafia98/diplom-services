const express = require('express');

const app = express();

app.set('port', process.env.PORT || '3001');

app.listen((error) => {
    if (error) console.log(error);
    else console.log(`Server start on ${app.get('port')} port`);
});