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

    // Venstre gavl.
    const leftGableMatrix = new Matrix4();
    leftGableMatrix.translate(-3.9, 5.4, 0);
    leftGableMatrix.scale(0.1, 1, 3);

    app.triangleBlock.draw(
        app.uniformShaderInfo, elapsed, leftGableMatrix
    );

    // Høyre gavl.
    const rightGableMatrix = new Matrix4();
    rightGableMatrix.translate(3.9, 5.4, 0);
    rightGableMatrix.scale(0.1, 1, 3);

    app.triangleBlock.draw(
        app.uniformShaderInfo, elapsed, rightGableMatrix
    );
}
