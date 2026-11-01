// ---------- Music player ----------
const songs = [
  { title: "Until I found U", src: "assets/music/Until_I_Found_You.mp3" },
  { title: "CO2", src: "assets/music/Co2.mp3" },
];

const audio = new Audio();
audio.volume = 0.8;
let songIndex = 0;

const musicTitle = document.getElementById("music-title");
const musicTime = document.getElementById("music-time");
const musicProgress = document.getElementById("music-progress");
const musicVolume = document.getElementById("music-volume");
const musicList = document.getElementById("music-list");

// Turns seconds into mm:ss
function formatTime(sec) {
  if (!isFinite(sec)) return "00:00";
  const minutes = Math.floor(sec / 60);
  const seconds = Math.floor(sec % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// Draws the playlist, highlighting the current song
function renderSongList() {
  musicList.innerHTML = "";
  songs.forEach((song, i) => {
    const row = document.createElement("div");
    row.className = "song" + (i === songIndex ? " active" : "");
    row.textContent = `${i + 1}. ${song.title}`;
    row.addEventListener("click", () => {
      loadSong(i);
      play();
    });
    musicList.appendChild(row);
  });
}

function loadSong(i) {
  if (songs.length === 0) return;
  songIndex = i;
  audio.src = songs[i].src;
  musicTitle.textContent = songs[i].title;
  musicProgress.value = 0;
  musicTime.textContent = "00:00 / 00:00";
  renderSongList();
}

function play() {
  if (songs.length === 0) {
    musicTitle.textContent = "No songs yet. Click Add.";
    return;
  }
  if (!audio.src) loadSong(0);
  audio.play().catch(() => {}); // the browser may block autoplay until you click
}

function pause() {
  audio.pause();
}

function next() {
  if (songs.length === 0) return;
  loadSong((songIndex + 1) % songs.length);
  play();
}

function prev() {
  if (songs.length === 0) return;
  loadSong((songIndex - 1 + songs.length) % songs.length);
  play();
}

// Buttons
document.getElementById("music-play").addEventListener("click", play);
document.getElementById("music-pause").addEventListener("click", pause);
document.getElementById("music-next").addEventListener("click", next);
document.getElementById("music-prev").addEventListener("click", prev);

// Time display and progress bar
audio.addEventListener("timeupdate", () => {
  musicTime.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
  if (audio.duration) {
    musicProgress.value = (audio.currentTime / audio.duration) * 100;
  }
});

// Dragging the progress bar jumps to that point
musicProgress.addEventListener("input", () => {
  if (audio.duration) {
    audio.currentTime = (musicProgress.value / 100) * audio.duration;
  }
});

// Volume slider
musicVolume.addEventListener("input", () => {
  audio.volume = musicVolume.value / 100;
});

// Play the next song when one ends
audio.addEventListener("ended", next);

// Show a message if a song can't load
audio.addEventListener("error", () => {
  if (songs.length > 0) musicTitle.textContent = "Could not load this song.";
});

// Add songs from your computer
document.getElementById("music-input").addEventListener("change", (e) => {
  const files = Array.from(e.target.files);
  files.forEach((file) => {
    songs.push({
      title: file.name.replace(/\.[^.]+$/, ""),
      src: URL.createObjectURL(file),
    });
  });
  if (files.length > 0) {
    loadSong(songs.length - files.length);
  }
});

// Start up
renderSongList();
if (songs.length > 0) loadSong(0);