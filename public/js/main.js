var socket = io();

let nbItemGallery = 1;

var gallery = document.getElementById("gallery");

let galleryRecorded = [];

let isModalOpen = false;

const videoElement = document.getElementsByClassName("input_video")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");
canvasElement.width = window.innerWidth;
canvasElement.height = innerHeight;

const keyCount = 20;
const pianoHeight = canvasElement.height / 4;
const noteWidth = canvasElement.width / keyCount;
const blackKeys = [1, 2, 4, 5, 6, 8, 9, 11, 12, 13, 15, 16, 18, 19];
const whiteNotes = [
  261.626, 293.665, 329.628, 349.228, 391.995, 440, 493.883, 523.251, 587.33,
  659.255, 698.456, 783.991, 880, 987.767, 1046.5, 1174.66, 1318.51, 1396.91,
  1567.98, 1760, 1975.53,
];
const blackNotes = [
  0, 277.183, 311.127, 0, 369.994, 415.305, 466.164, 0, 554.365, 622.254, 0,
  739.989, 830.609, 932.328, 0, 1108.73, 1244.51, 0, 1479.98, 1661.22, 0,
];
let actualWhiteNotes = [];
let actualBlackNotes = [];

let recordedNotes = [];

let click = false;

setInterval(() => {
  actualWhiteNotes = [];
  actualBlackNotes = [];
}, 500);

setInterval(() => {
  click = false;
}, 1000);

let selectedWhiteNoteIndex;
let selectedWhiteNotes = [];

let selectedBlackNoteIndex;
let selectedBlackNotes = [];

const noteCoords = [];

let whiteNoteWidth = noteWidth;
let blackNoteWidth = whiteNoteWidth * 0.382;
let whiteNoteHeight = pianoHeight;
let blackNoteHeight = whiteNoteHeight * 0.618;

const whiteNotesZone =
  (canvasElement.height / 2 - whiteNoteHeight / 2 + blackNoteHeight) /
  canvasElement.height;

for (let i = 0; i < keyCount; i++) {
  let noteEnd = i * noteWidth;
  noteCoords.push(noteEnd);
}

let noteCoordsForCursor = noteCoords.map((noteCoords) => {
  return noteCoords / canvasElement.width;
});

