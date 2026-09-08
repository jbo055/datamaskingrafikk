'use strict';

export function drawDoor(app, elapsed) {
    // Dør: 1.1 bred, 2.1 høy og 0.1 tykk.
    // Endrer vinkelen mens F eller G holdes inne.
    if (app.currentlyPressedKeys['KeyF']) {
        app.doorAngle += 90 * elapsed;
    }

    if (app.currentlyPressedKeys['KeyG']) {
        app.doorAngle -= 90 * elapsed;
    }

    // Holder vinkelen mellom 0 og 90 grader.
    app.doorAngle = Math.max(0, Math.min(90, app.doorAngle));

    const doorMatrix = new Matrix4();

    // Plasser hengslet ved dørens venstre kant.
    doorMatrix.translate(-0.55, 1.3, 2.9);

    // Roter rundt Y-aksen gjennom hengslet.
    doorMatrix.rotate(-app.doorAngle, 0, 1, 0);

    // Flytt kubens sentrum en halv dørbredde fra hengslet.
    doorMatrix.translate(0.55, 0, 0);

    // Gi døren riktig størrelse.
    doorMatrix.scale(0.55, 1.05, 0.05);

    app.door.draw(app.uniformShaderInfo, elapsed, doorMatrix);

    // Venstre karm.
    const leftFrameMatrix = new Matrix4();
    leftFrameMatrix.translate(-0.575, 1.3, 2.9);
    leftFrameMatrix.scale(0.025, 1.1, 0.15);

    app.frameCube.draw(
        app.uniformShaderInfo, elapsed, leftFrameMatrix
    );

    // Høyre karm.
    const rightFrameMatrix = new Matrix4();
    rightFrameMatrix.translate(0.575, 1.3, 2.9);
    rightFrameMatrix.scale(0.025, 1.1, 0.15);

    app.frameCube.draw(
        app.uniformShaderInfo, elapsed, rightFrameMatrix
    );

    // Øvre karm.
    const topFrameMatrix = new Matrix4();
    topFrameMatrix.translate(0, 2.375, 2.9);
    topFrameMatrix.scale(0.55, 0.025, 0.15);

    app.frameCube.draw(
        app.uniformShaderInfo, elapsed, topFrameMatrix
    );

    // Terskel.
    const thresholdMatrix = new Matrix4();
    thresholdMatrix.translate(0, 0.225, 2.9);
    thresholdMatrix.scale(0.55, 0.025, 0.15);

    app.frameCube.draw(
        app.uniformShaderInfo, elapsed, thresholdMatrix
    );
}
