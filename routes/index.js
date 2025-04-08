var url = require("url");
var sqlite3 = require("sqlite3").verbose(); //verbose provides more detailed stack trace
var db = new sqlite3.Database("data/trivia_db"); //open database file

db.serialize(function () {
  // no longer used, seed file
});

exports.authenticate = function (request, response, next) {
  /*
	Middleware to do BASIC http 401 authentication
	*/
  var auth = request.headers.authorization;
  // auth is a base64 representation of (username:password)
  //so we will need to decode the base64
  if (!auth) {
    //note here the setHeader must be before the writeHead
    response.setHeader("WWW-Authenticate", 'Basic realm="need to login"');
    response.writeHead(401, { "Content-Type": "text/html" });
    console.log("No authorization found, send 401.");
    response.end();
  } else {
    console.log("Authorization Header: " + auth);
    //decode authorization header
    // Split on a space, the original auth
    //looks like  "Basic Y2hhcmxlczoxMjM0NQ==" and we need the 2nd part
    var tmp = auth.split(" ");

    // create a buffer and tell it the data coming in is base64
    var buf = Buffer.from(tmp[1], "base64");

    // read it back out as a string
    //should look like 'ldnel:secret'
    var plain_auth = buf.toString();
    console.log("Decoded Authorization ", plain_auth);

    //extract the userid and password as separate strings
    var credentials = plain_auth.split(":"); // split on a ':'
    var username = credentials[0];
    var password = credentials[1];
    console.log("User: ", username);
    console.log("Password: ", password);

    /*  look‑up the user once and remember the role  */
    db.get(
      "SELECT userid, password, role FROM users WHERE userid = ?",
      [username],
      function (err, row) {
        if (!row || row.password !== password) {
          //we had an authorization header by the user:password is not valid
          response.setHeader("WWW-Authenticate", 'Basic realm="need to login"');
          response.writeHead(401, { "Content-Type": "text/html" });
          console.log("No authorization found, send 401.");
          response.end();
        } else {
          /* stash the user object so later routes know who is calling */
          request.user = { userid: row.userid, role: row.role };
          next();
        }
      }
    );
  }
};
function addHeader(request, response) {
  // about.html
  var title = "COMP 2406:";
  response.writeHead(200, { "Content-Type": "text/html" });
  response.write("<!DOCTYPE html>");
  response.write("<html><head><title>About</title></head>" + "<body>");
  response.write("<h1>" + title + "</h1>");
  response.write("<hr>");
}

function addFooter(request, response) {
  response.write("<hr>");
  response.write("<h3>" + "Carleton University" + "</h3>");
  response.write("<h3>" + "School of Computer Science" + "</h3>");
  response.write("</body></html>");
}

exports.index = function (request, response) {
  // index.html
  response.render("index", {
    title: "COMP 2406",
    body: "rendered with handlebars",
    user: req.user,
  });
};

function parseURL(request, response) {
  var parseQuery = true; //parseQueryStringIfTrue
  var slashHost = true; //slashDenoteHostIfTrue
  var urlObj = url.parse(request.url, parseQuery, slashHost);
  console.log("path:");
  console.log(urlObj.path);
  console.log("query:");
  console.log(urlObj.query);
  //for(x in urlObj.query) console.log(x + ': ' + urlObj.query[x]);
  return urlObj;
}

exports.gamesOverview = function (req, res) {
  db.all(
    `SELECT g.gameid,
                g.title,
              g.description,
                g.category_id,
                g.author_id,
                (SELECT COUNT(*) FROM questions WHERE game_id = g.gameid) AS questionCount,
                (SELECT COUNT(*) FROM results   WHERE game_id = g.gameid) AS playCount
         FROM   games g
         ORDER  BY g.gameid DESC`,
    function (err, rows) {
      res.render("games", {
        title: "All Trivia Games",
        games: rows,
        user: req.user,
      });
      console.log(req.user);
    }
  );
};

exports.gameDetails = function (req, res) {
  const gameId = req.params.id;
  db.get(
    `SELECT g.*, c.name AS categoryName,
                (SELECT COUNT(*) FROM results WHERE game_id=g.gameid) AS playCount
         FROM   games g
                LEFT JOIN categories c ON c.id = g.category_id
         WHERE  g.gameid = ?`,
    [gameId],
    (err, game) => {
      if (!game) return res.status(404).send("Game not found");
      db.all(
        `SELECT questionid, type, question, correct, option1, option2, option3
           FROM questions WHERE game_id = ?`,
        [gameId],
        function (err, questions) {
          console.log(req.user);

          res.render("gameDetails", {
            title: game.title,
            game: game,
            questions: questions, // <─ pass questions array
            categoryName: game.categoryName || "—",
            playCount: game.playCount || 0,
            user: req.user,
            author_id: game.author_id,
          });
        }
      );
    }
  );
};

