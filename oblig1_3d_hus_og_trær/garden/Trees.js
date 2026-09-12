'use strict';

/**
 * Tegner ett tre: en brun stamme (sylinder) med en grønn krone (kule).
 * Stammen står på bakken (y = 0) i punktet (x, z).
 *
 * Både sylinderen og kula har radius 1 og går fra -1 til 1, så
 * scale() med halve målene gir riktig størrelse.
 */
function drawTree(app, elapsed, tree) {
    const trunkRadius = tree.crownRadius * 0.2;

    const trunkMatrix = new Matrix4();
    trunkMatrix.translate(tree.x, tree.trunkHeight / 2, tree.z);
    trunkMatrix.scale(trunkRadius, tree.trunkHeight / 2, trunkRadius);

    app.trunk.draw(app.baseShaderInfo, elapsed, trunkMatrix);

    // Kronen senkes litt ned over stammen, så toppen av stammen ikke synes.
    const crownMatrix = new Matrix4();
    crownMatrix.translate(
        tree.x,
        tree.trunkHeight + tree.crownRadius * 0.8,
        tree.z
    );
    crownMatrix.scale(tree.crownRadius, tree.crownRadius, tree.crownRadius);

    app.crown.draw(app.baseShaderInfo, elapsed, crownMatrix);
}

export function drawTrees(app, elapsed) {
    // Huset går fra x = -4 til 4 og z = -3 til 3, så trærne står utenfor.
    const trees = [
        { x: -7.0, z:  5.0, trunkHeight: 1.2, crownRadius: 1.0 },
        { x:  6.5, z:  5.5, trunkHeight: 1.6, crownRadius: 1.4 },
        { x: -7.5, z: -5.0, trunkHeight: 2.0, crownRadius: 1.7 },
        { x:  7.0, z: -6.0, trunkHeight: 1.0, crownRadius: 0.8 },
        { x:  2.0, z: -8.0, trunkHeight: 1.5, crownRadius: 1.2 },
    ];

    for (const tree of trees) {
        drawTree(app, elapsed, tree);
    }
}
