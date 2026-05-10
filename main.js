/* ─────────────────────────────────────────
   TRACKS
   Each track maps to an audio file, a display
   image, a title and a guest description.
───────────────────────────────────────── */
const TRACKS = [
  {
    title:  "Pflege, Demenz und Abschied",
    guest:  "Ingrid Zettl im Gespräch mit Hannah Gissing",
    file:   "media/Pflege_Demenz_und_Abschied.mp3",
    image:  "media/Duplex_Ingrid_und_Opa-2.jpg",
  },
  {
    title:  "Ein Jahr im Pflegeheim",
    guest:  "Jana Haage im Gespräch mit Hannah Gissing",
    file:   "media/Ein_Jahr_im_Altersheim.m4a",
    image:  "media/Duplex_Jana.jpg",
  },
  {
    title:  "Wahrnehmung & Erinnerung",
    guest:  "Hannah Gissing im Gespräch mit Bernhard Gissing",
    file:   "media/Wahrnehmung_und_Erinnerung.mp3",
    image:  "media/Opa_Hg.jpg",
  },
  {
    title:  "Alles über EMDR",
    guest:  "Mag. Daniela Aflenzer im Gespräch mit Hannah Gissing",
    file:   "media/Alles_ueber_EMDR.mp3",
    image:  "media/Original_Mag__Daniela_Aflenzer.jpg",
  },
];

/* ─────────────────────────────────────────
   DOM REFS
───────────────────────────────────────── */
const audio         = document.getElementById("audio-player");
const playBtn       = document.getElementById("play-btn");
const playIcon      = document.getElementById("play-icon");
const trackTitle    = document.getElementById("track-title");
const trackGuest    = document.getElementById("track-guest");
const trackTime     = document.getElementById("track-time");
const progressBar   = document.getElementById("progress-bar");
const progressCont  = document.getElementById("progress-container");
const tabsContainer = document.getElementById("tabs");
const trackImage    = document.getElementById("track-image");

/* ─────────────────────────────────────────
   STATE
───────────────────────────────────────── */
let currentIndex = 0;

/* ─────────────────────────────────────────
   BUILD TABS
───────────────────────────────────────── */
TRACKS.forEach((track, i) => {
  const tab = document.createElement("button");
  tab.className = "tab";
  tab.textContent = track.title;
  tab.setAttribute("aria-label", `Interview: ${track.title}`);

  tab.addEventListener("click", () => {
    loadTrack(i);
    audio.play().catch(() => {});
  });

  tabsContainer.appendChild(tab);
});

/* ─────────────────────────────────────────
   LOAD TRACK
───────────────────────────────────────── */
function loadTrack(index) {
  currentIndex = index;
  const track = TRACKS[index];

  // Audio source
  audio.src = track.file;
  audio.load();

  // UI text
  trackTitle.textContent = track.title;
  trackGuest.textContent = track.guest;
  trackTime.textContent  = "0:00 / --:--";

  // Image swap with a quick fade
  trackImage.style.opacity = "0";
  setTimeout(() => {
    trackImage.src = track.image;
    trackImage.alt = track.title;
    trackImage.style.opacity = "1";
  }, 180);

  // Reset progress
  progressBar.style.width = "0%";

  // Active tab
  document.querySelectorAll(".tab").forEach((t, i) => {
    t.classList.toggle("active", i === index);
  });

  // Reset icon to play
  setIcon("play");
}

/* ─────────────────────────────────────────
   PLAY / PAUSE BUTTON
───────────────────────────────────────── */
playBtn.addEventListener("click", () => {
  if (audio.paused) {
    audio.play().catch(() => {});
  } else {
    audio.pause();
  }
});

audio.addEventListener("play",  () => setIcon("pause"));
audio.addEventListener("pause", () => setIcon("play"));
audio.addEventListener("ended", () => {
  setIcon("play");
  progressBar.style.width = "0%";
  // Auto-advance to next track
  const next = (currentIndex + 1) % TRACKS.length;
  loadTrack(next);
});

/* ─────────────────────────────────────────
   PROGRESS + TIME
───────────────────────────────────────── */
audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;

  const pct = (audio.currentTime / audio.duration) * 100;
  progressBar.style.width = pct + "%";

  trackTime.textContent =
    formatTime(audio.currentTime) + " / " + formatTime(audio.duration);
});

/* Seek on click */
progressCont.addEventListener("click", (e) => {
  if (!audio.duration) return;
  const rect = progressCont.getBoundingClientRect();
  audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
});

/* Drag to seek */
let isDragging = false;

progressCont.addEventListener("mousedown", () => { isDragging = true; });
document.addEventListener("mousemove", (e) => {
  if (!isDragging || !audio.duration) return;
  const rect = progressCont.getBoundingClientRect();
  const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  audio.currentTime = pct * audio.duration;
});
document.addEventListener("mouseup", () => { isDragging = false; });

/* Touch seek */
progressCont.addEventListener("touchstart", handleTouch, { passive: true });
progressCont.addEventListener("touchmove",  handleTouch, { passive: true });

function handleTouch(e) {
  if (!audio.duration) return;
  const touch = e.touches[0];
  const rect  = progressCont.getBoundingClientRect();
  const pct   = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
  audio.currentTime = pct * audio.duration;
}

/* ─────────────────────────────────────────
   KEYBOARD SHORTCUTS
───────────────────────────────────────── */
document.addEventListener("keydown", (e) => {
  // Space = play/pause (when not focused on an input)
  if (e.code === "Space" && document.activeElement.tagName !== "INPUT") {
    e.preventDefault();
    audio.paused ? audio.play() : audio.pause();
  }
  // ArrowRight = +10s
  if (e.code === "ArrowRight") {
    audio.currentTime = Math.min(audio.currentTime + 10, audio.duration || 0);
  }
  // ArrowLeft = -10s
  if (e.code === "ArrowLeft") {
    audio.currentTime = Math.max(audio.currentTime - 10, 0);
  }
});

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function setIcon(state) {
  const path = playIcon.querySelector("path");
  if (state === "pause") {
    // Two bars
    path.setAttribute("d", "M6 5h4v14H6zm8 0h4v14h-4z");
  } else {
    // Triangle
    path.setAttribute("d", "M8 5v14l11-7z");
  }
}

function formatTime(s) {
  if (!s || isNaN(s)) return "0:00";
  const m   = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

/* ─────────────────────────────────────────
   INIT — load first track (without playing)
───────────────────────────────────────── */
loadTrack(0);

/* ─────────────────────────────────────────
   SCROLL FADE-IN for text blocks
───────────────────────────────────────── */
const textBlocks = document.querySelectorAll(".text-block");

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity    = "1";
      entry.target.style.transform  = "translateY(0)";
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

textBlocks.forEach((block) => {
  block.style.opacity   = "0";
  block.style.transform = "translateY(20px)";
  block.style.transition = "opacity 0.55s ease, transform 0.55s ease";
  observer.observe(block);
});
