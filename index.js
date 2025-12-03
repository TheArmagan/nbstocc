const fs = require("fs");
const { getClicks } = require("./getClicks");
const instrumentsNames = require("./instruments.json")
const NBS = require("nbs.js")
const sleepReduceRegex = /(sleep\((\d+\.\d+)\)\n?){2,}/gm;
const express = require("express");
const app = express();
const path = require("path");

/**
 * @param {NBS.Song} song
 * @param {"top"|"bottom"|"left"|"right"|"back"|"front"} wrap
 * @returns {string}
 */
function nbsToCCCode(song) {
  let result = [
    "-- Armagan's NBS to CC Speaker converter.",
    `local s = peripheral.find("speaker")`,
  ];

  /** @type {NBS.Layer[]} */
  let layers = Object.values(song.layers);
  let sleepDur = parseFloat((1 / song.tempo).toFixed(2));
  for (let noteIndex = 0; noteIndex < song.length + 1; noteIndex++) {
    result.push(`sleep(${sleepDur})`)
    layers.forEach((layer) => {
      let note = layer.notes[noteIndex];
      if (note) {
        result.push(`s.playNote("${instrumentsNames[String(note.instrument)]}", 2, ${getClicks(note.pitch)})`)
      }
    });
  }

  let resultStep1 = result.join("\n"); // join array
  let resultStep2 = resultStep1.replace(sleepReduceRegex, (match) => {
    let num = match.split("\n").reduce((all, cur) => all + Number(cur.slice(6, -1)), 0);
    return `sleep(${num})\n`
  }); // Reduce sleeps
  resultStep1 = 0;
  sleepDur = 0;
  layers = 0;
  result = 0;
  return resultStep2;
}
const inputFolder = path.resolve(__dirname, "./input");
const outputFolder = path.resolve(__dirname, "./output");

if (!fs.existsSync(inputFolder)) fs.mkdirSync(inputFolder, { recursive: true });
if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder, { recursive: true });

app.get("/song/:songName", (req, res) => {
  res.type("text/plain")
  let songName = req.params.songName;
  if (songName.endsWith(".lua") || songName.endsWith(".nbs")) songName = songName.slice(0, -4);
  let luaFilePath = path.resolve(outputFolder, `${songName}.lua`);
  if (fs.existsSync(luaFilePath)) {
    console.log("[EXIST]", luaFilePath)
    res.send(fs.readFileSync(luaFilePath, "utf-8"))
    return;
  }
  let nbsFilePath = path.resolve(inputFolder, `${songName}.nbs`);
  if (!fs.existsSync(nbsFilePath)) {
    console.log("[NOTFOUND]", nbsFilePath)
    res.send(`error("Song not found.")`)
    return;
  }
  console.log("[GENERATE]", nbsFilePath)
  let song = NBS.loadSong(nbsFilePath);
  let luaCode = nbsToCCCode(song);
  song = 0;
  res.send(luaCode);
  fs.writeFileSync(luaFilePath, luaCode);
  luaCode = 0;
})

app.listen(8080, () => {
  console.log(`NBS to CC Code by Kıraç Armağan Önal\n`);
  console.log("Example Code:")
  console.log(`wget run http://localhost:8080/song/cancan\n`);
});

