document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("todayDay").textContent =
        "Montag";

    document.getElementById("todayTraining").textContent =
        "Core";

    document.getElementById("exerciseContainer").innerHTML =
        `
            <div>
                ☐ Copenhagen Short Lever
            </div>

            <div>
                ☐ Side Plank mit Abduktion
            </div>
        `;

    document.getElementById("kneeContainer").innerHTML =
        `
            <div>
                ☐ Einbeinstand
            </div>

            <div>
                ☐ Supported TKE
            </div>
        `;

});
