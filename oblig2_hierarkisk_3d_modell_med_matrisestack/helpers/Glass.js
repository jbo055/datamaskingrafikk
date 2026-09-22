import {drawFlate} from '../Tegnehjelp.js';

/**
 * Gjennomsiktige flater må tegnes etter alle de solide delene, og bakfra og frem.
 * Derfor tegner ikke delene glasset sitt selv: de melder det inn med samleGlass(),
 * og draw() tegner hele samlingen til slutt med tegnGlass().
 */

// Gjenbrukes mellom bildene i stedet for å lage én ny matrise per vindu.
const modelviewMatrix = new Matrix4();

/**
 * Tømmer samlingen. Kalles først i hvert bilde.
 */
export function nullstillGlass(renderInfo) {
    renderInfo.vinduer.length = 0;
}

/**
 * Melder inn en gjennomsiktig flate som skal tegnes senere i bildet.
 */
export function samleGlass(renderInfo, matrix, farge) {
    renderInfo.vinduer.push({matrix, farge});
}

/**
 * Hvor langt unna kameraet flaten ligger.
 * Mer negativ z betyr lenger unna i kamerakoordinater.
 */
function vinduDybde(vindu, camera) {
    modelviewMatrix.set(camera.viewMatrix);
    modelviewMatrix.multiply(vindu.matrix);

    return modelviewMatrix.elements[14];
}

export function tegnGlass(renderInfo, camera) {
    const gl = renderInfo.gl;

    gl.useProgram(renderInfo.baseShader.program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Glasset testes mot dybdebufferet, men skriver ikke til det.
    // Uten dette ville det fremste vinduet skjult vinduene bak seg.
    gl.depthMask(false);

    // Bakerste flate først. Dette viser ingen forskjell når alle vinduene
    // har samme farge, men rekkefølgen blir riktig med ulike farger.
    renderInfo.vinduer.sort(
        (a, b) => vinduDybde(a, camera) - vinduDybde(b, camera)
    );

    for (const vindu of renderInfo.vinduer) {
        drawFlate(renderInfo, vindu.matrix, camera, vindu.farge);
    }

    // Gjenopprett innstillingene før neste bilde.
    gl.depthMask(true);
    gl.disable(gl.BLEND);
}
