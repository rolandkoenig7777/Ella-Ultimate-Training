'use strict';

let exercisesData = {};

const DAY_NAMES = [
  'Sonntag',
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag'
];

const TRAINING_BY_DAY = {
  0: { key: 'unterkoerper', title: 'Unterkörper' },
  1: { key: 'core', title: 'Core' },
  2: { key: 'oberkoerper', title: 'Oberkörper' },
  3: { key: 'unterkoerper', title: 'Unterkörper' },
  4: { key: 'core', title: 'Core' },
  5: { key: 'oberkoerper', title: 'Oberkörper' },
  6: { key: 'unterkoerper', title: 'Unterkörper' }
};

function getLocalDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCheckStorageKey() {
  return `ella_checks_${getLocalDateKey()}`;
}

function makeSafeId(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getSavedChecks() {
  try {
    return JSON.parse(localStorage.getItem(getCheckStorageKey()) || '{}');
  } catch (error) {
    console.error('Gespeicherte Checkboxen konnten nicht gelesen werden:', error);
    return {};
  }
}

async function loadExercises() {
  const response = await fetch(`exercises.json?v=${Date.now()}`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`exercises.json konnte nicht geladen werden: HTTP ${response.status}`);
  }

  exercisesData = await response.json();
}

function createVideoButton(videoUrl) {
  if (!videoUrl || typeof videoUrl !== 'string') {
    return '';
  }

  if (!videoUrl.startsWith('http://') && !videoUrl.startsWith('https://')) {
    return '';
  }

  return `
    <a class="video-link"
       href="${videoUrl}"
       target="_blank"
       rel="noopener noreferrer">
      🎥 Video ansehen
    </a>
  `;
}

function createExerciseElement(exercise, groupKey) {
  const exerciseId = `${groupKey}-${makeSafeId(exercise.name)}`;
  const savedChecks = getSavedChecks();
  const wrapper = document.createElement('div');

  wrapper.className = 'exercise';
  wrapper.innerHTML = `
    <label for="${exerciseId}">
      <input
        id="${exerciseId}"
        type="checkbox"
        class="exerciseCheck"
        data-id="${exerciseId}"
        ${savedChecks[exerciseId] ? 'checked' : ''}
      >
      <strong>${exercise.name}</strong>
    </label>
    <div class="exercise-details">${exercise.sets || ''}</div>
    ${createVideoButton(exercise.video)}
  `;

  return wrapper;
}

function renderDashboard() {
  const currentDay = new Date().getDay();
  const plan = TRAINING_BY_DAY[currentDay];

  document.getElementById('todayDay').textContent = DAY_NAMES[currentDay];
  document.getElementById('todayTraining').textContent = plan.title;
  document.getElementById('points').textContent =
    localStorage.getItem('ella_points') || '0';
  document.getElementById('streak').textContent =
    localStorage.getItem('ella_streak') || '0';
}

function renderExercises() {
  const currentDay = new Date().getDay();
  const plan = TRAINING_BY_DAY[currentDay];
  const container = document.getElementById('exerciseContainer');
  const exercises = exercisesData[plan.key];

  container.innerHTML = '';

  if (!Array.isArray(exercises) || exercises.length === 0) {
    container.innerHTML = `<p>Für ${plan.title} wurden keine Übungen gefunden.</p>`;
    return;
  }

  exercises.forEach((exercise) => {
    container.appendChild(createExerciseElement(exercise, plan.key));
  });
}

function renderKneeRoutine() {
  const container = document.getElementById('kneeContainer');
  const exercises = exercisesData.knieRoutine;

  container.innerHTML = '';

  if (!Array.isArray(exercises) || exercises.length === 0) {
    container.innerHTML = '<p>Die tägliche Knie-Routine wurde nicht gefunden.</p>';
    return;
  }

  exercises.forEach((exercise) => {
    container.appendChild(createExerciseElement(exercise, 'knie')); 
  });
}

function saveCheckboxes() {
  const savedChecks = {};

  document.querySelectorAll('.exerciseCheck').forEach((checkbox) => {
    savedChecks[checkbox.dataset.id] = checkbox.checked;
  });

  localStorage.setItem(getCheckStorageKey(), JSON.stringify(savedChecks));
}

function updateProgress() {
  const allCheckboxes = Array.from(
    document.querySelectorAll('.exerciseCheck')
  );
  const completedCount = allCheckboxes.filter(
    (checkbox) => checkbox.checked
  ).length;
  const percentage = allCheckboxes.length
    ? Math.round((completedCount / allCheckboxes.length) * 100)
    : 0;

  const progressBar = document.getElementById('progressBar');
  const progressLabel = document.getElementById('progressLabel');

  progressBar.style.width = `${percentage}%`;
  progressLabel.textContent = `${percentage}%`;
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem('ella_history') || '[]');
  } catch (error) {
    console.error('Historie konnte nicht gelesen werden:', error);
    return [];
  }
}

function renderHistory() {
  const container = document.getElementById('historyContainer');
  const history = getHistory();

  if (history.length === 0) {
    container.innerHTML = '<p>Noch kein Training abgeschlossen.</p>';
    return;
  }

  container.innerHTML = history
    .slice(0, 30)
    .map(
      (entry) =>
        `<div class="history-entry">✅ ${entry.date} – ${entry.training}</div>`
    )
    .join('');
}

function completeTraining() {
  const currentDay = new Date().getDay();
  const plan = TRAINING_BY_DAY[currentDay];
  const localDate = getLocalDateKey();
  const history = getHistory();
  const alreadyCompleted = history.some(
    (entry) => entry.isoDate === localDate
  );

  if (!alreadyCompleted) {
    history.unshift({
      isoDate: localDate,
      date: new Date().toLocaleDateString('de-AT'),
      training: `${plan.title} + Knie-Routine`
    });

    const points = Number(localStorage.getItem('ella_points') || 0) + 10;
    const streak = Number(localStorage.getItem('ella_streak') || 0) + 1;

    localStorage.setItem('ella_history', JSON.stringify(history));
    localStorage.setItem('ella_points', String(points));
    localStorage.setItem('ella_streak', String(streak));
  }

  renderDashboard();
  renderHistory();

  alert(
    alreadyCompleted
      ? 'Das heutige Training wurde bereits gespeichert.'
      : 'Training gespeichert ✅'
  );
}

async function startApp() {
  try {
    await loadExercises();
    renderDashboard();
    renderExercises();
    renderKneeRoutine();
    renderHistory();
    updateProgress();

    document.addEventListener('change', (event) => {
      if (event.target.classList.contains('exerciseCheck')) {
        saveCheckboxes();
        updateProgress();
      }
    });
  } catch (error) {
    console.error('Startfehler:', error);

    document.getElementById('exerciseContainer').innerHTML =
      '<p>Die Übungen konnten nicht geladen werden. Bitte exercises.json prüfen.</p>';
    document.getElementById('kneeContainer').innerHTML =
      '<p>Die Knie-Routine konnte nicht geladen werden.</p>';
  }
}

document.addEventListener('DOMContentLoaded', startApp);
window.completeTraining = completeTraining;
