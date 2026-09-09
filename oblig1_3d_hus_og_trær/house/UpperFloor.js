import { drawWindowFrame } from './Windows.js';

'use strict';

export function initUpperFloor(app) {
    app.gable = new TriangularPrism(app, app.cube.color);
    app.gable.initBuffers();
}

export function drawUpperFloor(app, elapsed) {
    // Gulvet foran trappeåpningen.
    const upperFloorFrontMatrix = new Matrix4();
    upperFloorFrontMatrix.translate(0, 3.3, 0.6);
    upperFloorFrontMatrix.scale(3.8, 0.1, 2.2);

    app.floorCube.draw(
        app.uniformShaderInfo, elapsed, upperFloorFrontMatrix
    );

    // Gulvet til venstre for trappen.
    const upperFloorLeftMatrix = new Matrix4();
    upperFloorLeftMatrix.translate(-3.35, 3.3, -2.2);
    upperFloorLeftMatrix.scale(0.45, 0.1, 0.6);

    app.floorCube.draw(
        app.uniformShaderInfo, elapsed, upperFloorLeftMatrix
    );

    // Gulvet til høyre for trappen, der øverste trinn ender.
    const upperFloorRightMatrix = new Matrix4();
    upperFloorRightMatrix.translate(2.25, 3.3, -2.2);
    upperFloorRightMatrix.scale(1.55, 0.1, 0.6);

    app.floorCube.draw(
        app.uniformShaderInfo, elapsed, upperFloorRightMatrix
    );

    // Andre etasje: bakvegg.
    const upperBackMatrix = new Matrix4();
    upperBackMatrix.translate(0, 3.9, -2.9);
    upperBackMatrix.scale(4, 0.5, 0.1);

    app.cube.draw(
        app.uniformShaderInfo, elapsed, upperBackMatrix
    );

    // Venstre sidevegg.
    const upperLeftMatrix = new Matrix4();
    upperLeftMatrix.translate(-3.9, 3.9, 0.1);
    upperLeftMatrix.scale(0.1, 0.5, 2.9);

    app.cube.draw(
        app.uniformShaderInfo, elapsed, upperLeftMatrix
    );

    // Høyre sidevegg.
    const upperRightMatrix = new Matrix4();
    upperRightMatrix.translate(3.9, 3.9, 0.1);
    upperRightMatrix.scale(0.1, 0.5, 2.9);

    app.cube.draw(
        app.uniformShaderInfo, elapsed, upperRightMatrix
    );

    // Frontvegg mellom sideveggene.
    const upperFrontMatrix = new Matrix4();
    upperFrontMatrix.translate(0, 3.9, 2.9);
    upperFrontMatrix.scale(3.8, 0.5, 0.1);

    app.cube.draw(
        app.uniformShaderInfo, elapsed, upperFrontMatrix
    );

    // Ett vindu i hver gavl.
    for (const x of [-3.9, 3.9]) {
        // Rektangulær veggdel over vinduet.
        const aboveMatrix = new Matrix4();
        aboveMatrix.translate(x, 5.7, 0);
        aboveMatrix.scale(0.1, 0.3, 0.6);

        app.cube.draw(
            app.uniformShaderInfo, elapsed, aboveMatrix
        );

        // Trekanten øverst, opp mot mønet.
        const topMatrix = new Matrix4();
        topMatrix.translate(x, 6.2, 0);
        topMatrix.scale(0.1, 0.2, 0.6);

        app.triangleBlock.draw(
            app.uniformShaderInfo, elapsed, topMatrix
        );

        // Skrå veggdeler på begge sider av vinduet.
        for (const side of [-1, 1]) {
            const slopeMatrix = new Matrix4();

            slopeMatrix.translate(x, 4.8, side * 1.2);

            slopeMatrix.scale(
                0.1,
                1.6 / Math.SQRT2,
                side * 2.4 / Math.SQRT2
            );

            slopeMatrix.rotate(-135, 1, 0, 0);
            slopeMatrix.scale(1, 0.5, 1);

            app.triangleBlock.draw(
                app.uniformShaderInfo, elapsed, slopeMatrix
            );
        }

        // Hvit karm rundt åpningen.
        drawWindowFrame(app, elapsed, x, 4.9, 0, 1.2, 1, 90);
    }
}
