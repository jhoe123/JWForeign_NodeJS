// ----------------------------------------------------------------------------
// Copyright (c) 2015 Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

require('dotenv').config();

// This is a base-level Azure Mobile App SDK.
var express = require('express');

// Set up a standard Express app
var app = express();
var login = require('./api/Login');

function initModule(module, name) {
    if (module.post !== undefined)
        app.post('/api/' + name, module.post);
    if (module.get !== undefined)
        app.get('/api/' + name, module.get)
}

initModule(login, 'login');

app.listen( process.env.PORT, () => console.log( "API start listening to PORT = " + process.env.PORT));