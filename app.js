let exercisesData = {};

const trainingByDay = {
    0: "unterkoerper",
    1: "core",
    2: "oberkoerper",
    3: "unterkoerper",
    4: "core",
    5: "oberkoerper",
    6: "unterkoerper"
};

document.addEventListener("DOMContentLoaded", async () => {

    await loadExercises();

    renderDashboard();
    renderExercises();
    renderKneeRoutine();
    renderHistory();

    updateProgress();

});

async function loadExercises() {
    try {
        const response = await fetch("exercises.json");
        exercisesData = await response.json();
    } catch (error) {
        console.error("Fehler beim Laden von exercises.json", error);

        document.getElementById("exerciseContainer").innerHTML =
            "<p>Fehler beim Laden der Übungen.</p>";
    }
}

function getTodayTraining() {
    return trainingByDay[new Date().getDay()];
}

function renderDashboard() {

    const dayNames = [
        "Sonntag",
        "Montag",
        "Dienstag",
        "Mittwoch",
        "Donnerstag",
        "Freitag",
        "Samstag"
    ];

    document.getElementById("todayDay").textContent =
        dayNames[new Date().getDay()];

    document.getElementById("todayTraining").textContent =
        getTodayTraining();

    loadStats();
}

function renderExercises() {

    const training = getTodayTraining();

    const container =
        document.getElementById("exerciseContainer");

    container.innerHTML = "";

    if (!exercisesData[training]) {
        container.innerHTML =
            "<p>Keine Übungen gefunden.</p>";
        return;
    }

    exercisesData[training].forEach(exercise => {

        const lastWeight =
            localStorage.getItem(
                "weight_" + exercise.name
            ) || "-";

        const record =
            localStorage.getItem(
                "record_" + exercise.name
            ) || "-";

        const div =
            document.createElement("div");

        div.className = "exercise";

        div.innerHTML = `
            <label>
                <input
                    type="checkbox"
                    class="exerciseCheck">

                <strong>${exercise.name}</strong>
            </label>

            <div>${exercise.sets}</div>

            <div>
                Letztes Gewicht:
                ${lastWeight}
            </div>

            <div>
                Rekord:
                ${record}
            </div>

            <input
                type="number"
                placeholder="kg"
                onchange="saveWeight(
                    '${exercise.name}',
                    this.value
                )">

            ${
                exercise.video
                ?
                `<div>
                    ${exercise.video}
                    🎥 Video
                    </a>
                </div>`
                :
                ""
            }
        `;

        container.appendChild(div);
    });
}

function renderKneeRoutine() {

    const container =
        document.getElementById("kneeContainer");

    container.innerHTML = "";

    if (!exercisesData.knieRoutine)
        return;

    exercisesData.knieRoutine.forEach(item => {

        const div =
            document.createElement("div");

        div.className = "exercise";

        div.innerHTML = `
            <label>
                <input
                    type="checkbox"
                    class="exerciseCheck">

                ${item.name}
            </label>

            <div>${item.sets}</div>

            ${
                item.video
                ?
                `<div>
                    ${item.video}
                    🎥 Video
                    </a>
                </div>`
                :
                ""
            }
        `;

        container.appendChild(div);
    });
}

function saveWeight(
    exercise,
    weight
) {

    localStorage.setItem(
        "weight_" + exercise,
        weight + " kg"
    );

    const currentRecord =
        parseFloat(
            localStorage.getItem(
                "record_" + exercise
            ) || 0
        );

    if (
        parseFloat(weight || 0)
        > currentRecord
    ) {

        localStorage.setItem(
            "record_" + exercise,
            weight + " kg"
        );
    }
}

function updateProgress() {

    const checks =
        document.querySelectorAll(
            ".exerciseCheck"
        );

    const done =
        document.querySelectorAll(
            ".exerciseCheck:checked"
        );

    if (checks.length === 0)
        return;

    const percent =
        Math.round(
            done.length /
            checks.length * 100
        );

    document.getElementById(
        "progressBar"
    ).style.width =
        percent + "%";

    document.getElementById(
        "progressLabel"
    ).textContent =
        percent + "%";
}

function completeTraining() {

    const history =
        JSON.parse(
            localStorage.getItem(
                "history"
            ) || "[]"
        );

    history.unshift({
        date:
            new Date()
            .toLocaleDateString(
                "de-AT"
            ),
        training:
            getTodayTraining()
    });

    localStorage.setItem(
        "history",
        JSON.stringify(history)
    );

    const points =
        Number(
            localStorage.getItem(
                "points"
            ) || 0
        ) + 10;

    localStorage.setItem(
        "points",
        points
    );

    const streak =
        Number(
            localStorage.getItem(
                "streak"
            ) || 0
        ) + 1;

    localStorage.setItem(
        "streak",
        streak
    );

    renderHistory();
    loadStats();

    alert(
        "Training gespeichert ✅"
    );
}

function renderHistory() {

    const container =
        document.getElementById(
            "historyContainer"
        );

    const history =
        JSON.parse(
            localStorage.getItem(
                "history"
            ) || "[]"
        );

    container.innerHTML =
        history
            .slice(0, 30)
            .map(item => `
                <div class="history-entry">
                    ✅ ${item.date}
                    - ${item.training}
                </div>
            `)
            .join("");
}

function loadStats() {

    document.getElementById(
        "points"
    ).textContent =
        localStorage.getItem(
            "points"
        ) || 0;

    document.getElementById(
        "streak"
    ).textContent =
        localStorage.getItem(
            "streak"
        ) || 0;
}

document.addEventListener(
    "change",
    updateProgress
);