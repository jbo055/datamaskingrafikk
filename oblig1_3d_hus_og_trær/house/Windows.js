'use strict';

export function drawWindowFrame(
    app, elapsed, x, y, z, width, height, rotation = 0
) {
    const frameWidth = 0.08;
    const frameDepth = 0.3;

    // Venstre og høyre karm.
    for (const side of [-1, 1]) {
        const sideMatrix = new Matrix4();

        sideMatrix.translate(x, y, z);
        sideMatrix.rotate(rotation, 0, 1, 0);

        sideMatrix.translate(
            side * (width / 2 - frameWidth / 2),
            0,
            0
        );

        sideMatrix.scale(
            frameWidth / 2,
            height / 2,
            frameDepth / 2
        );

        app.frameCube.draw(
            app.uniformShaderInfo, elapsed, sideMatrix
        );
    }

    // Nedre og øvre karm.
    for (const side of [-1, 1]) {
        const horizontalMatrix = new Matrix4();

        horizontalMatrix.translate(x, y, z);
        horizontalMatrix.rotate(rotation, 0, 1, 0);

        horizontalMatrix.translate(
            0,
            side * (height / 2 - frameWidth / 2),
            0
        );

        horizontalMatrix.scale(
            (width - 2 * frameWidth) / 2,
            frameWidth / 2,
            frameDepth / 2
        );

        app.frameCube.draw(
            app.uniformShaderInfo, elapsed, horizontalMatrix
        );
    }
}