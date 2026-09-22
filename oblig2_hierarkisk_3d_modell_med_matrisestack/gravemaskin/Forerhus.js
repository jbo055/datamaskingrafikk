import {drawKube} from '../Tegnehjelp.js';
import {drawVinduer} from './Vinduer.js';

// Faste deler, plassert i forhold til førerhuset.
const deler = [
    {
        navn: 'gulv',
        posisjon: [0, 0.1, 0],
        skalering: [0.8, 0.1, 0.5],
        farge: [0.25, 0.25, 0.25, 1.0]
    },
    {
        navn: 'tak',
        posisjon: [0, 1.8, 0],
        skalering: [0.9, 0.1, 0.6],
        farge: [1.0, 1.0, 1.0, 1.0],
        brukTekstur: true
    },
    {
        navn: 'setepute',
        posisjon: [-0.2, 0.55, 0],
        skalering: [0.3, 0.1, 0.3],
        farge: [0.15, 0.15, 0.15, 1.0]
    },
    {
        // Ryggen står mot negativ x. Føreren sitter vendt mot positiv x, der bommen er.
        navn: 'seterygg',
        posisjon: [-0.45, 0.9, 0],
        skalering: [0.08, 0.35, 0.3],
        farge: [0.15, 0.15, 0.15, 1.0]
    },
    {
        navn: 'setesokkel',
        posisjon: [-0.2, 0.325, 0],
        skalering: [0.15, 0.125, 0.15],
        farge: [0.3, 0.3, 0.3, 1.0]
    }
];

// Fire like hjørnestolper, én i hvert hjørne mellom gulvet og taket.
// Genereres i stedet for å skrives fire ganger.
for (const x of [-0.7, 0.7]) {
    for (const z of [-0.4, 0.4]) {
        deler.push({
            navn: 'hjørnestolpe',
            posisjon: [x, 0.95, z],
            skalering: [0.06, 0.75, 0.06],
            farge: [1.0, 1.0, 1.0, 1.0],
            brukTekstur: true
        });
    }
}

export function drawForerhus(renderInfo, camera) {
    // Arver husets plassering og rotasjon.
    const forerhusMatrix = renderInfo.stack.peekMatrix();
    forerhusMatrix.translate(0.3, 0.6, 0.7);

    renderInfo.stack.pushMatrix(forerhusMatrix);

    for (const del of deler) {
        const delMatrix = renderInfo.stack.peekMatrix();

        delMatrix.translate(...del.posisjon);
        delMatrix.scale(...del.skalering);

        drawKube(
            renderInfo,
            delMatrix,
            camera,
            del.farge,
            del.brukTekstur ?? false,
            renderInfo.kubeBuffer.texture,
            renderInfo.metalTexture
        );
    }

    // Tegn vinduer.
    drawVinduer(renderInfo, camera);
    
    renderInfo.stack.popMatrix(); // Tilbake til husets matrise.
}