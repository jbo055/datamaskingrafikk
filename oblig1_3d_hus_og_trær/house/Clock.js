'use strict';

/**
 * Analog klokke på frontveggen, mellom ytterdøren og høyre vindu.
 * Frontveggens utside ligger ved z = 3.0.
 *
 * Alt er 2D-flater, så de legges et lite stykke foran hverandre i z.
 * Ligger to flater på nøyaktig samme z, vet ikke dybdetesten hvilken som
 * er foran, og de flimrer om hverandre ("z-fighting").
 */
const CENTER_X = 1.0;
const CENTER_Y = 1.7;
const RADIUS = 0.3;

const Z_FACE = 3.02;
const Z_TICKS = 3.03;
const Z_HOUR_HAND = 3.04;
const Z_MINUTE_HAND = 3.05;
const Z_CENTER_DOT = 3.06;

/**
 * Tegner en viser som peker rett opp (kl. 12) før rotasjonen.
 * Samme triks som på døren: roter rundt klokkas sentrum, og flytt så
 * viseren en halv viserlengde ut fra sentrum.
 */
function drawHand(app, elapsed, angleDegrees, length, width, z) {
    const handMatrix = new Matrix4();

    handMatrix.translate(CENTER_X, CENTER_Y, z);

    // Minus fordi klokka går med klokka: negativ rotasjon om Z
    // er med klokka sett forfra.
    handMatrix.rotate(-angleDegrees, 0, 0, 1);

    handMatrix.translate(0, length / 2, 0);
    handMatrix.scale(width / 2, length / 2, 1);

    app.clockHand.draw(app.uniformShaderInfo, elapsed, handMatrix);
}

export function drawClock(app, elapsed) {
    // Svart kant: en litt større sirkel bak den hvite skiven.
    const rimMatrix = new Matrix4();
    rimMatrix.translate(CENTER_X, CENTER_Y, Z_FACE - 0.005);
    rimMatrix.scale(RADIUS * 1.08, RADIUS * 1.08, 1);

    app.clockRim.draw(app.uniformShaderInfo, elapsed, rimMatrix);

    // Hvit urskive.
    const faceMatrix = new Matrix4();
    faceMatrix.translate(CENTER_X, CENTER_Y, Z_FACE);
    faceMatrix.scale(RADIUS, RADIUS, 1);

    app.clockFace.draw(app.uniformShaderInfo, elapsed, faceMatrix);

    // 12 timemerker: samme rektangel, bare rotert 30 grader hver gang.
    for (let hour = 0; hour < 12; hour++) {
        const tickMatrix = new Matrix4();

        tickMatrix.translate(CENTER_X, CENTER_Y, Z_TICKS);
        tickMatrix.rotate(-hour * 30, 0, 0, 1);
        tickMatrix.translate(0, RADIUS * 0.85, 0);
        tickMatrix.scale(0.012, 0.035, 1);

        app.clockHand.draw(app.uniformShaderInfo, elapsed, tickMatrix);
    }

    // Virkelig tid. Hentes hver frame, så viserne alltid viser riktig.
    const now = new Date();
    const minutes = now.getMinutes() + now.getSeconds() / 60;
    const hours = now.getHours() % 12 + minutes / 60;

    // 60 minutter = 360 grader, altså 6 grader per minutt.
    // 12 timer = 360 grader, altså 30 grader per time.
    drawHand(app, elapsed, minutes * 6, RADIUS * 0.8, 0.03, Z_MINUTE_HAND);
    drawHand(app, elapsed, hours * 30, RADIUS * 0.5, 0.045, Z_HOUR_HAND);

    // Liten prikk i midten, over viserne.
    const dotMatrix = new Matrix4();
    dotMatrix.translate(CENTER_X, CENTER_Y, Z_CENTER_DOT);
    dotMatrix.scale(0.025, 0.025, 1);

    app.clockRim.draw(app.uniformShaderInfo, elapsed, dotMatrix);
}
