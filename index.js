const fs = require("fs");
const { getClicks } = require("./getClicks");
const instrumentsNames = require("./instruments.json")
const NBS = require("nbs.js")
let song = NBS.loadSong("./input.nbs");

console.log(song);

let result = [
  "-- Armagan's NBS to CC Speaker converter.",
  `local s = peripheral.wrap("top")`,
];


/** @type {NBS.Layer[]} */
let layers = Object.values(song.layers);
let sleepDur = parseFloat((1 / song.tempo).toFixed(2));
let lastNoteIndex = 0;
for (let noteIndex = 0; noteIndex < song.length+1; noteIndex++) {
  
  result.push(`sleep(${sleepDur})`)
  layers.forEach((layer) => {
    let note = layer.notes[noteIndex];
    if (note) {
      lastNoteIndex = noteIndex;
      result.push(`s.playNote("${instrumentsNames[String(note.instrument)]}", 1, ${getClicks(note.pitch)})`)
    }
  });
}
let sleepReduceRegex = /(sleep\((\d+\.\d+)\)\n?){2,}/gm;
let resultStep1 = result.join("\n"); // join array
let resultStep2 = resultStep1.replace(sleepReduceRegex, (match) => {
  let num = match.split("\n").reduce((all, cur) => all + Number(cur.slice(6, -1)), 0);
  return `sleep(${num})\n`
}) // Reduce sleeps

fs.writeFileSync("./result.lua", resultStep2, "utf8");

