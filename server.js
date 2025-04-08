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

app.locals.pretty = true; //to generate pretty view-source code in browser

app.use(express.urlencoded({ extended: true }));
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
//app.use(methodLogger);
//routes
app.get("/", routes.gamesOverview);
app.get("/index", routes.index);

app.get("/games", routes.gamesOverview);

app.get("/auth", routes.authPage);
app.post("/login", routes.login);
app.post("/signup", routes.signup);
app.get("/logout", routes.logout);

app.get("/admin", routes.adminPanel); // admin‑only page

//CRUD actions for games
app.get("/game/new", routes.requireLogin, routes.newGameForm);
app.get("/game/:id", routes.gameDetails);

app.post("/game/save", routes.requireLogin, routes.saveGame);
app.get("/game/edit/:id", routes.requireLogin, routes.editGameForm);
app.post("/game/update/:id", routes.requireLogin, routes.updateGame);
app.post("/game/delete/:id", routes.requireLogin, routes.deleteGame);

//start server
app.listen(PORT, (err) => {
  if (err) console.log(err);
  else {
    console.log(`Server listening on port: ${PORT} CNTL:-C to stop`);
    console.log(`To Test:`);
    console.log("user: ldnel password: secret");
    console.log("http://localhost:3000/index.html");
    console.log("http://localhost:3000/games");
    console.log("http://localhost:3000/admin/372");
  }
});
