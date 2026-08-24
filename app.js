let exercisesData = {};

const dayNames = [
    "Sonntag",
    "Montag",
    "Dienstag",
    "Mittwoch",
    "Donnerstag",
    "Freitag",
    "Samstag"
];

const dayMap = {
    1: "montag",
    2: "dienstag",
    3: "mittwoch",
    4: "donnerstag",
    5: "freitag",
    6: "samstag",
    0: "sonntag"
};

document.addEventListener("DOMContentLoaded", async () => {

    await loadExercises();

    renderDashboard();
    renderExercises();
    renderKneeRoutine();
    renderHistory();

    document.addEventListener(
        "change",
        updateProgress
    );

    updateProgress();

});

async function loadExercises() {

    try {

        const response =
            await fetch("exercises.json");

        exercisesData =
            await response.json();

    } catch (error) {

        console.error(error);

        document.getElementById(
            "exerciseContainer"
        ).innerHTML =
            "<p>Fehler beim Laden der Übungen.</p>";

    }
}

function renderDashboard() {

    const day =
        new Date().getDay();

    document.getElementById(
        "todayDay"
    ).textContent =
        dayNames[day];

}

function renderExercises() {

    const today =
        dayMap[new Date().getDay()];

    const container =
        document.getElementById(
            "exerciseContainer"
        );

    container.innerHTML = "";

    if (
        !exercisesData.wochenplan ||
        !exercisesData.wochenplan[today]
    ) {

        container.innerHTML =
            "<p>Kein Training gefunden.</p>";

        return;
    }

    const training =
        exercisesData.wochenplan[today];

    document.getElementById(
        "todayTraining"
    ).textContent =
        training.schwerpunkt;

    training.uebungen.forEach(
        exercise => {

            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "exercise";

            div.innerHTML = `
                <label>
                    <input
                        type="checkbox"
                        class="exerciseCheck">

                    <strong>
                        ${exercise.name}
                    </strong>
                </label>

                <div>
                    ${exercise.saetze}
                    Sätze ×
                    ${exercise.wiederholungen}
                </div>

                ${
                    exercise.video
                    ? `
                    ${exercise.video}
                       🎥 Video ansehen
                    </a>
                    `
                    : ""
                }
            `;

            container.appendChild(div);

        });

}

function renderKneeRoutine() {

    const container =
        document.getElementById(
            "kneeContainer"
        );

    container.innerHTML = "";

    if (
        !exercisesData.taeglicheKnieRoutine
    ) {
        return;
    }

    exercisesData.taeglicheKnieRoutine
        .forEach(exercise => {

            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "exercise";

            div.innerHTML = `
                <label>
                    <input
                        type="checkbox"
                        class="exerciseCheck">

                    <strong>
                        ${exercise.name}
                    </strong>
                </label>

                <div>
                    ${exercise.saetze}
                    Sätze ×
                    ${exercise.wiederholungen}
                </div>

                ${
                    exercise.video
                    ? `
                    ${exercise.video}
                       🎥 Video ansehen
                    </a>
                    `
                    : ""
                }
            `;

            container.appendChild(div);

        });

}

function updateProgress() {

    const all =
        document.querySelectorAll(
            ".exerciseCheck"
        );

    const checked =
        document.querySelectorAll(
            ".exerciseCheck:checked"
        );

    if (all.length === 0)
        return;

    const percent =
        Math.round(
            checked.length /
            all.length * 100
        );

    const bar =
        document.getElementById(
            "progressBar"
        );

    const label =
        document.getElementById(
            "progressLabel"
        );

    if (bar) {
        bar.style.width =
            percent + "%";
    }

    if (label) {
        label.textContent =
            percent + "%";
    }
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
            document.getElementById(
                "todayTraining"
            ).textContent
    });

    localStorage.setItem(
        "history",
        JSON.stringify(history)
    );

    renderHistory();

    alert(
        "Training gespeichert ✅"
    );

}

function renderHistory() {

    const container =
        document.getElementById(
            "historyContainer"
        );

    if (!container)
        return;

    const history =
        JSON.parse(
            localStorage.getItem(
                "history"
            ) || "[]"
        );

    container.innerHTML =
        history
            .slice(0, 20)
            .map(item => `
                <div>
                    ✅ ${item.date}
                    - ${item.training}
                </div>
            `)
            .join("");

}
