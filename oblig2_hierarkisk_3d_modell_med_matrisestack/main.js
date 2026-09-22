import {WebGLCanvas} from './helpers/WebGLCanvas.js';
import {Camera} from "./helpers/Camera.js";
import {Stack} from "./helpers/Stack.js";
import {initBaseShaders, initCoordShaders} from './helpers/Shaders.js';
import {calculateFps} from './helpers/Fps.js';
import {loadTexture} from './helpers/Texture.js';
import {initCoordBuffers, drawCoord} from './helpers/Koordinatakser.js';
import {nullstillGlass, tegnGlass} from './helpers/Glass.js';

import {initKubeBuffers} from './shapes/Kube.js';
import {initFlateBuffers} from './shapes/Flate.js';
import {initSylinderBuffers} from './shapes/Sylinder.js';
import {initKjegleBuffers} from './shapes/Kjegle.js';

import {drawGravemaskin} from './Gravemaskin.js';
import {initBelteTextureBuffer} from './gravemaskin/Understell.js';
import {initTastatur, oppdaterLedd} from './gravemaskin/Styring.js';

/**
 * WebGL-program som tegner en hierarkisk gravemaskin.
 * Ledd styres fra tastaturet, og modellen bygges med matrisestack.
 */

export function main() {
	// Oppretter et webGLCanvas for WebGL-tegning:
	const webGLCanvas = new WebGLCanvas('myCanvas', document.body, 960, 640);
	// Hjelpeobjekt som holder på objekter som trengs for rendring:
	const renderInfo = {
		gl: webGLCanvas.gl,
        coordShader: initCoordShaders(webGLCanvas.gl),
		baseShader: initBaseShaders(webGLCanvas.gl),
        vinduer: [],
        belteTexture: loadTexture(webGLCanvas.gl, './textures/belter.png'),
        belteTextureBuffer: initBelteTextureBuffer(webGLCanvas.gl),
        metalTexture: loadTexture(webGLCanvas.gl, './textures/metal.png'),

        coordBuffers: initCoordBuffers(webGLCanvas.gl),
		kubeBuffer: initKubeBuffers(webGLCanvas.gl),
        flateBuffer: initFlateBuffers(webGLCanvas.gl),
        sylinderBuffer: initSylinderBuffers(webGLCanvas.gl),
        kjegleBuffer: initKjegleBuffers(webGLCanvas.gl),

		currentlyPressedKeys: [],
		stack: new Stack(),
		lastTime: 0,
		stackVarUbalansert: false,  // Hindrer at konsollen fylles opp med samme advarsel.
		fpsInfo: {  // Brukes til å beregne og vise FPS (Frames Per Seconds):
			frameCount: 0,
			elapsedTotal: 0
		},
		animation: {
			husVinkel: 0,       // Husets rotasjon rundt y-aksen.
			bomVinkel: -35,     // Bommens rotasjon rundt z-aksen.
			armVinkel: -100,    // Armens rotasjon rundt z-aksen.
			skuffeVinkel: -30,  // Skuffens rotasjon rundt z-aksen.
            radarVinkel: 0      // Radarens rotasjon rundt y-aksen.
		}
	};

	initTastatur(renderInfo.currentlyPressedKeys);
	// Kamera:
	const camera = new Camera(renderInfo.gl, renderInfo.currentlyPressedKeys, 0, 0, 30);
	animate( 0, renderInfo, camera);
}

/**
 * Klargjør canvaset.
 * Kalles fra draw()
 */
function clearCanvas(gl) {
	gl.clearColor(0.9, 0.9, 0.9, 1);  // Clear screen farge.
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);           // Enable "depth testing".
	gl.depthFunc(gl.LEQUAL);            // Nære objekter dekker fjerne objekter.
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function animate(currentTime, renderInfo, camera) {
	window.requestAnimationFrame((currentTime) => {
		animate(currentTime, renderInfo, camera);
	});

	// Finner tid siden siste kall på draw().
	let elapsed = getElapsed(currentTime, renderInfo);
	calculateFps(elapsed, renderInfo.fpsInfo);

	camera.handleKeys(elapsed);
	oppdaterLedd(renderInfo, elapsed);
    // Radaren roterer 90 grader per sekund, uten tastetrykk.
    renderInfo.animation.radarVinkel =
        (renderInfo.animation.radarVinkel + 90 * elapsed) % 360;

	draw(currentTime, renderInfo, camera);
}

/**
 * Beregner forløpt tid siden siste kall.
 * @param currentTime
 * @param renderInfo
 */
function getElapsed(currentTime, renderInfo) {
	let elapsed = 0.0;
	if (renderInfo.lastTime !== 0.0)	// Først gang er lastTime = 0.0.
		elapsed = (currentTime - renderInfo.lastTime)/1000; // Deler på 1000 for å operere med sekunder.
	renderInfo.lastTime = currentTime;						// Setter lastTime til currentTime.
	return elapsed;
}

/**
 * Tegner!
 */
function draw(currentTime, renderInfo, camera) {
	clearCanvas(renderInfo.gl);
    drawCoord(renderInfo, camera);

    // Start med en tom glassamling for hvert bilde.
    nullstillGlass(renderInfo);

    // Tegner de solide delene. Vinduene melder seg inn underveis.
    drawGravemaskin(renderInfo, camera);

    // Glasset tegnes til slutt, sortert bakfra og frem.
    tegnGlass(renderInfo, camera);

	// Med balansert push/pop skal stacken alltid være tom her, men for sikkerhets skyld:
	if (renderInfo.stack.size() !== 0) {
		if (!renderInfo.stackVarUbalansert) {   // Advarer bare én gang, ikke 60 ganger i sekundet.
			console.warn('Ubalansert matrisestack (tømmer). Matriser igjen:', renderInfo.stack.size());
			renderInfo.stackVarUbalansert = true;
		}
		renderInfo.stack.empty();
	} else {
		renderInfo.stackVarUbalansert = false;
	}
}
