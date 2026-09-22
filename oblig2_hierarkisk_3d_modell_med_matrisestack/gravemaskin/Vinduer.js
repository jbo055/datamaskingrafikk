const vinduer = [
    {
        posisjon: [0, 0.95, -0.4],
        rotasjon: 0,
        skalering: [0.64, 0.75, 1]
    },
    {
        posisjon: [0, 0.95, 0.4],
        rotasjon: 0,
        skalering: [0.64, 0.75, 1]
    },
    {
        posisjon: [-0.7, 0.95, 0],
        rotasjon: 90,
        skalering: [0.34, 0.75, 1]
    },
    {
        posisjon: [0.7, 0.95, 0],
        rotasjon: 90,
        skalering: [0.34, 0.75, 1]
    }
];

export function drawVinduer(renderInfo, camera) {
    for (const vindu of vinduer) {
        const vinduMatrix = renderInfo.stack.peekMatrix();

        vinduMatrix.translate(...vindu.posisjon);
        vinduMatrix.rotate(vindu.rotasjon, 0, 1, 0);
        vinduMatrix.scale(...vindu.skalering);

        // Glasset tegnes i main.js etter de solide delene.
        renderInfo.vinduer.push({
            matrix: vinduMatrix,
            farge: [0.5, 0.8, 0.95, 0.3]
        });
    }
}