function Results(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );
  selectedWhiteNoteIndex = undefined;
  selectedWhiteNotes = [];

  selectedBlackNoteIndex = undefined;
  selectedBlackNotes = [];

  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      const cursor = [
        landmarks[4],
        landmarks[8],
        landmarks[12],
        landmarks[16],
        landmarks[20],
      ];
      for (let index = 4; index <= 20; index += 4) {
        if (
          landmarks[index].y > 1 / 3 &&
          landmarks[index].y < 2 / 3 &&
          isModalOpen === false
        ) {
          if (landmarks[index - 1].y < landmarks[index].y) {
            if (landmarks[index].y > whiteNotesZone) {
              selectedWhiteNoteIndex = Math.floor(landmarks[index].x * 20);
              selectedWhiteNotes.push(selectedWhiteNoteIndex);
            } else {
              blackKeys.forEach((k) => {
                let blackKeyStart =
                  noteCoordsForCursor[k] -
                  blackNoteWidth / canvasElement.width / 2;
                let blackKeyStop =
                  noteCoordsForCursor[k] +
                  blackNoteWidth / canvasElement.width / 2;
                if (
                  landmarks[index].x > blackKeyStart &&
                  landmarks[index].x < blackKeyStop
                ) {
                  selectedBlackNoteIndex = k;
                  selectedBlackNotes.push(selectedBlackNoteIndex);
                }
              });
            }
          }
        } else {
          selectedWhiteNotes.splice(
            selectedWhiteNotes.findIndex(
              (selectedWhiteNoteIndex) => selectedWhiteNoteIndex === index
            ),
            1
          );
        }
        if (
          landmarks[index - 1].y < landmarks[index].y &&
          landmarks[index - 2].y > landmarks[index].y &&
          !click
        ) {
          let CursorPX = {
            x: landmarks[index].x * canvasElement.width,
            y: landmarks[index].y * canvasElement.height,
          };

          if (
            CursorPX &&
            CursorPX.x < canvasElement.width &&
            CursorPX.x > 0 &&
            CursorPX.y < canvasElement.height &&
            CursorPX.y > 0
          ) {
            document.elementFromPoint(CursorPX.x, CursorPX.y).click();
            click = true;
          }
        }
      }
      drawLandmarks(canvasCtx, cursor, { color: "#e74c3c", lineWidth: 2 });
    }
  }

  noteCoords.forEach((noteCoord, i) => {
    noteName = new Path2D();
    noteName.rect(
      noteCoord + 0.5,
      canvasElement.height / 2 - whiteNoteHeight / 2,
      whiteNoteWidth,
      whiteNoteHeight
    );

    canvasCtx.strokeStyle = "#000";
    canvasCtx.stroke(noteName);

    if (selectedWhiteNotes.includes(i)) {
      canvasCtx.fillStyle = "rgba(255, 255, 100, 0.5)";
      if (!actualWhiteNotes.includes(whiteNotes[i])) {
        actualWhiteNotes.push(whiteNotes[i]);
        const note = new Sound(context);
        const now = context.currentTime;
        note.play(whiteNotes[i], now);
        if (btn_status === "recording") {
          let timeNow = Math.ceil(new Date());
          let t = timeNow - timeInSec;
          recordedNotes.push({ frequency: whiteNotes[i], time: t * 0.001 });
        }
      }
    } else {
      canvasCtx.fillStyle = "rgba(255, 255, 255, 0.5)";
    }
    canvasCtx.fill(noteName);

    if (blackKeys.indexOf(i) !== -1) {
      const noteNameHigh = new Path2D();
      const blackKeysStartX = noteCoord - blackNoteWidth / 2;
      const blackKeysStartY = canvasElement.height / 2 - whiteNoteHeight / 2;

      noteNameHigh.rect(
        blackKeysStartX,
        blackKeysStartY,
        blackNoteWidth,
        blackNoteHeight
      );

      canvasCtx.strokeStyle = "#000";
      canvasCtx.stroke();

      if (selectedBlackNotes.includes(i)) {
        canvasCtx.fillStyle = "yellow";
        if (!actualBlackNotes.includes(blackNotes[i])) {
          actualBlackNotes.push(blackNotes[i]);
          const note = new Sound(context);
          const now = context.currentTime;
          note.play(blackNotes[i], now);
          if (btn_status === "recording") {
            let timeNow = Math.ceil(new Date());
            let t = timeNow - timeInSec;
            recordedNotes.push({ frequency: blackNotes[i], time: t * 0.001 });
          }
        }
      } else {
        canvasCtx.fillStyle = "#000000";
      }
      canvasCtx.fill(noteNameHigh);
    }
  });
  canvasCtx.restore();
}

const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  },
});
hands.setOptions({
  selfieMode: true,
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});
hands.onResults(Results);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: innerWidth,
  height: innerHeight,
});
camera.start();

let context = null;

const galleryModal = document.getElementById("galleryModal");

function hidePopup() {
  context = new (window.AudioContext || window.webkitAudioContext)();
  document.querySelector(".popup-container").style.display = "none";
}

function galleryModalShow() {
  galleryModal.style.display = "flex";
}

function galleryModalHide() {
  galleryModal.style.display = "none";
  isModalOpen = false;
}

socket.on('messageFromServer', function(msg) {
  galleryRecorded.push(msg)
  var item = document.createElement('button');
  item.setAttribute("onclick", `play(${nbItemGallery})`);
  item.setAttribute("class", "btn");
  item.textContent = `Enregistrement ${nbItemGallery}`
  gallery.appendChild(item);
  nbItemGallery++
});
