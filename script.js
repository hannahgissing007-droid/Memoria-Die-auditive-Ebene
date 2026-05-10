/* ─── MEMORIA · script.js ─── */

// ── TRACK CONFIG ──────────────────────────────────────────
const TRACKS = {
  jana:    { file: 'media/Ein_Jahr_im_Altersheim.m4a' },
  ingrid:  { file: 'media/Pflege_Demenz_und_Abschied.mp3' },
  hannah:  { file: 'media/Wahrnehmung_und_Erinnerung.mp3' },
  daniela: { file: 'media/Alles_ueber_EMDR.mp3' },
};

// ── STATE ─────────────────────────────────────────────────
let currentId = null;
let isPlaying = false;

const audio = document.getElementById('global-audio');

// ── HELPERS ───────────────────────────────────────────────
function fmt(s) {
  if (!s || isNaN(s)) return '--:--';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

function updateTimeDisplay(id) {
  const el = document.getElementById('time-' + id);
  if (el) el.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
}

function updateProgress(id) {
  const bar = document.getElementById('prog-' + id);
  if (bar && audio.duration) {
    bar.style.width = (audio.currentTime / audio.duration * 100) + '%';
  }
}

function setIcon(id, playing) {
  // All play buttons for this id (each view has its own, but id is unique)
  document.querySelectorAll(`.play-btn[data-id="${id}"]`).forEach(btn => {
    const path = btn.querySelector('.icon-path');
    path.setAttribute('d', playing
      ? 'M6 5h4v14H6zm8 0h4v14h-4z'
      : 'M8 5v14l11-7z'
    );
  });
}

function resetPlayer(id) {
  const bar  = document.getElementById('prog-' + id);
  const time = document.getElementById('time-' + id);
  if (bar)  bar.style.width = '0%';
  if (time) time.textContent = '0:00 / --:--';
  setIcon(id, false);
}

// ── LOAD ──────────────────────────────────────────────────
function loadTrack(id) {
  if (currentId && currentId !== id) resetPlayer(currentId);
  currentId = id;
  audio.src = TRACKS[id].file;
  audio.load();
}

// ── PLAY / PAUSE ──────────────────────────────────────────
function togglePlay(id) {
  if (currentId !== id) {
    audio.pause();
    isPlaying = false;
    loadTrack(id);
    audio.play().catch(() => {});
    isPlaying = true;
    setIcon(id, true);
    return;
  }
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    setIcon(id, false);
  } else {
    audio.play().catch(() => {});
    isPlaying = true;
    setIcon(id, true);
  }
}

// ── AUDIO EVENTS ──────────────────────────────────────────
audio.addEventListener('timeupdate', () => {
  if (currentId) { updateTimeDisplay(currentId); updateProgress(currentId); }
});

audio.addEventListener('ended', () => {
  if (!currentId) return;
  isPlaying = false;
  setIcon(currentId, false);
  const bar = document.getElementById('prog-' + currentId);
  if (bar) bar.style.width = '0%';
  updateTimeDisplay(currentId);
});

audio.addEventListener('loadedmetadata', () => {
  if (currentId) updateTimeDisplay(currentId);
});

// ── PLAY BUTTONS ──────────────────────────────────────────
document.querySelectorAll('.play-btn').forEach(btn => {
  btn.addEventListener('click', () => togglePlay(btn.dataset.id));
});

// ── SEEK ──────────────────────────────────────────────────
document.querySelectorAll('.progress-container').forEach(container => {
  container.addEventListener('click', e => {
    const id = container.dataset.id;
    if (id !== currentId || !audio.duration) return;
    const rect = container.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
  });
});

// ── VIEW / TAB SWITCHING ──────────────────────────────────
const views = document.querySelectorAll('.interview-view');

function showView(targetId) {
  // Hide all views
  views.forEach(v => v.classList.remove('active'));

  // Show target
  const target = document.getElementById('view-' + targetId);
  if (target) {
    target.classList.add('active');
    // Scroll page-wrapper back to the very top
    const wrapper = document.querySelector('.page-wrapper');
    wrapper ? wrapper.scrollTo({ top: 0, behavior: 'smooth' }) : window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Sync ALL tab sets: each view has its own nav
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.target === targetId);
  });
}

// Attach click to every tab (all four navs)
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => showView(tab.dataset.target));
});

// ── INIT ──────────────────────────────────────────────────
loadTrack('jana');
