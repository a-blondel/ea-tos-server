const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 80;

const CONTENT_DIR = path.join(__dirname, "content");

function serveTextFile(filePath, res) {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading ${filePath}:`, err.message);
      return res.status(500).send("Server error");
    }
    res.set("Content-Type", "text/plain;charset=UTF-8");
    res.send(data);
  });
}

app.get("/tos/", (req, res) => {
  serveTextFile(path.join(CONTENT_DIR, "tosa.en.txt"), res);
});

app.get("/tos-ps2/", (req, res) => {
  serveTextFile(path.join(CONTENT_DIR, "tosa-ps2.en.txt"), res);
});

app.get("/news/", (req, res) => {
  serveTextFile(path.join(CONTENT_DIR, "news.en.txt"), res);
});

app.get("/faq/", (req, res) => {
  serveTextFile(path.join(CONTENT_DIR, "faq.en.txt"), res);
});

app.get("/eaconnect/", (req, res) => {
  serveTextFile(path.join(CONTENT_DIR, "eaconnect.en.txt"), res);
});

// Keep legacy endpoint for backward compatibility
app.get("/legalapp{/*path}", (req, res) => {
  serveTextFile(path.join(CONTENT_DIR, "tosa.en.txt"), res);
});

app.get("/roster", (req, res) => {
  res.set("Content-Type", "text/plain;charset=UTF-8");
  res.send(Buffer.alloc(1));
});

app.use("/images", express.static(path.join(CONTENT_DIR, "images")));

app.get("/health", (req, res) => {
  res.send("OK");
});

app.use((req, res) => {
  res.status(404).send("Not Found");
});

app.listen(PORT, () => {
  console.log(`EA content server listening on port ${PORT}`);
});
