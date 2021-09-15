const { Client } = require('discord.js');
var express  = require('express')
  , session  = require('express-session')
  , memorystore = require('memorystore')(session)
  , passport = require('passport')
  , Strategy = require('passport-discord').Strategy
  , Discord = require('discord.js')
  , enmap = require('enmap')
  , app      = express()
  , db = new enmap({ dataDir: "./database" });
/*
* @param {Client} client
*/

module.exports = (client) => {
	app.set("view engine", "ejs");

	
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var scopes = ['identify', 'email', /* 'connections', (it is currently broken) */ 'guilds', 'guilds.join'];
var prompt = 'consent'

passport.use(new Strategy({
    clientID: '883608595835523072',
    clientSecret: 'VMMx0GIIFUb5LOu3TxHdkKRmK8UFO5tW',
    callbackURL: 'https://dashboard.aditya1010.repl.co/callback',
    scope: scopes,
    prompt: prompt
}, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
        return done(null, profile);
    });
}));

app.use(session({
	cookie: { maxAge: 86400000 },
    secret: process.env.secret,
    resave: false,
	store: new memorystore({
		checkPeriod: 86400000,
	}),
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.get('/', passport.authenticate('discord', { scope: scopes, prompt: prompt }), function(req, res) {});
app.get('/callback',
    passport.authenticate('discord', { failureRedirect: '/' }), function(req, res) { res.redirect('/info') } // auth success
);
app.get("/info", checkAuth, (req, res) => {
	res.render('index', {
		req: req,
		bot: client,
		user: req.user,
		permissions: Discord.Permissions,
	})
});

app.get("/guilds/:guildId", checkAuth, async(req, res) => {
	const id = req.params.guildId;

	const guild = client.guilds.cache.get(id);
	if(!guild) return;
	let prefix = await db.get(`prefix_${id}`);
	let modlogchannel = await db.get(`modlog_${id}`);
	if(!prefix) prefix="!";
	if(!modlogchannel) modlogchannel="No modlog channel"
	res.render('guild', {
		req: req,
		db: db,
		modlog: modlogchannel,
		prefix: prefix,
		bot: client,
		guild: guild,
		user: req.user,
		permissions: Discord.Permissions,
	})
})

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/")
}


app.listen(5000, function (err) {
    if (err) return console.log(err)
    console.log('Dashboard connected at port 5000');
})
}
