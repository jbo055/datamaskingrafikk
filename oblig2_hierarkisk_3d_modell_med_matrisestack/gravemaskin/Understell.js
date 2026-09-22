import {drawCube} from '../Tegnehjelp.js';
import {drawSylinder} from '../Tegnehjelp.js';

export function drawUnderstell(renderInfo, camera) {
    // Understell
    const understellMatrix = renderInfo.stack.peekMatrix();
    understellMatrix.translate(0, 0.5, 0);
    understellMatrix.scale(3, 0.5, 1.5);

    drawCube(
        renderInfo,
        understellMatrix,
        camera,
        [0.25, 0.25, 0.25, 1.0]
    );

    // Belter
    for (const side of [-1, 1]) {
        const belteMatrix = renderInfo.stack.peekMatrix();
        belteMatrix.translate(0, 0.5, side * 1.9);
        belteMatrix.scale(3.4, 0.5, 0.4);

        drawCube(
            renderInfo,
            belteMatrix,
            camera,
            [1.0, 1.0, 1.0, 1.0],
            true,
            renderInfo.belteTextureBuffer
        );
    }

    // Sokkel mellom understellet og huset.
    const sokkelMatrix = renderInfo.stack.peekMatrix();
    sokkelMatrix.translate(0, 1.125, 0);
    sokkelMatrix.scale(0.8, 0.125, 0.8);

    drawSylinder(
        renderInfo,
        sokkelMatrix,
        camera,
        [0.15, 0.15, 0.15, 1.0]
    );
}