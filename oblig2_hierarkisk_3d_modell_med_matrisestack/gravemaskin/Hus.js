import {drawCube} from '../Tegnehjelp.js';
import {drawArm} from './Arm.js';
import {drawForerhus} from './Forerhus.js';

export function drawHus(renderInfo, camera) {
    /// Huset får sin egen matrise i hierarkiet.
	const husMatrix = renderInfo.stack.peekMatrix();
	husMatrix.translate(0, 1.85, 0);
	husMatrix.rotate(renderInfo.animation.husVinkel, 0, 1, 0);
	renderInfo.stack.pushMatrix(husMatrix);

	// Skaler bare boksen som tegnes.
	const husTegneMatrix = renderInfo.stack.peekMatrix();
	husTegneMatrix.scale(2.2, 0.6, 1.3);

	drawCube(
        renderInfo,
        husTegneMatrix,
        camera,
        [1.0, 1.0, 1.0, 1.0],
        true,
        renderInfo.cubeBuffer.texture,
        renderInfo.metalTexture
    );

    drawForerhus(renderInfo, camera);

    // Radaren er et barn av huset.
    const radarMatrix = renderInfo.stack.peekMatrix();

    // Plasser radaren bak på taket.
    // Husets topp ligger på lokal y = 0.6.
    radarMatrix.translate(-1.3, 0.6, 0);

    renderInfo.stack.pushMatrix(radarMatrix);

    // Stang: høyde 0.8.
    const stangMatrix = renderInfo.stack.peekMatrix();
    stangMatrix.translate(0, 0.4, 0);
    stangMatrix.scale(0.08, 0.4, 0.08);

    drawCube(
        renderInfo,
        stangMatrix,
        camera,
        [0.3, 0.3, 0.3, 1.0]
    );

    // Radarhode øverst på stangen.
    const radarHodeMatrix = renderInfo.stack.peekMatrix();
    radarHodeMatrix.translate(0, 0.9, 0);
    radarHodeMatrix.rotate(renderInfo.animation.radarVinkel, 0, 1, 0);
    radarHodeMatrix.scale(0.7, 0.1, 0.15);

    drawCube(
        renderInfo,
        radarHodeMatrix,
        camera,
        [0.15, 0.15, 0.15, 1.0]
    );

    renderInfo.stack.popMatrix(); // Radaren.

	drawArm(renderInfo, camera);

    renderInfo.stack.popMatrix(); // Huset.
}