if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: '.env.dev' });
}

var path = require('path');
var express = require('express');
var session = require('express-session');
const MemoryStore = require('memorystore')(session)
var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');



var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var gamesRouter = require('./routes/games');
var wipRouter = require('./routes/wip');
var caseAnalyzerRouter = require('./routes/caseanalyzer');

const moment = require('moment')
const Handlebars = require('handlebars')


var flash = require('express-flash');

// initialize express
var app = express();

app.use(cors());


Handlebars.registerHelper("formatDate", function (datetime) {
    if (moment) {
        return moment(datetime).format('YYYY-MM-DD');
    }
    else {
        return datetime;
    }
});



/**
 * Using express-session middleware for persistent user session. Be sure to
 * familiarize yourself with available options. Visit: https://www.npmjs.com/package/express-session
 */
app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: true, // set this to true on production
    },
    store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
    }),
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/games', gamesRouter);
app.use('/wip', wipRouter);
app.use('/caseanalyzer', caseAnalyzerRouter);


app.use((req, res, next) => {
    app.locals.success = req.flash('success')
    app.locals.error = req.flash('error')
    next();
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;