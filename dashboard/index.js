const { Client } = require("discord.js");
var express = require("express"),
  session = require("express-session"),
  passport = require("passport"),
  Strategy = require("passport-discord").Strategy,
  Discord = require("discord.js"),
  enmap = require("enmap"),
  config = require("../dashboard.config.json"),
  app = express(),
  db = new enmap({ dataDir: "./database" });
/*
 * @param {Client} client
 */

module.exports = (client) => {
  app.set("view engine", "ejs");

  passport.serializeUser(function (user, done) {
    done(null, user);
  });
  passport.deserializeUser(function (obj, done) {
    done(null, obj);
  });

  var scopes = [
    "identify",
    "email",
    /* 'connections', (it is currently broken) */ "guilds",
    "guilds.join",
  ];
  var prompt = "consent";

  passport.use(
    new Strategy(
      {
        clientID: process.env.clientId,
        clientSecret: process.env.clientSecret,
        callbackURL: process.env.callbackURL,
        scope: scopes,
        prompt: prompt,
      },
      function (accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
          return done(null, profile);
        });
      }
    )
  );

  app.use(
    session({
      cookie: { maxAge: 86400000 },
      secret: process.env.secret,
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.get(
    "/",
    passport.authenticate("discord", { scope: scopes, prompt: prompt }),
    function (req, res) {}
  );
  app.get(
    "/callback",
    passport.authenticate("discord", { failureRedirect: "/" }),
    function (req, res) {
      res.redirect("/info");
    } // auth success
  );
  app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });
  app.get("/info", checkAuth, (req, res) => {
    res.render("index", {
      req: req,
      bot: client,
      user: req.user,
      permissions: Discord.Permissions,
      config: config,
    });
  });

  app.get("/guilds/:guildId", checkAuth, async (req, res) => {
    const id = req.params.guildId;

    const guild = client.guilds.cache.get(id);
    if (!guild) return;
    let prefix = await db.get(`prefix_${id}`);
    let modlogchannel = await db.get(`modlog_${id}`);
    if (!prefix) prefix = "!";
    if (!modlogchannel) modlogchannel = "No modlog channel";
    res.render("guild", {
      req: req,
      db: db,
      modlog: modlogchannel,
      prefix: prefix,
      bot: client,
      guild: guild,
      config: config,
      // member: member || null,
      user: req.user,
      permissions: Discord.Permissions,
    });
  });

  function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/");
  }

  app.listen(5000, function (err) {
    if (err) return console.log(err);
    console.log("Dashboard connected at port 5000");
  });
};
