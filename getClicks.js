let pitchMap = [
  ["0", 0.5],
  ["1", 0.53],
  ["2", 0.56],
  ["3", 0.59],
  ["4", 0.63],
  ["5", 0.67],
  ["6", 0.71],
  ["7", 0.75],
  ["8", 0.79],
  ["9", 0.84],
  ["10", 0.89],
  ["11", 0.94],
  ["12", 1],
  ["13", 1.06],
  ["14", 1.12],
  ["15", 1.19],
  ["16", 1.26],
  ["17", 1.33],
  ["18", 1.41],
  ["19", 1.5],
  ["20", 1.59],
  ["21", 1.68],
  ["22", 1.78],
  ["23", 1.89],
  ["24", 2],
];

function getClicks(pitch = 0) {
  return pitchMap.reduce(function (prev, curr) {
    return (Math.abs(curr[1] - pitch) < Math.abs(prev[1] - pitch) ? curr : prev);
  })[0];
}

module.exports = {
  getClicks,
  pitchMap
}