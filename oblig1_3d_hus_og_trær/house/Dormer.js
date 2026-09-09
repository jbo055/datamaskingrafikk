'use strict';

export function drawDormer(app, elapsed) {
    const halfWidth = 1;
    const roofRise = 0.6;
    const overhang = 0.15;

    const angleRadians = Math.atan2(roofRise, halfWidth);
    const angleDegrees = angleRadians * 180 / Math.PI;

    const slopeLength = Math.sqrt(
        halfWidth * halfWidth + roofRise * roofRise
    );

    const roofLength = slopeLength + overhang;

    // Mønet ligger over døren ved y = 3.2.
    const centerX =
        Math.cos(angleRadians) * roofLength / 2;

    const centerY =
        3.2 - Math.sin(angleRadians) * roofLength / 2;

    // To takflater som heller mot venstre og høyre.
    for (const side of [-1, 1]) {
        const roofMatrix = new Matrix4();

        roofMatrix.translate(side * centerX, centerY, 3.6);
        roofMatrix.rotate(-side * angleDegrees, 0, 0, 1);
        roofMatrix.scale(roofLength / 2, 0.075, 0.8);

        app.roofCube.draw(
            app.uniformShaderInfo, elapsed, roofMatrix
        );
    }

    // Hvite forkantbord langs takets skrå kanter.
    for (const side of [-1, 1]) {
        const trimMatrix = new Matrix4();

        trimMatrix.translate(side * centerX, centerY, 4.42);
        trimMatrix.rotate(-side * angleDegrees, 0, 0, 1);
        trimMatrix.scale(roofLength / 2, 0.1, 0.04);

        app.frameCube.draw(
            app.uniformShaderInfo, elapsed, trimMatrix
        );
    }
}