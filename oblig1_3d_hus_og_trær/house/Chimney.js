'use strict';

import { ColoredCube } from '../egneShapes/ColoredCube.js';

let chimney;

export function drawChimney(app, elapsed) {
    if (!chimney) {
        chimney = new ColoredCube(app, {
            red: 0.4,
            green: 0.22,
            blue: 0.12,
            alpha: 1.0
        });

        chimney.initBuffers();
    }

    // Pipe: 0.8 bred, 7 høy og 0.6 dyp.
    const chimneyMatrix = new Matrix4();
    chimneyMatrix.translate(-2.2, 3.4, -1.1);
    chimneyMatrix.scale(0.4, 3.5, 0.3);

    chimney.draw(
        app.uniformShaderInfo, elapsed, chimneyMatrix
    );
}