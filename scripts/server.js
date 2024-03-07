import express from "express";
import fetch from "node-fetch";
import cors from "cors";
const app = express();

app.use(cors());

app.get("/api/gregorian", async (req, res) => {
  const myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  const response = await fetch(
    "https://orthocal.info/api/gregorian/",
    requestOptions
  );
  const data = await response.json();
  res.json(data);
});

app.get("/static/bolls/app/views/languages", async (req, res) => {
  const response = await fetch(
    "https://bolls.life/static/bolls/app/views/languages.json"
  );
  const data = await response.json();
  res.json(data);
});

app.get("/get-books/:shortName", async (req, res) => {
  const response = await fetch(
    `https://bolls.life/get-books/${req.params.shortName}/`
  );
  const data = await response.json();
  res.json(data);
});

app.get("/get-text/:shortName/:bookId/:chapterId/", async (req, res) => {
  const response = await fetch(
    `https://bolls.life/get-text/${req.params.shortName}/${req.params.bookId}/${req.params.chapterId}/`
  );
  const data = await response.json();
  res.json(data);
});

app.get(
  "/get-verse/:shortName/:bookId/:chapterNumber/:verseNumber/",
  async (req, res) => {
    const response = await fetch(
      `https://bolls.life/get-verse/${req.params.shortName}/${req.params.bookId}/${req.params.chapterNumber}/${req.params.verseNumber}/`
    );
    const data = await response.json();
    res.json(data);
  }
);

app.get("/dictionary-definition/BDBT/:strongNumber/", async (req, res) => {
  const response = await fetch(
    `https://bolls.life/dictionary-definition/BDBT/${req.params.strongNumber}/`
  );
  const data = await response.json();
  res.json(data);
});

app.listen(3000, () => console.log("Server running on port 3000"));
