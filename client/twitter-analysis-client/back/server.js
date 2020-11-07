const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const db = require("./db");

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API calls
app.get("/api/fetch/:type?/:value?", (req, res) => {
  console.log(req.params)
  if(req.params && req.params.type && req.params.type.indexOf('date') > -1) {
    db.allTweetsByDate(res, req.params.type, req.params.value);
  } else {
    db.allTweets(res, req.params.type, req.params.value);
  }
});

app.get("/api/raw", (req, res) => {
  db.rawData(res);
});

app.get("/api/del", (req, res) => {
  db.del(res);
});

app.get("/api/init", (req, res) => {
  db.init();
  db.silentDel();
  db.allTweets(res);
});

if (process.env.NODE_ENV === "production") {
  // Serve any static files
  app.use(express.static(path.join(__dirname, "client/build")));

  // Handle React routing, return all requests to React app
  app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

app.listen(port, () => console.log(`Listening on port ${port}`));
