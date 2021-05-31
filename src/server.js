const express = require('express');
// const Handlebars = require('handlebars');
// const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
// const exphbs = require('express-handlebars');
const path = require('path');

const morgan = require('morgan')

const http = require('http')

//Inicializacion
const app = express();
const server = http.createServer(app);

//Configuracion
app.set("port", process.env.PORT || 3000);

server.listen(app.get('port'), () => {
  console.log('Server on port', app.get('port'));
  console.log('Environment:', process.env.NODE_ENV);
})



app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));



//Routes
app.use(require('./routes/emails.routes'));


//Static Files
app.use(express.static(path.join(__dirname, 'public')));




module.exports = app;