exports.adminPanel = function (req, res) {
  if (!req.user || req.user.role !== "admin")
    return res.status(403).send("Forbidden");

  /* pull both user list and result list in parallel */
  db.all("SELECT userid, role FROM users", function (err, users) {
    db.all(
      `SELECT r.resultid,
                r.result_time,
                r.score,
                u.userid          AS player,
                g.title           AS game
         FROM   results r
                JOIN users u ON r.user_id = u.userid
                JOIN games g ON r.game_id = g.gameid
         ORDER  BY r.result_time DESC`,
      function (err, results) {
        res.render("admin", {
          title: "Admin – Users & Results",
          users: users,
          results: results,
          user: req.user,
        });
      }
    );
  });
};

exports.authPage = (req, res) => {
  res.render("auth", { title: "Log in / Sign up", user: req.user });
};

exports.login = (req, res) => {
  const { userid, password } = req.body;
  db.get(
    "SELECT userid, password, role FROM users WHERE userid = ?",
    [userid],
    (err, row) => {
      if (!row || row.password !== password) return res.redirect("/auth");
      req.session.user = { userid: row.userid, role: row.role };
      res.redirect("/games");
    }
  );
};

exports.signup = (req, res) => {
  const { userid, password } = req.body;
  db.get("SELECT userid FROM users WHERE userid = ?", [userid], (err, row) => {
    if (row) return res.redirect("/auth"); // already taken
    db.run(
      "INSERT INTO users (userid,password,role) VALUES (?,?,?)",
      [userid, password, "guest"],
      (err) => {
        if (err) return res.redirect("/auth");
        req.session.user = { userid, role: "guest" };
        res.redirect("/games");
      }
    );
  });
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect("/games"));
};

exports.requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  res.status(403).send("Forbidden");
};

exports.requireLogin = (req, res, next) =>
  req.user ? next() : res.redirect("/auth");

exports.newGameForm = (req, res) => {
  db.all("SELECT id, name FROM categories ORDER BY id", (err, cats) => {
    res.render("gameForm", {
      title: "Create Game",
      categories: cats,
      questions: [],
      isEdit: false,
      user: req.user,
    });
  });
};

const toArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

exports.saveGame = (req, res) => {
  const { title, description, category_id } = req.body;

  const qText = toArray(req.body.question);
  const qType = toArray(req.body.type);
  const qCorrect = toArray(req.body.correct);
  const qOpt1 = toArray(req.body.option1);
  const qOpt2 = toArray(req.body.option2);
  const qOpt3 = toArray(req.body.option3);

  db.run(
    `INSERT INTO games (title,description,category_id,author_id)
       VALUES (?,?,?,?)`,
    [title, description, category_id, req.user.userid],
    function (err) {
      if (err) return res.sendStatus(500);
      const gameId = this.lastID;
      const stmt = db.prepare(
        `INSERT INTO questions
           (game_id,type,question,correct,option1,option2,option3)
           VALUES (?,?,?,?,?,?,?)`
      );
      for (let i = 0; i < qText.length; i++) {
        console.log("added question");
        stmt.run(
          gameId,
          qType[i] || "",
          qText[i],
          qCorrect[i] || "",
          qOpt1[i] || null,
          qOpt2[i] || null,
          qOpt3[i] || null
        );
      }
      stmt.finalize(() => res.redirect("/games"));
    }
  );
};

exports.editGameForm = (req, res) => {
  const gameId = req.params.id;
  db.get("SELECT * FROM games WHERE gameid = ?", [gameId], (err, game) => {
    if (!game) return res.sendStatus(404);
    if (game.author_id !== req.user.userid) return res.sendStatus(403);
    db.all("SELECT * FROM questions WHERE game_id = ?", [gameId], (err, qs) => {
      db.all("SELECT id, name FROM categories ORDER BY id", (err, cats) => {
        res.render("gameForm", {
          title: "Edit Game",
          game,
          questions: qs,
          categories: cats,
          isEdit: true,
          user: req.user,
        });
      });
    });
  });
};

