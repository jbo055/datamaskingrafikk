import {WebGLCanvas} from '../../../base/helpers/WebGLCanvas.js';
import {WebGLShader} from '../../../base/helpers/WebGLShader.js';
import {Camera} from "../../../base/helpers/Camera.js";

/**
 * Et WebGL-program som tegner en enkel trekant.
 * Bruker en egen Camera-klasse som håndterer view, viewmodel og
 * projection-matrisene.
 */

export function main() {
	// Oppretter et webGLCanvas for WebGL-tegning:
	const webGLCanvas = new WebGLCanvas('myCanvas', document.body, 960, 640);
	// Hjelpeobjekt som holder på objekter som trengs for rendring:
	const renderInfo = {
		gl: webGLCanvas.gl,
		baseShader: initBaseShaders(webGLCanvas.gl),
		coordBuffers: initCoordBuffers(webGLCanvas.gl),
		planetsBuffer: initPlanetBuffers(webGLCanvas.gl),
        modelMatrix: new Matrix4(),
        modelviewMatrix: new Matrix4(),
		currentlyPressedKeys: [],
		lastTime: 0,
		animation: {     //Hjelpeobjekt som holder på animasjonsinfo:
            earthRotationAngle: 0,
            earthRotationsSpeed: 15,  //Betyr: jorda roterer 15 grader per sekund, dvs. en hel rotasjon tar 6 sekunder.
            moonRotationAngle:0,
            moonOrbitAngle: 0,
            moonTranslation: 10,
            moonRotationsSpeed: 15,   //Betyr: månen roterer 15 grader per sekund, dvs. en hel rotasjon tar 6 sekunder.
            moonOrbitSpeed: 60,       //Betyr: månen roterer 60 grader per sekund om jorda, dvs. en hel runde tar 6 sekunder.
		},
		fpsInfo: {  // Brukes til å beregne og vise FPS (Frames Per Seconds):
            frameCount: 0,      // Antall frames siden forrige visning.
            elapsedTotal: 0     // Sum forløpt tid (sek.) siden forrige visning.
		}
	};

	initKeyPress(renderInfo.currentlyPressedKeys);
	const camera = new Camera(renderInfo.gl, renderInfo.currentlyPressedKeys);
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
			vertexColor: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexColor'),
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uProjectionMatrix'),
			modelViewMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uModelViewMatrix'),
		},
	};
}

/**
 * Oppretter verteksbuffer for koordinatsystemet.
 * 6 vertekser, 2 for hver akse.
 * Tegnes vha. gl.LINES
 * Et posisjonsbuffer og et fargebuffer.
 * MERK: Må være likt antall posisjoner og farger.
 */
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
 * Oppretter verteksbuffer for trekanten.
 * Et posisjonsbuffer og et fargebuffer.
 * MERK: Må være likt antall posisjoner og farger.
 */
