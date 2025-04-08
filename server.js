var http = require("http");
var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var session = require("express-session");
var hbs = require("hbs");

var app = express(); //create express middleware dispatcher

const PORT = process.env.PORT || 3000;

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs"); //use hbs handlebars wrapper

//handlebars helpers and partials
hbs.registerPartials(path.join(__dirname, "views", "partials"));
hbs.registerHelper("eq", (a, b) => a === b);
hbs.registerHelper("json", (ctx) => JSON.stringify(ctx));
hbs.registerHelper("catIcon", (id) => {
  const map = {
    17: "🧪",
    19: "➗",
    12: "🎵",
    25: "🎨",
    23: "📜",
    24: "🏛️",
    22: "🌍",
    9: "❓",
  };
  return map[id] || "❔";
});
hbs.registerHelper("inc", (n) => n + 1);
hbs.registerHelper("capitalize", (s) => s.charAt(0).toUpperCase() + s.slice(1));
hbs.registerHelper(
  "typeLabel",
  (t) =>
    ({
      truefalse: "True/False",
      num: "Number",
      multiselect: "Multi‑select",
      type: "Text",
    }[t] || t)
);
hbs.registerHelper("or", function (a, b) {
  return a || b;
});

app.locals.pretty = true;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: "trivia-secret",
    resave: false,
    saveUninitialized: false,
  })
);

//read routes modules
var routes = require("./routes/index");

//some logger middleware functions
function methodLogger(request, response, next) {
  console.log("METHOD LOGGER");
  console.log("================================");
  console.log("METHOD: " + request.method);
  console.log("URL:" + request.url);
  next(); //call next middleware registered
}
function headerLogger(request, response, next) {
  console.log("HEADER LOGGER:");
  console.log("Headers:");
  for (k in request.headers) console.log(k);
  next(); //call next middleware registered
}

//register middleware with dispatcher
//ORDER MATTERS HERE
//middleware

app.use((req, _res, next) => {
  if (req.session && req.session.user) req.user = req.session.user;
  next();
});
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"));
app.use(express.static(path.join(__dirname, "public")));
//app.use(methodLogger);
//routes

// main view
app.get("/", routes.gamesOverview);
app.get("/games", routes.gamesOverview);

// auth
app.get("/auth", routes.authPage);
app.post("/login", routes.login);
app.post("/signup", routes.signup);
app.get("/logout", routes.logout);

//search for quizzes
app.get("/api/search", routes.apiSearch); // returns JSON
app.get("/search", routes.searchGames); // full results page

// admin-only, shows forbidden if accessed otherwise
app.get("/admin", routes.adminPanel);

// CRUD actions for games
app.get("/game/new", routes.requireLogin, routes.newGameForm);
app.get("/game/:id", routes.gameDetails);
app.post("/game/save", routes.requireLogin, routes.saveGame);
app.get("/game/edit/:id", routes.requireLogin, routes.editGameForm);
app.post("/game/update/:id", routes.requireLogin, routes.updateGame);
app.post("/game/delete/:id", routes.requireLogin, routes.deleteGame);

// play mode
app.get("/play/:id", routes.requireLogin, routes.playGame);
app.post("/play/:id/result", routes.requireLogin, routes.recordResult);

app.listen(PORT, (err) => {
  console.clear();
  if (err) {
    console.log("\x1b[31m%s\x1b[0m", err); // Red for errors
  } else {
    console.log(
      "\x1b[36m%s\x1b[0m",
      `🌐  Server listening on port: ${PORT} | Press CTRL+C to stop`
    );
    console.log("\x1b[35m%s\x1b[0m", `👋  Welcome to < Kode ! >`);
    console.log(
      "\x1b[90m%s\x1b[0m",
      `🔐  To test, log in with credentials, or create your own account.\n`
    );
    console.log("\x1b[36m%s\x1b[0m", "➡️   http://localhost:3000/auth \n");
    console.log(
      "\x1b[37m%s\x1b[0m",
      `🔺    user: admin1     pass: adminpass     (\x1b[31madmin\x1b[0m)`
    );
    console.log(
      "\x1b[37m%s\x1b[0m",
      `🔹    user: guest1     pass: guestpass     (\x1b[34mguest\x1b[0m)`
    );
    console.log(
      "\n\x1b[90m%s\x1b[0m",
      "🎮   Or navigate to the games without an account! \n"
    );
    console.log("\x1b[36m%s\x1b[0m", "➡️   http://localhost:3000 \n");
  }
});
