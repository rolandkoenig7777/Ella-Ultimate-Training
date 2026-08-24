"use strict";

let exercisesData = {};

const DAY_NAMES = [
  "Sonntag", "Montag", "Dienstag", "Mittwoch",
  "Donnerstag", "Freitag", "Samstag"
];

const TRAINING_BY_DAY = {
  0: { key: "unterkoerper", title: "Unterkörper" },
  1: { key: "core", title: "Core" },
  2: { key: "oberkoerper", title: "Oberkörper" },
  3: { key: "unterkoerper", title: "Unterkörper" },
  4: { key: "core", title: "Core" },
  5: { key: "oberkoerper", title: "Oberkörper" },
  6: { key: "unterkoerper", title: "Unterkörper" }
};

function localDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function checkStorageKey() {
  return `ella_checks_${localDateKey()}`;
}

function safeId(value) {
  return value.toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function savedChecks() {
  try {
    return JSON.parse(localStorage.getItem(checkStorageKey()) || "{}");
  } catch (error) {
    return {};
  }
}

async function loadExercises() {
  const response = await fetch(`exercises.json?v=${Date.now()}`, {
    cache: "no-store"
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} beim Laden von exercises.json`);
  }
  exercisesData = await response.json();
}

function videoButton(url) {
  if (!url || typeof url !== "string" || !url.startsWith("http")) return "";
  return `<a class="video-link" href="${url}" target="_blank" rel="noopener noreferrer">🎥 Video ansehen</a>`;
}

function exerciseElement(exercise, group) {
  const id = `${group}-${safeId(exercise.name)}`;
  const checks = savedChecks();
  const div = document.createElement("div");
  div.className = "exercise";
  div.innerHTML = `
    <label for="${id}">
      <input id="${id}" type="checkbox" class="exerciseCheck" data-id="${id}" ${checks[id] ? "checked" : ""}>
      <strong>${exercise.name}</strong>
    </label>
    <div class="exercise-details">${exercise.sets || ""}</div>
    ${videoButton(exercise.video)}
  `;
  return div;
}

function renderDashboard() {
  const day = new Date().getDay();
  const plan = TRAINING_BY_DAY[day];
  document.getElementById("todayDay").textContent = DAY_NAMES[day];
  document.getElementById("todayTraining").textContent = plan.title;
  document.getElementById("points").textContent = localStorage.getItem("ella_points") || "0";
  document.getElementById("streak").textContent = localStorage.getItem("ella_streak") || "0";
}

function renderExercises() {
  const plan = TRAINING_BY_DAY[new Date().getDay()];
  const container = document.getElementById("exerciseContainer");
  const list = exercisesData[plan.key];
  container.innerHTML = "";
  if (!Array.isArray(list) || list.length === 0) {
    container.innerHTML = `<p>Für ${plan.title} wurden keine Übungen gefunden.</p>`;
    return;
  }
  list.forEach(item => container.appendChild(exerciseElement(item, plan.key)));
}

function renderKneeRoutine() {
  const container = document.getElementById("kneeContainer");
  const list = exercisesData.knieRoutine;
  container.innerHTML = "";
  if (!Array.isArray(list) || list.length === 0) {
    container.innerHTML = "<p>Die tägliche Knie-Routine wurde nicht gefunden.</p>";
    return;
  }
  list.forEach(item => container.appendChild(exerciseElement(item, "knie")));
}

function saveChecks() {
  const checks = {};
  document.querySelectorAll(".exerciseCheck").forEach(box => {
    checks[box.dataset.id] = box.checked;
  });
  localStorage.setItem(checkStorageKey(), JSON.stringify(checks));
}

function updateProgress() {
  const all = [...document.querySelectorAll(".exerciseCheck")];
  const done = all.filter(box => box.checked).length;
  const percent = all.length ? Math.round(done / all.length * 100) : 0;
  document.getElementById("progressBar").style.width = `${percent}%`;
  document.getElementById("progressLabel").textContent = `${percent}%`;
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem("ella_history") || "[]");
  } catch (error) {
    return [];
  }
}

function renderHistory() {
  const container = document.getElementById("historyContainer");
  const history = getHistory();
  container.innerHTML = history.length
    ? history.slice(0, 30).map(entry => `<div class="history-entry">✅ ${entry.date} – ${entry.training}</div>`).join("")
    : "<p>Noch kein Training abgeschlossen.</p>";
}

function completeTraining() {
  const day = new Date().getDay();
  const today = localDateKey();
  const history = getHistory();
  const alreadyDone = history.some(entry => entry.isoDate === today);

  if (!alreadyDone) {
    history.unshift({
      isoDate: today,
      date: new Date().toLocaleDateString("de-AT"),
      training: `${TRAINING_BY_DAY[day].title} + Knie-Routine`
    });
    localStorage.setItem("ella_history", JSON.stringify(history));
    localStorage.setItem("ella_points", String(Number(localStorage.getItem("ella_points") || 0) + 10));
    localStorage.setItem("ella_streak", String(Number(localStorage.getItem("ella_streak") || 0) + 1));
  }

  renderDashboard();
  renderHistory();
  alert(alreadyDone ? "Das heutige Training wurde bereits gespeichert." : "Training gespeichert ✅");
}

async function startApp() {
  try {
    await loadExercises();
    renderDashboard();
    renderExercises();
    renderKneeRoutine();
    renderHistory();
    updateProgress();

    document.addEventListener("change", event => {
      if (event.target.classList.contains("exerciseCheck")) {
        saveChecks();
        updateProgress();
      }
    });
  } catch (error) {
    console.error(error);
    document.getElementById("exerciseContainer").innerHTML =
      "<p>Die Übungen konnten nicht geladen werden. Bitte exercises.json prüfen.</p>";
    document.getElementById("kneeContainer").innerHTML =
      "<p>Die Knie-Routine konnte nicht geladen werden.</p>";
  }
}

document.addEventListener("DOMContentLoaded", startApp);
window.completeTraining = completeTraining;
