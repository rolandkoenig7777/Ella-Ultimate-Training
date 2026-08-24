alert("app.js wurde geladen");
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

    document.addEventListener(
        "change",
        updateProgress
    );

    updateProgress();
});

async function loadExercises() {

    const response =
        await fetch("exercises.json");

    exercisesData =
        await response.json();
}

function getTodayTraining() {

    const day =
        new Date().getDay();

    return trainingByDay[day];
}

function renderDashboard() {

    const day =
        new Date().getDay();

    document.getElementById(
        "todayDay"
    ).textContent = dayNames[day];

    document.getElementById(
        "todayTraining"
    ).textContent =
        getTrainingTitle(
            getTodayTraining()
        );

    loadStats();
}

function getTrainingTitle(type) {

    const titles = {
        core: "Core",
        oberkoerper: "Oberkörper",
        unterkoerper: "Unterkörper"
    };

    return titles[type];
}

function renderExercises() {

    const training =
        getTodayTraining();

    const container =
        document.getElementById(
            "exerciseContainer"
        );

    container.innerHTML = "";

    if (!exercisesData[training])
        return;

    exercisesData[training]
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
                    ${exercise.sets}
                </div>

                ${
                    exercise.video
                    ?
                    `
                    ${exercise.video}
                    `
                    :
                  