exports.updateGame = (req, res) => {
  const gameId = req.params.id;
  const { title, description, category_id } = req.body;
  db.get(
    "SELECT author_id FROM games WHERE gameid = ?",
    [gameId],
    (err, row) => {
      if (!row) return res.sendStatus(404);
      if (row.author_id !== req.user.userid) return res.sendStatus(403);

      db.run(
        `UPDATE games SET title=?, description=?, category_id=?
         WHERE gameid=?`,
        [title, description, category_id, gameId],
        (err) => {
          if (err) return res.sendStatus(500);
          /* replace questions: simplest path */
          db.run("DELETE FROM questions WHERE game_id = ?", [gameId], () => {
            const qText = toArray(req.body.question);
            const qType = toArray(req.body.type);
            const qCorrect = toArray(req.body.correct);
            const qOpt1 = toArray(req.body.option1);
            const qOpt2 = toArray(req.body.option2);
            const qOpt3 = toArray(req.body.option3);
            const stmt = db.prepare(
              `INSERT INTO questions
               (game_id,type,question,correct,option1,option2,option3)
               VALUES (?,?,?,?,?,?,?)`
            );
            for (let i = 0; i < qText.length; i++) {
              console.log("added question");
              stmt.run(
                gameId,
                qType[i] || "",
                qText[i],
                qCorrect[i] || "",
                qOpt1[i] || null,
                qOpt2[i] || null,
                qOpt3[i] || null
              );
            }
            stmt.finalize(() => res.redirect("/games"));
          });
        }
      );
    }
  );
};

exports.deleteGame = (req, res) => {
  const gameId = req.params.id;
  db.get(
    "SELECT author_id FROM games WHERE gameid = ?",
    [gameId],
    (err, row) => {
      if (!row) return res.sendStatus(404);
      if (row.author_id !== req.user.userid) return res.sendStatus(403);
      db.run("DELETE FROM questions WHERE game_id = ?", [gameId], () => {
        db.run("DELETE FROM games WHERE gameid = ?", [gameId], () =>
          res.redirect("/games")
        );
      });
    }
  );
};

exports.playGame = (req, res) => {
  const id = req.params.id;
  db.get("SELECT title FROM games WHERE gameid = ?", [id], (e, game) => {
    if (!game) return res.sendStatus(404);
    db.all("SELECT * FROM questions WHERE game_id = ?", [id], (e, qs) => {
      res.render("play", {
        title: game.title,
        gameId: id,
        questions: qs, // sent to client as JSON
        user: req.user,
      });
    });
  });
};

exports.recordResult = (req, res) => {
  const score = parseInt(req.body.score, 10) || 0;
  const gid = req.params.id;
  const uid = req.user.userid;
  db.run(
    `INSERT INTO results (user_id,game_id,score)
         VALUES (?,?,?)`,
    [uid, gid, score],
    function (err) {
      if (err) return res.json({ status: "error" });
      /* fetch top‑5 leaderboard for this game */
      db.all(
        "SELECT user_id AS user, score FROM results WHERE game_id=? ORDER BY score DESC LIMIT 5",
        [gid],
        (e, rows) => res.json({ status: "ok", leaderboard: rows })
      );
    }
  );
};

/* ----------  Search endpoints ---------- */
exports.apiSearch = (req, res) => {
  const term = `%${(req.query.title || req.query.q || "").replace(
    /\s+/g,
    "%"
  )}%`;
  db.all(
    `SELECT gameid, title FROM games
            WHERE title LIKE ? COLLATE NOCASE
            ORDER BY title LIMIT 5`,
    [term],
    (e, rows) => res.json(rows)
  );
};

exports.searchGames = (req, res) => {
  const term = `%${(req.query.title || "").replace(/\s+/g, "%")}%`;
  db.all(
    `SELECT g.*, 
                   (SELECT COUNT(*) FROM questions WHERE game_id=g.gameid) AS questionCount,
                   (SELECT COUNT(*) FROM results   WHERE game_id=g.gameid) AS playCount
            FROM   games g
            WHERE  g.title LIKE ? COLLATE NOCASE
            ORDER  BY g.title`,
    [term],
    (e, rows) => {
      res.render("games", {
        title: `Search – ${req.query.title || ""}`,
        games: rows,
        user: req.user,
      });
    }
  );
};