function initPlanetBuffers(gl) {
	const width =  5;
	const height =  5;

	const positions = new Float32Array([
		0.0,        height/2,   0.0,    // X Y Z
		-width/2,   -height/2,  0.0,    // X Y Z
		width/2,    -height/2,  0.0     // X Y Z
	]);

	const colors = new Float32Array([
		1, 0.3, 0, 1,   //R G B A
		1, 0.3, 0, 1,   //R G B A
		1, 0.3, 0, 1,   //R G B A
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
 * Aktiverer position-bufferet.
 * Kalles fra draw()
 */
function connectPositionAttribute(gl, baseShader, positionBuffer) {
	const numComponents = 3;
	const type = gl.FLOAT;
	const normalize = false;
	const stride = 0;
	const offset = 0;
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.vertexAttribPointer(
		baseShader.attribLocations.vertexPosition,
		numComponents,
		type,
		normalize,
		stride,
		offset);
	gl.enableVertexAttribArray(baseShader.attribLocations.vertexPosition);
}

/**
 * Aktiverer color-bufferet.
 * Kalles fra draw()
 */
function connectColorAttribute(gl, baseShader, colorBuffer) {
	const numComponents = 4;
	const type = gl.FLOAT;
	const normalize = false;
	const stride = 0;
	const offset = 0;
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.vertexAttribPointer(
		baseShader.attribLocations.vertexColor,
		numComponents,
		type,
		normalize,
		stride,
		offset);
	gl.enableVertexAttribArray(baseShader.attribLocations.vertexColor);
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
    // Beregner og viser fps:
    calculateFps(elapsed, renderInfo.fpsInfo);

	renderInfo.animation.earthRotationAngle += (renderInfo.animation.earthRotationsSpeed * elapsed);
	renderInfo.animation.earthRotationAngle %= 360;

	renderInfo.animation.moonRotationAngle += (renderInfo.animation.moonRotationsSpeed * elapsed);
	renderInfo.animation.moonRotationAngle %= 360;

	renderInfo.animation.moonOrbitAngle += (renderInfo.animation.moonOrbitSpeed * elapsed);
	renderInfo.animation.moonOrbitAngle %= 360;

	camera.handleKeys(elapsed);

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
        // Nullstiller tellere:
        fpsInfo.frameCount = 0;
        fpsInfo.elapsedTotal = 0;
    }
}


/**
 * Tegner!
 */
function draw(currentTime, renderInfo, camera) {
	clearCanvas(renderInfo.gl);
	// Tegn koordinatsystemet:
	drawCoord(renderInfo, camera);
	// Tegner planetene:
	drawSolarSystem(renderInfo, camera);
}

function drawCoord(renderInfo, camera) {
    const gl = renderInfo.gl;
    // Aktiver shader:
    gl.useProgram(renderInfo.baseShader.program);

    // Kople posisjon og farge-attributtene til tilhørende buffer:
    connectPositionAttribute(gl, renderInfo.baseShader, renderInfo.coordBuffers.position);
    connectColorAttribute(gl, renderInfo.baseShader, renderInfo.coordBuffers.color);
    // MODEL:
    renderInfo.modelMatrix.setIdentity();
    // MODELVIEW:
    renderInfo.modelviewMatrix.set(camera.viewMatrix);
    renderInfo.modelviewMatrix.multiply(renderInfo.modelMatrix);

    // Send kameramatrisene til shaderen:
    gl.uniformMatrix4fv(renderInfo.baseShader.uniformLocations.modelViewMatrix, false, renderInfo.modelviewMatrix.elements);
    gl.uniformMatrix4fv(renderInfo.baseShader.uniformLocations.projectionMatrix, false, camera.projectionMatrix.elements);
    // Tegn coord:
    gl.drawArrays(gl.LINES, 0, renderInfo.coordBuffers.vertexCount);
}


function drawSolarSystem(renderInfo, camera) {
    const gl = renderInfo.gl;
	// Aktiver shader:
	gl.useProgram(renderInfo.baseShader.program);

	// Kople posisjon og farge-attributtene til tilhørende buffer:
	connectPositionAttribute(gl, renderInfo.baseShader, renderInfo.planetsBuffer.position);
	connectColorAttribute(gl, renderInfo.baseShader, renderInfo.planetsBuffer.color);

	drawEarth(renderInfo, camera);
	drawMoon(renderInfo, camera);
}

function drawEarth(renderInfo, camera) { //, baseShader, planetsBuffer, planetsAnimation) {
    const gl = renderInfo.gl;
    // MODEL:
    renderInfo.modelMatrix.setIdentity();
	// Roter kun om egen y-akse:
    renderInfo.modelMatrix.rotate(renderInfo.animation.earthRotationAngle, 0, 1, 0);
    // MODELVIEW:
    renderInfo.modelviewMatrix.set(camera.viewMatrix);
    renderInfo.modelviewMatrix.multiply(renderInfo.modelMatrix);

	// Send kameramatrisene til shaderen:
	gl.uniformMatrix4fv(renderInfo.baseShader.uniformLocations.modelViewMatrix, false, renderInfo.modelviewMatrix.elements);
	gl.uniformMatrix4fv(renderInfo.baseShader.uniformLocations.projectionMatrix, false, camera.projectionMatrix.elements);
	// Tegn jorda:
	gl.drawArrays(gl.TRIANGLES, 0, renderInfo.planetsBuffer.vertexCount);

}

function drawMoon(renderInfo, camera) { //(gl, camera, baseShader, planetsBuffer, planetsAnimation) {
    const gl = renderInfo.gl;
    // MODEL:
    renderInfo.modelMatrix.setIdentity();
	//Baneberegning / Orbit:
    renderInfo.modelMatrix.rotate(renderInfo.animation.moonOrbitAngle, 0, 1, 0);    //Går i "bane" om y-aksen.
    renderInfo.modelMatrix.translate(0, 0, renderInfo.animation.moonTranslation);	//Flytt langs z-aksen.
	//Roter først om egen y-akse:
    renderInfo.modelMatrix.rotate(renderInfo.animation.moonRotationAngle, 0, 1, 0); //Roterer om origo. Y-aksen.
	//Skalerer likt i alle akser:
    renderInfo.modelMatrix.scale(0.5, 0.5, 0.5);
    // MODELVIEW:
    renderInfo.modelviewMatrix.set(camera.viewMatrix);
    renderInfo.modelviewMatrix.multiply(renderInfo.modelMatrix);

    // Send kameramatrisene til shaderen:
	gl.uniformMatrix4fv(renderInfo.baseShader.uniformLocations.modelViewMatrix, false, renderInfo.modelviewMatrix.elements);
	gl.uniformMatrix4fv(renderInfo.baseShader.uniformLocations.projectionMatrix, false, camera.projectionMatrix.elements);
	// Tegn månen:
	gl.drawArrays(gl.TRIANGLES, 0, renderInfo.planetsBuffer.vertexCount);
}
