'use strict';

import { Glass } from '../egneShapes/Glass.js';

let glass;

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

export function drawWindowGlass(app, elapsed) {
    // Opprettes bare første gang.
    if (!glass) {
        glass = new Glass(app);
        glass.initBuffers();
    }

    // Målene er åpningene INNENFOR de hvite karmene.
    const windows = [
        // Frontveggen.
        { x: -2.2, y: 1.7, z: 2.9, width: 1.44, height: 1.24, rotation: 0 },
        { x:  2.2, y: 1.7, z: 2.9, width: 1.44, height: 1.24, rotation: 0 },

        // Bakveggen.
        { x: 2.2, y: 1.7, z: -2.9, width: 1.44, height: 1.24, rotation: 0 },

        // Venstre sidevegg.
        { x: -3.9, y: 1.7, z: -1.4, width: 1.04, height: 1.24, rotation: 90 },
        { x: -3.9, y: 1.7, z:  1.4, width: 1.04, height: 1.24, rotation: 90 },

        // Gavlene i andre etasje.
        { x: -3.9, y: 4.9, z: 0, width: 1.04, height: 0.84, rotation: 90 },
        { x:  3.9, y: 4.9, z: 0, width: 1.04, height: 0.84, rotation: 90 },
    ];

    // Tegn de fjerneste vinduene først.
    const distanceSquared = (window) => {
        const dx = window.x - app.camera.camPosX;
        const dy = window.y - app.camera.camPosY;
        const dz = window.z - app.camera.camPosZ;

        return dx * dx + dy * dy + dz * dz;
    };

    windows.sort(
        (a, b) => distanceSquared(b) - distanceSquared(a)
    );

    const gl = app.gl;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);

    for (const window of windows) {
        const modelMatrix = new Matrix4();

        modelMatrix.translate(window.x, window.y, window.z);
        modelMatrix.rotate(window.rotation, 0, 1, 0);
        modelMatrix.scale(window.width / 2, window.height / 2, 1);

        glass.draw(app.uniformShaderInfo, elapsed, modelMatrix);
    }

    gl.depthMask(true);
    gl.disable(gl.BLEND);
}