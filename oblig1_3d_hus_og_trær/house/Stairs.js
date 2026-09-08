'use strict';

export function drawStairs(app, elapsed) {
    const stepCount = 12;
    const stepHeight = 3.2 / stepCount;
    const stepDepth = 3.6 / stepCount;

    for (let i = 0; i < stepCount; i++) {
        const height = (i + 1) * stepHeight;

        const stepMatrix = new Matrix4();

        stepMatrix.translate(
            -2.9 + (i + 0.5) * stepDepth,
            0.2 + height / 2,
            -2.2
        );

        stepMatrix.scale(
            stepDepth / 2,
            height / 2,
            0.6
        );

        app.stairCube.draw(
            app.uniformShaderInfo,
            elapsed,
            stepMatrix
        );
    }
}