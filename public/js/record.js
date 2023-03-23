var msg_box = document.getElementById("msg_box"),
  button = document.getElementById("button"),
  canvas = document.getElementById("canvas"),
  lang = {
    press_to_start: "Appuyez pour enregister le piano",
    recording: "Enregistrement en cours",
    stop: "Stop",
    listen: "Ecouter",
    add: "Ajouter à la bibliothèque",
  },
  time;

msg_box.innerHTML = lang.press_to_start;

if (navigator.mediaDevices === undefined) {
  navigator.mediaDevices = {};
}

if (navigator.mediaDevices.getUserMedia === undefined) {
  navigator.mediaDevices.getUserMedia = function (constrains) {
    var getUserMedia =
      navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    if (!getUserMedia) {
      return Promise.reject(
        new Error("getUserMedia is not implemented in this browser")
      );
    }

    return new Promise(function (resolve, reject) {
      getUserMedia.call(navigator, constrains, resolve, reject);
    });
  };
}

var btn_status = "inactive";

button.onclick = function () {
  if (btn_status == "inactive") {
    getAudioContext().resume();
    start();
  } else if (btn_status == "recording") {
    stop();
  }
};

function parseTime(sec) {
  var h = parseInt(sec / 3600);
  var m = parseInt(sec / 60);
  var sec = sec - (h * 3600 + m * 60);

  h = h == 0 ? "" : h + ":";
  sec = sec < 10 ? "0" + sec : sec;

  return h + m + ":" + sec;
}

function start() {
  button.classList.add("recording");
  btn_status = "recording";
  msg_box.innerHTML = lang.recording;
  time = Math.ceil(new Date().getTime() / 1000);
  timeInSec = Math.ceil(new Date());
}

function stop() {
  button.classList.remove("recording");
  btn_status = "inactive";

  var now = Math.ceil(new Date().getTime() / 1000);

  var t = parseTime(now - time);

  msg_box.innerHTML =
    "<p> " +
    t +
    "s </p>" +
    '<button onclick="listen(); return false;" class="btn">' +
    lang.listen +
    "</button>" +
    '<button onclick="add(); return false;" class="btn">' +
    lang.add +
    "</button>";
}

function roundedRect(ctx, x, y, width, height, radius, fill) {
  ctx.beginPath();
  ctx.moveTo(x, y + radius);
  ctx.lineTo(x, y + height - radius);
  ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
  ctx.lineTo(x + width - radius, y + height);
  ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
  ctx.lineTo(x + width, y + radius);
  ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
  ctx.lineTo(x + radius, y);
  ctx.quadraticCurveTo(x, y, x, y + radius);

  ctx.fillStyle = fill;
  ctx.fill();
}

function listen() {
  console.log("cc");
  const notesRecorded = new Sound(context);
  const now = context.currentTime;
  recordedNotes.forEach((i) => notesRecorded.play(i.frequency, now + i.time));
}

function add() {
  if (recordedNotes) {
    socket.emit("messageFromClient", recordedNotes);
    recordedNotes = [];
  }
}
