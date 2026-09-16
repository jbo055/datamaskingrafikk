import {WebGLCanvas} from '../../../base/helpers/WebGLCanvas.js';
import {WebGLShader} from '../../../base/helpers/WebGLShader.js';
import {Camera} from '../../../base/helpers/Camera.js';
/**
 * Et WebGL-program som tegner en enkel torus.
 */

export function main() {
	// Oppretter et canvas for WebGL-tegning:
	const canvas = new WebGLCanvas('myCanvas', document.body, 960, 640);

	// Starter med å laste teksturer:

	// Hjelpeobjekt som holder på objekter som trengs for rendring:
	const renderInfo = {
		gl: canvas.gl,
		baseShader: initBaseShaders(canvas.gl),
		rectangleShader: initRectangleShaders(canvas.gl),
		coordBuffers: initCoordBuffers(canvas.gl),
		rectangleBuffers: initRectangleBuffers(canvas.gl),
        modelMatrix: new Matrix4(),
        modelviewMatrix: new Matrix4(),
		currentlyPressedKeys: [],
	};

	initKeyPress(renderInfo);
	const camera = new Camera(renderInfo.gl, renderInfo.currentlyPressedKeys);
	camera.camPosX = 1.5;
	camera.camPosY = 5;
	camera.camPosZ = 12;
	animate( 0, renderInfo, camera);
}

/**
 * Knytter tastatur-evnents til eventfunksjoner.
 */
