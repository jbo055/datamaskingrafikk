import {WebGLCanvas} from '../../../base/helpers/WebGLCanvas.js';
import {WebGLShader} from '../../../base/helpers/WebGLShader.js';
import {Camera} from "../../../base/helpers/Camera.js";
import {Stack} from "../../../base/helpers/Stack.js";

/**
 * Et WebGL-program som tegner en 2D "papirmann".
 * Bruker en egen Stack-klasse.
 * Bruker en egen Camera-klasse som håndterer view, viewmodel og projection-matrisene.
 */

export function main() {
	// Oppretter et webGLCanvas for WebGL-tegning:
	const webGLCanvas = new WebGLCanvas('myCanvas', document.body, 960, 640);
	// Hjelpeobjekt som holder på objekter som trengs for rendring:
	const renderInfo = {
		gl: webGLCanvas.gl,
		baseShader: initBaseShaders(webGLCanvas.gl),
        coordShader: initCoordShaders(webGLCanvas.gl),

        coordBuffers: initCoordBuffers(webGLCanvas.gl),
		rectangleBuffer: initRectangleBuffers(webGLCanvas.gl),

        modelMatrix: new Matrix4(),
        modelviewMatrix: new Matrix4(),
		currentlyPressedKeys: [],
		stack: new Stack(),
		lastTime: 0,
		fpsInfo: {  // Brukes til å beregne og vise FPS (Frames Per Seconds):
            frameCount: 0,      // Antall frames siden forrige visning.
            elapsedTotal: 0     // Sum forløpt tid (sek.) siden forrige visning.
		},
		animation: {
			leftShoulderRotation: 0,
            rightShoulderRotation: 0,
            thighRotation: 15,
            kneeRotation: -15
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
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uProjectionMatrix'),
			modelMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uModelMatrix'),
			viewMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uViewMatrix'),
			fragmentColor: gl.getUniformLocation(glslShader.shaderProgram, 'uFragmentColor'),
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
 * Oppretter verteksbuffer for rektanglet.
 * MERK: Må være likt antall posisjoner og farger.
 */
function initRectangleBuffers(gl) {
	const positions = new Float32Array([
		-1,1,0,
		-1,-1,0,
		1,-1,0,
		1,-1,0,
		1,1,0,
		-1,1,0
	]);

	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	return  {
		position: positionBuffer,
		vertexCount: positions.length/3
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

function connectColorUniform(gl, baseShader, colorRGBA) {
	gl.uniform4f(baseShader.uniformLocations.fragmentColor, colorRGBA[0],colorRGBA[1],colorRGBA[2],colorRGBA[3]);
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

	camera.handleKeys(elapsed);
	handleKeys(renderInfo);

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
    drawCoord(renderInfo, camera);
	drawPaperMan(renderInfo, camera);
    // Med balansert push/pop skal stacken alltid være tom her, men for sikkerhets skyld:
    if (renderInfo.stack.size() !== 0) {
        console.warn('Ubalansert matrisestack (tømmer):', renderInfo.stack.size());
        renderInfo.stack.empty();
    }
}

function drawPaperMan(renderInfo, camera) {
    const gl = renderInfo.gl;
    gl.useProgram(renderInfo.baseShader.program);
    connectPositionAttribute(gl, renderInfo.baseShader, renderInfo.rectangleBuffer.position);

    // ROTA: hele papirmannens plassering i verden.
    // Flytt/roter/skaler HER, så følger alle kroppsdeler med.
    let modelMatrix = new Matrix4();
    modelMatrix.setIdentity();
    //modelMatrix.translate(-10, 3, -10);
    //modelMatrix.scale(0.5, 0.5, 0.5);

    renderInfo.stack.pushMatrix(modelMatrix);  // PUSH rot
    //TORSO: Barn av ROTA, tegnes med ROT-matrisa:
    drawPart(renderInfo, camera, 4, 6, [1.0, 1.0, 0.0, 1.0]);

    drawNeckAndHead(renderInfo, camera);
    drawArm(renderInfo, camera,  1);
    drawArm(renderInfo, camera, -1);
    drawLeg(renderInfo, camera,  1);
    drawLeg(renderInfo, camera, -1);
    renderInfo.stack.popMatrix();               // POP rot -> stacken er tom igjen
}

function drawNeckAndHead(renderInfo, camera) {
    // HALS: koples til toppen av torsoen.
    let modelMatrixCopy = renderInfo.stack.peekMatrix();     // Henter kopi av torso-matrisen.
    modelMatrixCopy.translate(0, 6, 0);                      // Flytt halsen opp

    renderInfo.stack.pushMatrix(modelMatrixCopy);            // PUSH halsmatrise
    drawPart(renderInfo, camera, 0.6, 1, [0.0, 1.0, 0.0, 1.0]);

    //HODET: koples til toppen av halsen.
    // Henter en kopi av torso-matrisen.
    modelMatrixCopy = renderInfo.stack.peekMatrix();
    modelMatrixCopy.translate(0, 3, 0);
    renderInfo.stack.pushMatrix(modelMatrixCopy);    // PUSH hodematrise
    drawPart(renderInfo, camera, 2, 2, [0.8, 0.0, 0.3, 1.0]);
    renderInfo.stack.popMatrix();                    // POP hodematrise
    renderInfo.stack.popMatrix();                    // POP halsmatrise
}

function drawArm(renderInfo, camera, leftRight) {
    //OVERARM: koples til øvre høyre eller venstre del av torsoen.
    //Henter en kopi av torso-matrisen:
    let modelMatrixCopy = renderInfo.stack.peekMatrix();
    //3. Flytt rotert overarm opp og til venstre/høyre (skulderleddet):
    modelMatrixCopy.translate(4 * leftRight, 6, 0);
    //2. Roter om overarmens venstre/høyre kant:
    let shoulderRotation = renderInfo.animation.rightShoulderRotation;
    if (leftRight==-1)
        shoulderRotation = renderInfo.animation.leftShoulderRotation;
    modelMatrixCopy.rotate(shoulderRotation, 0, 0, 1);
    //1. Translerer (venstre/høyre) lik halvparten av overarmens lengde:
    modelMatrixCopy.translate(2 * leftRight, 0, 0);
    renderInfo.stack.pushMatrix(modelMatrixCopy);   // PUSH overarmsmatrisen.
    drawPart(renderInfo, camera, 2, 0.5, [0.3, 0.0, 0.8, 1.0]);

    //UNDERARM: koples til overarmen.
    //Henter en kopi av overarms-matrisen:
    modelMatrixCopy = renderInfo.stack.peekMatrix();
    //3. Flytt rotert underarm til albueleddet:
    modelMatrixCopy.translate(2 * leftRight, 0, 0);
    //2. Roter om underarmens venstre/høyre kant:
    modelMatrixCopy.rotate(-60, 0, 0, 1);
    //1. Translerer (venstre/høyre) lik halvparten av underarmens lengde:
    modelMatrixCopy.translate(2 * leftRight, 0, 0);
    renderInfo.stack.pushMatrix(modelMatrixCopy);        // PUSH underarmsmatrisen.
    drawPart(renderInfo, camera, 2, 0.5, [0.8, 0.4, 0.2, 1.0]);

    //FINGRENE: tre barn av underarmen, samme oppskrift, ulik vinkel.
    for (const fingerAngle of [-30, 0, 30]) {
        modelMatrixCopy = renderInfo.stack.peekMatrix();
        modelMatrixCopy.translate(2 * leftRight, 0, 0);
        modelMatrixCopy.rotate(fingerAngle, 0, 0, 1);
        modelMatrixCopy.translate(1 * leftRight, 0, 0);

        renderInfo.stack.pushMatrix(modelMatrixCopy);   // PUSH fingermatrise.
        drawPart(renderInfo, camera, 1, 0.15, [0.1, 0.9, 0.7, 1.0]);
        renderInfo.stack.popMatrix();   // POP fingermatrise.
    }
    renderInfo.stack.popMatrix();   // POP underarmsmatrise.
    renderInfo.stack.popMatrix();   // POP overarmsmatrise.
}

function drawLeg(renderInfo, camera, leftRight) {
    //LÅR: barn av torso, koples til nederste høyre eller venstre hjørne av torsoen (torsoen er 8 bred, 12 høy).
    //Henter en kopi av torso-matrisen (forøvrig samme mønster som armene):
    let modelMatrixCopy = renderInfo.stack.peekMatrix();
    modelMatrixCopy.translate(2 * leftRight, -6, 0);    // flytt i korrekt posisjon.
    modelMatrixCopy.rotate((-90 * leftRight) + (leftRight*renderInfo.animation.thighRotation), 0, 0, 1);  // roter
    modelMatrixCopy.translate(3 * leftRight, 0, 0);     // flytt til lårets senter.

    renderInfo.stack.pushMatrix(modelMatrixCopy);       // PUSH lårmatrise.
    drawPart(renderInfo, camera, 3, 1, [0.3, 0.0, 0.8, 1.0]);

    //KNE: barn av låret.
    modelMatrixCopy = renderInfo.stack.peekMatrix();
    modelMatrixCopy.translate(3 * leftRight, 0, 0);     // flytt i korrekt posisjon.
    modelMatrixCopy.rotate(renderInfo.animation.kneeRotation * leftRight, 0, 0, 1); // roter kneleddet
    modelMatrixCopy.translate(3 * leftRight, 0, 0);     // flytt ut til leggens senter

    renderInfo.stack.pushMatrix(modelMatrixCopy);       // PUSH leggmatrise.
    drawPart(renderInfo, camera, 3, 1, [0.8, 0.4, 0.2, 1.0]);
    renderInfo.stack.popMatrix();                       // POP leggmatrise,
    renderInfo.stack.popMatrix();                       // POP lårmatrise.
}

/**
 * Skalerer rektanglet til ønsket størrelse basert på scaleX og scaleY.
 * Merk at vi bruker en KOPI av matrisen som ligger øverst på stacken slik at
 * skaleringa kun påvirker dette rektanglet. Sikrer at skaleringa
 * ikke påvirker matrisa som ligger på toppen av stacken, og som ev.
 * brukes videre av andre "barn" av aktuell kroppsdel.
 */
function drawPart(renderInfo, camera, scaleX, scaleY, colorRGBA) {
    let modelMatrixCopy = renderInfo.stack.peekMatrix();
    modelMatrixCopy.scale(scaleX, scaleY, 1);
    drawRectangle(renderInfo, modelMatrixCopy, camera, colorRGBA);
}

/**
 * Tegner rektanglet med gitt transformasjon, kamera og farge.
 */
function drawRectangle(renderInfo, modelMatrix, camera, colorRGBA) {
    const gl = renderInfo.gl;

    // Setter farge (ved å endre verdien på en uniform-variabel):
    connectColorUniform(gl, renderInfo.baseShader, colorRGBA);

    // MODEL:
    renderInfo.modelMatrix.set(modelMatrix);

    // MERK: Sender model- OG view-matrisene, i tillegg til projeksjonsmatrisen, til shaderen:
    gl.uniformMatrix4fv(renderInfo.baseShader.uniformLocations.modelMatrix, false, renderInfo.modelMatrix.elements);
    gl.uniformMatrix4fv(renderInfo.baseShader.uniformLocations.viewMatrix, false, camera.viewMatrix.elements);
    gl.uniformMatrix4fv(renderInfo.baseShader.uniformLocations.projectionMatrix, false, camera.projectionMatrix.elements);
    // Tegn:
    gl.drawArrays(gl.TRIANGLES, 0, renderInfo.rectangleBuffer.vertexCount);
}

function handleKeys(renderInfo) {

    // Venstre skulderledd:
	if (renderInfo.currentlyPressedKeys['KeyF']) {
		renderInfo.animation.leftShoulderRotation += 1;
	}
	if (renderInfo.currentlyPressedKeys['KeyG']) {
		renderInfo.animation.leftShoulderRotation -= 1;
	}

    // Høyre skulderledd:
    if (renderInfo.currentlyPressedKeys['KeyH']) {
        renderInfo.animation.rightShoulderRotation += 1;
    }
    if (renderInfo.currentlyPressedKeys['KeyJ']) {
        renderInfo.animation.rightShoulderRotation -= 1;
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