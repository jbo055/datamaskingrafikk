import {WebGLCanvas} from './helpers/WebGLCanvas.js';
import {WebGLShader} from './helpers/WebGLShader.js';
import {Camera} from "./helpers/Camera.js";
import {Stack} from "./helpers/Stack.js";
import {initSylinderBuffers} from './shapes/Sylinder.js';
import {initKjegleBuffers} from './shapes/Kjegle.js';
import {loadTexture} from './helpers/Texture.js';

import {drawGravemaskin} from './Gravemaskin.js';

import {
    connectPositionAttribute,
    drawPlane
} from './Tegnehjelp.js';

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
		cubeBuffer: initCubeBuffers(webGLCanvas.gl),
        planeBuffer: initPlaneBuffers(webGLCanvas.gl),
        sylinderBuffer: initSylinderBuffers(webGLCanvas.gl),
        kjegleBuffer: initKjegleBuffers(webGLCanvas.gl),

        modelMatrix: new Matrix4(),
        modelviewMatrix: new Matrix4(),

		currentlyPressedKeys: [],
		forrigeTastetrykk: [],      // Brukes for å skille tastetrykk fra "tast holdes nede".
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

	initKeyPress(renderInfo.currentlyPressedKeys);
	// Kamera:
	const camera = new Camera(renderInfo.gl, renderInfo.currentlyPressedKeys, 0, 0, 30);
	animate( 0, renderInfo, camera);
}

/**
 * Knytter tastatur-evnents til eventfunksjoner.
 */
function initKeyPress(currentlyPressedKeys) {
	document.addEventListener('keyup', (event) => {
		currentlyPressedKeys[event.code] = false;
	}, false);
	document.addEventListener('keydown', (event) => {
		currentlyPressedKeys[event.code] = true;
	}, false);
}

function initBaseShaders(gl) {
	// Leser shaderkode fra HTML-fila: Standard/enkel shader (posisjon og farge):
	let vertexShaderSource = document.getElementById('base-vertex-shader').innerHTML;
	let fragmentShaderSource = document.getElementById('base-fragment-shader').innerHTML;

	// Initialiserer  & kompilerer shader-programmene;
	const glslShader = new WebGLShader(gl, vertexShaderSource, fragmentShaderSource);

	// Samler all shader-info i ET JS-objekt, som returneres.
	return  {
		program: glslShader.shaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexPosition'),
            vertexTextureCoordinate: gl.getAttribLocation(
                glslShader.shaderProgram,
                'aTextureCoordinate'
            )
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uProjectionMatrix'),
			modelMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uModelMatrix'),
			viewMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uViewMatrix'),
			fragmentColor: gl.getUniformLocation(glslShader.shaderProgram, 'uFragmentColor'),
            sampler: gl.getUniformLocation(
                glslShader.shaderProgram,
                'uSampler'
            ),

            useTexture: gl.getUniformLocation(
                glslShader.shaderProgram,
                'uUseTexture'
            ),
		},
	};
}

function initCoordShaders(gl) {
    // Leser shaderkode fra HTML-fila: Standard/enkel shader (posisjon og farge):
    let vertexShaderSource = document.getElementById('coord-vertex-shader').innerHTML;
    let fragmentShaderSource = document.getElementById('coord-fragment-shader').innerHTML;

    // Initialiserer  & kompilerer shader-programmene;
    const glslShader = new WebGLShader(gl, vertexShaderSource, fragmentShaderSource);

    // Samler all shader-info i ET JS-objekt, som returneres.
    return  {
        program: glslShader.shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexColor'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uModelViewMatrix'),
        },
    };
}