function initKeyPress(renderInfo) {
	document.addEventListener('keyup', (event) => {
		renderInfo.currentlyPressedKeys[event.code] = false;
	}, false);
	document.addEventListener('keydown', (event) => {
		renderInfo.currentlyPressedKeys[event.code] = true;
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

function initRectangleShaders(gl) {
	// Leser shaderkode fra HTML-fila: Standard/enkel shader (posisjon og farge):
	let vertexShaderSource = document.getElementById('rectangle-vertex-shader').innerHTML;
	let fragmentShaderSource = document.getElementById('rectangle-fragment-shader').innerHTML;

	// Initialiserer  & kompilerer shader-programmene;
	const glslShader = new WebGLShader(gl, vertexShaderSource, fragmentShaderSource);

	// Samler all shader-info i ET JS-objekt, som returneres.
	return  {
		program: glslShader.shaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexPosition')
		},
		uniformLocations: {
			fragmentColor: gl.getUniformLocation(glslShader.shaderProgram, 'uFragmentColor'),
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
		1,0,0,1,   //R G B A
		1,0,0,1,   //R G B A
		0,1,0,1,   //R G B A
		0,1,0,1,   //R G B A
		0,0,1,1,   //R G B A
		0,0,1,1,   //R G B A
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

function initRectangleBuffers(gl) {
	let positions = [
		//Forsiden (pos):
		-1, 1, 1,
		-1,-1, 1,
		1,-1, 1,

		-1,1,1,
		1, -1, 1,
		1,1,1,
	];

	//Bruker ulike farger på hver side:
	let colors = [];
	//Forsiden (RØD)
	let color1 = {red: 1.0, green: 0.0, blue: 0.0, alpha: 0.7}
	for (let i = 0; i < 6; i++) {
		colors.push(color1.red, color1.green, color1.blue, color1.alpha);
	}

	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	const colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	return  {
		position: positionBuffer,
		color: colorBuffer,
		vertexCount: positions.length/3,
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
 * Aktiverer color-uniform
 */
function connectColorUniform(gl, shaderInfo, colorRGBA) {
	//let colorRGBA = [1.0, 0.0, 0.5, 1.0];
	gl.uniform4f(shaderInfo.uniformLocations.fragmentColor, colorRGBA[0],colorRGBA[1],colorRGBA[2],colorRGBA[3]);
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
 * Tegner!
 */
function draw(currentTime, renderInfo, camera) {
	clearCanvas(renderInfo.gl);

	// Tegner koordinatsystemet:
	drawCoord(renderInfo, camera);

	//STEG 1: Tegner alle UGJENNOMSIKTIGE (OPAQUE) objekter først:
	//* Deaktiverer blending:
	renderInfo.gl.disable(renderInfo.gl.BLEND);
	//* Tegner:
    drawOpaqueObjects(renderInfo, camera);

	//STEG 2: Tegner alle GJENNOMSIKTIGE objekter, i rekkefølgen innerst til ytterst:
	//* Enabler blending:
	renderInfo.gl.enable(renderInfo.gl.BLEND);
	renderInfo.gl.blendFunc(renderInfo.gl.SRC_ALPHA, renderInfo.gl.ONE_MINUS_SRC_ALPHA);
	//* Slår AV depthMask (endrer dermed ikke DEPTH-BUFFER):
	renderInfo.gl.depthMask(false);
	//* Tegner:
	drawTransparentObjects(renderInfo, camera);
	//* Slår PÅ depthMask (dybdebufferet oppdateres):
	renderInfo.gl.depthMask(true);
}

/**
 * Tegner ugjennomsiktige rekatngler. Disse kan tegnes i vilkårlig rekkefølge.
 */
function drawOpaqueObjects(renderInfo, camera) {
	// Liste med ønskede posisjoner og farger for ikke-gjennomsiktige objekter/kuber:
	let rectanglesToDraw = [];
	rectanglesToDraw.push(
		{pos: {x: 1, y: 0, z: 5}, color:  {r: 1.0, g: 1.0, b: 1.0, a: 1.0}},
		{pos: {x: 1, y: 0, z: 1}, color:  {r: 1.0, g: 1.0, b: 0.0, a: 1.0}},
		{pos: {x: 1, y: 0, z: -3}, color: {r: 0.0, g: 1.0, b: 0.0, a: 1.0}},
		{pos: {x: 1, y: 0, z: -7}, color: {r: 0.0, g: 0.0, b: 1.0, a: 1.0}},
	);

	for (let i = 0; i < rectanglesToDraw.length; i++) {
		renderInfo.modelMatrix.setIdentity();
        renderInfo.modelMatrix.translate(rectanglesToDraw[i].pos.x, rectanglesToDraw[i].pos.y, rectanglesToDraw[i].pos.z);
		drawRectangle(renderInfo, camera, rectanglesToDraw[i].color);
	}
}

/**
 * Tegner gjennomsiktige kuber. Disse må tegnes i riktig rekkefølge.
 */
function drawTransparentObjects(renderInfo, camera) {
	// Liste med ønskede posisjoner for transparente objekter/kuber:
    let objectsToDraw = [];
    objectsToDraw.push(
        {
            pos: {x: 0, y: 0, z: -5},
            color: {r: 1.0, g: 0.0, b: 0, a: 0.5}
        },
        {
            pos: {x: 0, y: 0, z: -1},
            color: {r: 1.0, g: 0.0, b: 0, a: 0.5}
        },
        {
            pos: {x: 0, y: 0, z: 3},
            color: {r: 1.0, g: 0.0, b: 0, a: 0.5}
        },
    );
    // For å kunne få med avstand fra kamera lages her et nytt array der denne avstanden beregnes
    // basert på posisjonene gitt i objectsToDraw. Man kan ikke sette dist: distanceFromCamera(camera, objectsToDraw[i].pos)
    // i objectsToDraw, da pos ikke er definert på det tidspunktet.
    let objectsToDrawWithDistanceToCamera = [];
    for (let i=0; i < objectsToDraw.length; i++) {
        objectsToDrawWithDistanceToCamera.push(
            {pos: objectsToDraw[i].pos, color: objectsToDraw[i].color, dist: distanceFromCamera(camera, objectsToDraw[i].pos)}
        );
    }
    // Sorterer transparente objekter basert på avstanden fra kamera.
    // Merk: Bruker sentrum av objektet, som ikke nødvendigvis alltid blir helt korrekt.
    objectsToDrawWithDistanceToCamera.sort((distFromCam1, distFromCam2) => compare(distFromCam1.dist, distFromCam2.dist));

	// Tegner de sorterte objektene i rekkefølge, innerst til ytterst:
	for (let i = 0; i < objectsToDrawWithDistanceToCamera.length; i++) {
		renderInfo.modelMatrix.setIdentity();
        renderInfo.modelMatrix.translate(objectsToDrawWithDistanceToCamera[i].pos.x, objectsToDrawWithDistanceToCamera[i].pos.y, objectsToDrawWithDistanceToCamera[i].pos.z);
		drawRectangle(renderInfo, camera, objectsToDrawWithDistanceToCamera[i].color);
	}
}

/**
 * Funksjonen sammenlikner to nærliggende verdier i arrayet som sorteres.
 * Returnerer 1, -1 eller 0 avhengig av sammenlikningen.
 */
function compare( dist1, dist2 ) {
	if (dist1 < dist2 ){
		return 1;
	}
	if ( dist1 > dist2 ){
		return -1;
	}
	return 0;
}

/**
 * Merk: ** betyr eksponent. Eks. 2 ** 3 = 2 * 2 * 2 = 8
 */
function distanceFromCamera(camera, positions) {
	let x = positions.x;
	let y = positions.y;
	let z = positions.z;
	return Math.sqrt((camera.camPosX - x) ** 2 + (camera.camPosY - y) ** 2 + (camera.camPosZ - z) ** 2);
}

function drawRectangle(renderInfo, camera, color) {
    const gl = renderInfo.gl;

	// Aktiver shader:
	gl.useProgram(renderInfo.rectangleShader.program);

	let color1 = [color.r, color.g, color.b, color.a];
	connectColorUniform(gl, renderInfo.rectangleShader, color1);

	// Kople posisjon og farge-attributtene til tilhørende buffer:
	connectPositionAttribute(gl, renderInfo.rectangleShader, renderInfo.rectangleBuffers.position);

    // MODELVIEW:
    renderInfo.modelviewMatrix.set(camera.viewMatrix);
    renderInfo.modelviewMatrix.multiply(renderInfo.modelMatrix);

	gl.uniformMatrix4fv(renderInfo.rectangleShader.uniformLocations.modelViewMatrix, false, renderInfo.modelviewMatrix.elements);
	gl.uniformMatrix4fv(renderInfo.rectangleShader.uniformLocations.projectionMatrix, false, camera.projectionMatrix.elements);

	gl.drawArrays(gl.TRIANGLES, 0, renderInfo.rectangleBuffers.vertexCount);
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
