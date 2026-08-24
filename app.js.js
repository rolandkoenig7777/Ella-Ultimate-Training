let exercisesData = {};

const dayNames = [
  "Sonntag", "Montag", "Dienstag", "Mittwoch",
  "Donnerstag", "Freitag", "Samstag"
];

const trainingByDay = {
  0: { key: "unterkoerper", title: "Unterkörper" },
  1: { key: "core", title: "Core" },
  2: { key: "oberkoerper", title: "Oberkörper" },
  3: { key: "unterkoerper", title: "Unterkörper" },
  4: { key: "core", title: "Core" },
  5: { key: "oberkoerper", title: "Oberkörper" },
  6: { key: "unterkoerper", title: "Unterkörper" }
};

const dateKey = () => new Date().toISOString().slice(0, 10);
const stateKey = () => `ella_checks_${dateKey()}`;

function safeId(value) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function loadExercises() {
  const response = await fetch(`exercises.json?v=2`);
  if (!response.ok) throw new Error(`exercises.json: HTTP ${response.status}`);
  exercisesData = await response.json();
}

function createExercise(exercise, group) {
  const id = `${group}-${safeId(exercise.name)}`;
  const saved = JSON.parse(localStorage.getItem(stateKey()) || "{}");
  const div = document.createElement("div");
  div.className = "exercise";

  const video = exercise.video
    ? `<a class="video-link" href="${exercise.video}" target="_blank" rel="noopener noreferrer">🎥 Video ansehen</a>`
    : "";

  div.innerHTML = `
    <label for="${id}">
      <input id="${id}" type="checkbox" class="exerciseCheck" data-id="${id}" ${saved[id] ? "checked" : ""}>
      <strong>${exercise.name}</strong>
    </label>
    <div class="exercise-details">${exercise.sets || ""}</div>
    ${video}
  `;
  return div;
}

function renderDashboard() {
  const day = new Date().getDay();
  document.getElementById("todayDay").textContent = dayNames[day];
  document.getElementById("todayTraining").textContent = trainingByDay[day].title;
  document.getElementById("points").textContent = localStorage.getItem("ella_points") || "0";
  document.getElementById("streak").textContent = localStorage.getItem("ella_streak") || "0";
}

function renderExercises() {
  const plan = trainingByDay[new Date().getDay()];
  const container = document.getElementById("exerciseContainer");
  container.innerHTML = "";
  const items = exercisesData[plan.key];
  if (!Array.isArray(items)) {
    container.innerHTML = `<p>Für ${plan.title} wurden keine Übungen gefunden.</p>`;
    return;
  }
  items.forEach(exercise => container.appendChild(createExercise(exercise, plan.key)));
}

function renderKneeRoutine() {
  const container = document.getElementById("kneeContainer");
  container.innerHTML = "";
  const items = exercisesData.knieRoutine;
  if (!Array.isArray(items)) {
    container.innerHTML = "<p>Die tägliche Knie-Routine wurde nicht gefunden.</p>";
    return;
  }
  items.forEach(exercise => container.appendChild(createExercise(exercise, "knie")));
}

function saveChecks() {
  const saved = {};
  document.querySelectorAll(".exerciseCheck").forEach(box => {
    saved[box.dataset.id] = box.checked;
  });
  localStorage.setItem(stateKey(), JSON.stringify(saved));
}

function updateProgress() {
  const all = [...document.querySelectorAll(".exerciseCheck")];
  const done = all.filter(box => box.checked).length;
  const percent = all.length ? Math.round(done / all.length * 100) : 0;
  document.getElementById("progressBar").style.width = `${percent}%`;
  document.getElementById("progressLabel").textContent = `${percent}%`;
}

function renderHistory() {
  const container = document.getElementById("historyContainer");
  const history = JSON.parse(localStorage.getItem("ella_history") || "[]");
  container.innerHTML = history.length
    ? history.slice(0, 30).map(item => `<div class="history-entry">✅ ${item.date} – ${item.training}</div>`).join("")
    : "<p>Noch kein Training abgeschlossen.</p>";
}

function completeTraining() {
  const day = new Date().getDay();
  const today = dateKey();
  const history = JSON.parse(localStorage.getItem("ella_history") || "[]");

  if (!history.some(item => item.isoDate === today)) {
    history.unshift({
      isoDate: today,
      date: new Date().toLocaleDateString("de-AT"),
      training: `${trainingByDay[day].title} + Knie-Routine`
    });
    localStorage.setItem("ella_history", JSON.stringify(history));
    localStorage.setItem("ella_points", String(Number(localStorage.getItem("ella_points") || 0) + 10));
    localStorage.setItem("ella_streak", String(Number(localStorage.getItem("ella_streak") || 0) + 1));
  }

  renderDashboard();
  renderHistory();
  alert("Training gespeichert ✅");
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
  }
}

document.addEventListener("DOMContentLoaded", startApp);
window.completeTraining = completeTraining;