function initCoordBuffers(gl) {
    const extent =  100;

    const positions = new Float32Array([
        -extent, 0, 0,
        extent, 0, 0,
        0, -extent, 0,
        0, extent, 0,
        0, 0, -extent,
        0, 0, extent
    ]);

    const colors = new Float32Array([
        1, 0, 0, 1,   //R G B A
        1, 0, 0, 1,   //R G B A
        0, 1, 0, 1,   //R G B A
        0, 1, 0, 1,   //R G B A
        0, 0, 1, 1,   //R G B A
        0, 0, 1, 1,   //R G B A
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return  {
        position: positionBuffer,
        color: colorBuffer,
        vertexCount: positions.length/3
    };
}

/**
 * Oppretter verteksbuffer for kuben.
 * ÉN kube gjenbrukes til alle gravemaskinens kantete deler.
 */
function initCubeBuffers(gl) {
    const positions = new Float32Array([
        // Forside
        -1, -1,  1,
         1, -1,  1,
         1,  1,  1,
        -1, -1,  1,
         1,  1,  1,
        -1,  1,  1,

        // Bakside
         1, -1, -1,
        -1, -1, -1,
        -1,  1, -1,
         1, -1, -1,
        -1,  1, -1,
         1,  1, -1,

        // Venstre side
        -1, -1, -1,
        -1, -1,  1,
        -1,  1,  1,
        -1, -1, -1,
        -1,  1,  1,
        -1,  1, -1,

        // Høyre side
         1, -1,  1,
         1, -1, -1,
         1,  1, -1,
         1, -1,  1,
         1,  1, -1,
         1,  1,  1,

        // Topp
        -1,  1,  1,
         1,  1,  1,
         1,  1, -1,
        -1,  1,  1,
         1,  1, -1,
        -1,  1, -1,

        // Bunn
        -1, -1, -1,
         1, -1, -1,
         1, -1,  1,
        -1, -1, -1,
         1, -1,  1,
        -1, -1,  1
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // UV-koordinater for de seks vertexene på én kubeside.
    const sideUV = [
        0, 0,
        1, 0,
        1, 1,

        0, 0,
        1, 1,
        0, 1
    ];

    // Samme bilde gjentas på alle seks sidene.
    const textureCoordinates = [];

    for (let side = 0; side < 6; side++) {
        textureCoordinates.push(...sideUV);
    }

    const textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(textureCoordinates),
        gl.STATIC_DRAW
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return {
        position: positionBuffer,
        texture: textureBuffer,
        vertexCount: positions.length / 3
    };
}

function initPlaneBuffers(gl) {
    // En flate i xy-planet, med z = 0.
    const positions = new Float32Array([
        -1, -1, 0,
         1, -1, 0,
         1,  1, 0,

        -1, -1, 0,
         1,  1, 0,
        -1,  1, 0
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return {
        position: positionBuffer,
        vertexCount: positions.length / 3
    };
}

/**
 * Aktiverer color-bufferet.
 * Kalles fra draw()
 */
function connectColorAttribute(gl, shader, colorBuffer) {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(
        shader.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(shader.attribLocations.vertexColor);
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
	handleKeys(renderInfo, elapsed);
    // Radaren roterer 90 grader per sekund.
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
 * Beregner og viser FPS.
 * Summerer forløpt tid fra getElapsed() istedenfor å holde på et eget tidsstempel.
 * @param elapsed Forløpt tid (i sekunder) siden forrige frame.
 * @param fpsInfo
 */
function calculateFps(elapsed, fpsInfo) {
	fpsInfo.frameCount++;
	fpsInfo.elapsedTotal += elapsed;
	// Viser oppdatert FPS én gang i sekundet:
	if (fpsInfo.elapsedTotal >= 1.0) {
		// Viser FPS i .html ("fps" er definert i .html fila):
		document.getElementById('fps').innerHTML = Math.round(fpsInfo.frameCount / fpsInfo.elapsedTotal);
		// Nullstiller telleren:
		fpsInfo.frameCount = 0;
		fpsInfo.elapsedTotal = 0;
	}
}

/**
 * Tegner!
 */
function draw(currentTime, renderInfo, camera) {
	clearCanvas(renderInfo.gl);
    drawCoord(renderInfo, camera);
	
    // Start med en tom vindusliste for hvert bilde.
    renderInfo.vinduer.length = 0;

    // Tegn solide deler, og samle vinduene i listen.
    drawGravemaskin(renderInfo, camera);

    const gl = renderInfo.gl;

    // Tegn glass etter de solide delene.
    gl.useProgram(renderInfo.baseShader.program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Glasset testes mot dybdebufferet, men skriver ikke til det.
    gl.depthMask(false);

    // Finn vinduenes dybde sett fra kameraet.
    // Dette viser ingen forskjell når vi bruker samme fargen på alle vinduene, men rekkefølgen blir riktig når vi bruker ulike farger på vinduene.
    function vinduDybde(vindu) {
        const modelViewMatrix = new Matrix4(camera.viewMatrix);
        modelViewMatrix.multiply(vindu.matrix);

        return modelViewMatrix.elements[14];
    }

    // Mer negativ z betyr lenger unna i kamerakoordinater.
    renderInfo.vinduer.sort(
        (a, b) => vinduDybde(a) - vinduDybde(b)
    );

    for (const vindu of renderInfo.vinduer) {
        drawPlane(
            renderInfo,
            vindu.matrix,
            camera,
            vindu.farge
        );
    }

    // Gjenopprett innstillingene før neste bilde.
    gl.depthMask(true);
    gl.disable(gl.BLEND);

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


function drawCoord(renderInfo, camera) {
    const gl = renderInfo.gl;
    // Aktiver shader:
    gl.useProgram(renderInfo.coordShader.program);

    // Kople posisjon og farge-attributtene til tilhørende buffer:
    connectPositionAttribute(gl, renderInfo.coordShader, renderInfo.coordBuffers.position);
    connectColorAttribute(gl, renderInfo.coordShader, renderInfo.coordBuffers.color);
    // MODEL:
    renderInfo.modelMatrix.setIdentity();
    // MODELVIEW:
    renderInfo.modelviewMatrix.set(camera.viewMatrix);
    renderInfo.modelviewMatrix.multiply(renderInfo.modelMatrix);

    // Send kameramatrisene til shaderen:
    gl.uniformMatrix4fv(renderInfo.coordShader.uniformLocations.modelViewMatrix, false, renderInfo.modelviewMatrix.elements);
    gl.uniformMatrix4fv(renderInfo.coordShader.uniformLocations.projectionMatrix, false, camera.projectionMatrix.elements);
    // Tegn coord:
    gl.drawArrays(gl.LINES, 0, renderInfo.coordBuffers.vertexCount);
}

function handleKeys(renderInfo, elapsed) {
    const hastighet = 45; // Grader per sekund.

    if (renderInfo.currentlyPressedKeys['KeyJ']) {
        renderInfo.animation.husVinkel += hastighet * elapsed;
    }

    if (renderInfo.currentlyPressedKeys['KeyL']) {
        renderInfo.animation.husVinkel -= hastighet * elapsed;
    }
	if (renderInfo.currentlyPressedKeys['KeyI']) {
		renderInfo.animation.bomVinkel = Math.min(
			renderInfo.animation.bomVinkel + hastighet * elapsed,
			-10
		);
	}

	if (renderInfo.currentlyPressedKeys['KeyK']) {
		renderInfo.animation.bomVinkel = Math.max(
			renderInfo.animation.bomVinkel - hastighet * elapsed,
			-80
		);
	}
	if (renderInfo.currentlyPressedKeys['KeyU']) {
    	renderInfo.animation.armVinkel = Math.min(
			renderInfo.animation.armVinkel + hastighet * elapsed,
			-20
		);
	}

	if (renderInfo.currentlyPressedKeys['KeyO']) {
		renderInfo.animation.armVinkel = Math.max(
			renderInfo.animation.armVinkel - hastighet * elapsed,
			-150
		);
	}
	if (renderInfo.currentlyPressedKeys['KeyN']) {
		renderInfo.animation.skuffeVinkel = Math.min(
			renderInfo.animation.skuffeVinkel + hastighet * elapsed,
			60
		);
	}

	if (renderInfo.currentlyPressedKeys['KeyM']) {
		renderInfo.animation.skuffeVinkel = Math.max(
			renderInfo.animation.skuffeVinkel - hastighet * elapsed,
			-120
		);
	}
}

function initBelteTextureBuffer(gl) {
    // Beltets fulle dimensjoner.
    const lengde = 6.8;
    const bredde = 0.8;
    const hoyde = 1.0;

    // Hvor mange modellenheter en teksturrute dekker.
    const tileSize = 2.0;

    // Samme siderekkefølge som vertexene i initCubeBuffers().
    const sider = [
        [lengde, hoyde],  // Forside
        [lengde, hoyde],  // Bakside
        [bredde, hoyde],  // Venstre side
        [bredde, hoyde],  // Høyre side
        [lengde, bredde], // Topp
        [lengde, bredde]  // Bunn
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