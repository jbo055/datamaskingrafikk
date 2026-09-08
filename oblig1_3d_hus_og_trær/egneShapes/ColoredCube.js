'use strict';

import { Cube } from '../shapes/Cube.js';

/**
 * En kube som tegnes med uniform-shaderen.
 *
 * Cube gir hver vertex sin egen farge via et fargebuffer. Denne varianten
 * sender i stedet ÉN farge til GPU-en som uniformen uColor. Resultatet ser
 * likt ut, men GPU-en slipper å interpolere en farge som uansett er lik
 * overalt, og vi slipper å sende 36 fargesett over til skjermkortet.
 *
 * Alt annet - posisjoner, buffer, wireframe - arves uendret fra Cube.
 */
export class ColoredCube extends Cube {

    draw(shaderInfo, elapsed, modelMatrix = new Matrix4()) {
        // En uniform hører til ETT bestemt shaderprogram, så programmet må
        // være aktivt før vi kan sette den. Cube.draw() gjør useProgram selv,
        // men rekker også å tegne ferdig - da er det for sent. Derfor
        // aktiverer vi programmet her først. Ekstra useProgram gjør ingen skade.
        this.gl.useProgram(shaderInfo.program);

        // Shaderen uten uColor (baseShaderInfo) skal fortsatt fungere:
        if (shaderInfo.uniformLocations.color != null) {
            this.gl.uniform4f(
                shaderInfo.uniformLocations.color,
                this.color.red,
                this.color.green,
                this.color.blue,
                this.color.alpha
            );
        }

        super.draw(shaderInfo, elapsed, modelMatrix);
    }
}
