'use strict';

export function drawInterior(app, elapsed) {
    // Langsgående innervegg ved x = 0.
    // To døråpninger fra det store venstre rommet til høyre rom.

    // Veggdel nær fronten.
    const partitionFrontMatrix = new Matrix4();
    partitionFrontMatrix.translate(0.8, 1.7, 2.35);
    partitionFrontMatrix.scale(0.1, 1.5, 0.45);

    app.innerWallCube.draw(
        app.uniformShaderInfo, elapsed, partitionFrontMatrix
    );

    // Midtdel mellom åpningene.
    const partitionMiddleMatrix = new Matrix4();
    partitionMiddleMatrix.translate(0.8, 1.7, 0.2);
    partitionMiddleMatrix.scale(0.1, 1.5, 0.5);

    app.innerWallCube.draw(
        app.uniformShaderInfo, elapsed, partitionMiddleMatrix
    );

    // Veggdel nær bakveggen.
    const partitionBackMatrix = new Matrix4();
    partitionBackMatrix.translate(0.8, 1.7, -2.15);
    partitionBackMatrix.scale(0.1, 1.5, 0.65);

    app.innerWallCube.draw(
        app.uniformShaderInfo, elapsed, partitionBackMatrix
    );

    // Over åpningen til fremre høyre rom.
    const frontOpeningTopMatrix = new Matrix4();
    frontOpeningTopMatrix.translate(0.8, 2.8, 1.3);
    frontOpeningTopMatrix.scale(0.1, 0.4, 0.6);

    app.innerWallCube.draw(
        app.uniformShaderInfo, elapsed, frontOpeningTopMatrix
    );

    // Over åpningen til bakre høyre rom.
    const backOpeningTopMatrix = new Matrix4();
    backOpeningTopMatrix.translate(0.8, 2.8, -0.9);
    backOpeningTopMatrix.scale(0.1, 0.4, 0.6);

    app.innerWallCube.draw(
        app.uniformShaderInfo, elapsed, backOpeningTopMatrix
    );

    // Skillevegg mellom de to høyre rommene.
    const rightDividerMatrix = new Matrix4();
    rightDividerMatrix.translate(2.35, 1.7, 0);
    rightDividerMatrix.scale(1.45, 1.5, 0.1);

    app.innerWallCube.draw(
        app.uniformShaderInfo, elapsed, rightDividerMatrix
    );
    // Vegg langs trappens åpne side i første etasje.
    const stairWallMatrix = new Matrix4();
    stairWallMatrix.translate(-1.1, 1.7, -1.5);
    stairWallMatrix.scale(1.8, 1.5, 0.1);

    app.innerWallCube.draw(
        app.uniformShaderInfo,
        elapsed,
        stairWallMatrix
    );
}
