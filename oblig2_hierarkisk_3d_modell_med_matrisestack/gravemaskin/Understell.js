import {drawKube, drawSylinder} from '../Tegnehjelp.js';

// Beltets fulle mål. Ett sted, brukt både til skaleringen under og til
// teksturkoordinatene i initBelteTextureBuffer().
const BELTE = {
    lengde: 6.8,
    hoyde: 1.0,
    bredde: 0.8
};

/**
 * Teksturkoordinater for beltet.
 * Kuben går fra -1 til 1, så teksturen ville blitt strukket over hele
 * beltelengden. Her regnes den heller ut som antall fliser per side,
 * slik at mønsteret får samme størrelse overalt.
 */
export function initBelteTextureBuffer(gl) {
    // Hvor mange modellenheter en teksturrute dekker.
    const tileSize = 2.0;

    // Samme siderekkefølge som vertexene i initKubeBuffers() (shapes/Kube.js).
    const sider = [
        [BELTE.lengde, BELTE.hoyde],   // Forside
        [BELTE.lengde, BELTE.hoyde],   // Bakside
        [BELTE.bredde, BELTE.hoyde],   // Venstre side
        [BELTE.bredde, BELTE.hoyde],   // Høyre side
        [BELTE.lengde, BELTE.bredde],  // Topp
        [BELTE.lengde, BELTE.bredde]   // Bunn
    ];

    const uv = [];

    for (const [sideBredde, sideHoyde] of sider) {
        const u = sideBredde / tileSize;
        const v = sideHoyde / tileSize;

        uv.push(
            0, 0,
            u, 0,
            u, v,

            0, 0,
            u, v,
            0, v
        );
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(uv),
        gl.STATIC_DRAW
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return buffer;
}

export function drawUnderstell(renderInfo, camera) {
    // Understell
    const understellMatrix = renderInfo.stack.peekMatrix();
    understellMatrix.translate(0, 0.5, 0);
    understellMatrix.scale(3, 0.5, 1.5);

    drawKube(
        renderInfo,
        understellMatrix,
        camera,
        [0.25, 0.25, 0.25, 1.0]
    );

    // Belter
    for (const side of [-1, 1]) {
        const belteMatrix = renderInfo.stack.peekMatrix();
        belteMatrix.translate(0, 0.5, side * 1.9);
        // Halve målene, fordi kuben går fra -1 til 1 i alle retninger.
        belteMatrix.scale(
            BELTE.lengde / 2,
            BELTE.hoyde / 2,
            BELTE.bredde / 2
        );

        drawKube(
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