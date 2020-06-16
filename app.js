const colors = require('colors'); // pour avoir une belle console

// instant publicité
// instant advertising
console.log(" ╔═══════════════════════════════════════════════════════════╗".brightCyan)
console.log(" ║   Chaun14's launcher NodeJs server full by chaun14 🐑    ║".brightCyan)
console.log(" ╚═══════════════════════════════════════════════════════════╝".brightCyan)



const bodyParser = require('body-parser');
let cookieParser = require('cookie-parser')
let path = require('path');
let morgan = require('morgan');
const fileUpload = require('express-fileupload');

let bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy
const expressSession = require('express-session')
const flash = require('flash')
const helmet = require('helmet')
const express = require('express')
const SelfReloadJSON = require('self-reload-json');

const list = require("./modules/listManager.js")
const status = require("./modules/statusManager.js")
const sql = require('./modules/sql.js')
const utils = require('./modules/utils.js')
const config = new SelfReloadJSON('./config.json');
const debug = config.debug;


const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);


// les middleware
app.use('/', express.static('public'));
app.use('/files', express.static('files'));
app.use('/java', express.static('java'));


app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

app.use(cookieParser(config.secret))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(expressSession({
    secret: config.secret,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(helmet());

if (debug) app.use(morgan("[" + "DEBUG".magenta + "] " + "[" + "REQUEST".green + "] " + ':method :url :status :res[content-length] - :response-time ms'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use('/dashboard', require('./routes/dashboard'));

app.use('/', require('./routes/index'));



io.on('connection', (socket) => {
    // console.log('a user connected');
    // io.emit('message', { msg: 'some value', type: 'error' }); // This will emit the event to all connected sockets

    socket.on('disconnect', () => {
        //  console.log('user disconnected');
    });
});




/* ################################# Auth stuff ################################# */
passport.use(new LocalStrategy(
    function(username, password, done) {
        let user = {
            username: 'user',
            passwordHash: config.passwordHash,
            id: 1
        }

        if (debug) utils.logDebug("[" + "AUTH".red + "] " + "je cherche " + username)
        if (user.username == "user") {

            if (debug) utils.logDebug("[" + "AUTH".red + "] " + "User trouvé: " + user.toString)
                // User not found
            if (!user) {
                if (debug) utils.logDebug("[" + "AUTH".red + "] " + "je ne trouve pas " + user)
                return done(null, false)
            }

            // Always use hashed passwords and fixed time comparison
            bcrypt.compare(password, user.passwordHash, (err, isValid) => {
                if (err) {
                    return done(err)
                }
                if (!isValid) {
                    if (debug) utils.logDebug("[" + "AUTH".red + "] " + "mdp de " + user.username + " faux")
                    return done(null, false), { message: 'Incorrect password.' }
                }
                if (debug) utils.logDebug("[" + "AUTH".red + "] " + "mdp de " + user.username + " validé")
                return done(null, user)
            })

        } else {
            if (debug) utils.logDebug("[" + "AUTH".red + "] " + "Je ne trouve pas " + username)
            return done("user not found")

        }


    }))

passport.serializeUser(function(user, done) {

    if (debug) utils.logDebug("[" + "AUTH".red + "] " + "sérialise l'user " + user.username)
    done(null, user);
});

passport.deserializeUser(function(testuser, done) {
    let user = {
        username: 'user',
        passwordHash: config.passwordHash,
        id: 1
    }

    if (debug) utils.logDebug("[" + "AUTH".red + "] " + "désérialise l'user " + testuser.username)

    if (user.username == testuser.username) {

        done(null, user);
    } else {
        if (debug) utils.logDebug("[" + "AUTH".red + "] " + "décé user pas trouvé")
        done("cc", user)
    }

});

app.get('/login', function(req, res) {
    if (req.session.passport !== undefined) {
        res.redirect("/dashboard")
    } else {

        let hasPass = true;
        if (config.passwordHash == "") hasPass = false
        res.render("login", { message: "", messageType: "success", hasPass: hasPass })
    }
})

// app.post('/login', passport.authenticate('local', { failureRedirect: '/login',failureFlash: true, successRedirect: '/dashboard' }))

app.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }

        let hasPass = false
        if (!config.passwordHash == "") hasPass = true

        if (!user) { return res.render('login', { message: "Wrong password", messageType: "error", hasPass: hasPass }); }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            return res.redirect('/dashboard');
        });
    })(req, res, next);
});

app.get('/register', (req, res) => {

})

app.post('/register', (req, res) => {

    console.log(req.body)

    if (!config.passwordHash == "") return res.render("login", { message: "You already have a password", messageType: "error", hasPass: true })
    if (req.body.password !== req.body.passwordrepeat) return res.render("login", { message: "Passwords doesn't match", messageType: "error", hasPass: false })

    let hash = bcrypt.hashSync(req.body.password, 8);
    config.passwordHash = hash
    config.save()

    res.redirect("/login")

})

app.get('/logout', (req, res) => {
    if (req.session.passport == undefined) {
        res.redirect('/');
    } else {

        if (debug) utils.logDebug("Déco de " + req.session.passport.user.username)

        req.session.destroy(function(err) {
            res.redirect('/'); //Inside a callback… bulletproof!
        });
    }
});
/* ################################# End Auth stuff ################################# */





/* ################################# Init ################################# */
sql.getSettings((err, settings) => {
    if (settings[0] == undefined) {
        sql.initSettings((err, settings));

        sql.getSettings((err, settings) => {

            status.setStatus(settings[0].launcher_status)
            if (debug) utils.logDebug("[" + "INIT".cyan + "] " + "Launcher status set as " + settings[0].launcher_status)
        })

    } else {
        status.setStatus(settings[0].launcher_status)
        if (debug) utils.logDebug("[" + "INIT".cyan + "] " + "Launcher status set as " + settings[0].launcher_status)
    }

})

sql.getIgnoreList((err, ignoreList) => {
    ignoreList.forEach(item => {
        if (!list.hasIgnoredItem(item)) {

            list.addIgnoredItem(item.path, true)
            if (debug) utils.logDebug("[" + "INIT".cyan + "] " + "Adding " + item.path + " to ignoreList")
        }

    });
})

sql.getDeleteList((err, deleteList) => {
    deleteList.forEach(item => {
        if (!list.hasDeletedItem(item)) {

            list.addDeletedItem(item.path, true)
            if (debug) utils.logDebug("[" + "INIT".cyan + "] " + "Adding " + item.path + " to deleteList")
        }
    });
})

/* ################################# End Init ################################# */


// oui j'ai pris ce port wtf car c'est le tag discord de trxyy 
const port = process.env.PORT || 2332;

// log informatif de démarrage terminé
console.log("[STARTING] App started on port ".brightCyan + port)

http.listen(port, () => {
    console.log(`Listening on ${port}`);
});

function socketProgressEmit(event, state, fileName, i) {
    io.emit(event, { state: state, fileName: fileName, id: i });

}

function socketDownloadEmit(event, action, message, fileName, i) {
    io.emit(event, { action: action, message: message, fileName: fileName, id: i });

}

function socketBroadcast(message, type) {
    io.emit('message', { msg: message, type: type });
}

module.exports = { socketProgressEmit, socketDownloadEmit, socketBroadcast }