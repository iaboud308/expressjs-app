const express = require('express');
const path = require('path');

const session = require('express-session');

const router = require('./routes').router;
const database = require('./database');

const app = express();
app.use(express.json());
app.use(express.urlencoded( {extended: true} ));

// disable CORS
app.use(function (req, res, next) {
    // res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Origin', req.get('origin'));
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next()
});

if (process.env.NODE_ENV === 'production') {
    // app.use(express.static('react/build'));
    // app.get('*', (request, response, next) => {
    //     response.sendFile(path.resolve(__dirname, 'react', 'build', 'index.html'));
    // })
    app.get('*', (request, response, next) => {
        response.send('We are in business');
    })
}

app.use(session ({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        // sameSite: 'none', 
        // secure: true, 
    }
}))

app.use(router);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`);
})
