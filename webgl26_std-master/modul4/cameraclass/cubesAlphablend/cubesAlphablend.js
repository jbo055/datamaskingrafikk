import {WebGLCanvas} from '../../../base/helpers/WebGLCanvas.js';
import {WebGLShader} from '../../../base/helpers/WebGLShader.js';
import {Camera} from '../../../base/helpers/Camera.js';

export function main() {
	// Oppretter et canvas for WebGL-tegning:
	const canvas = new WebGLCanvas('myCanvas', document.body, 960, 640);

	// Hjelpeobjekt som holder på objekter som trengs for rendring:
	const renderInfo = {
		gl: canvas.gl,
		baseShader: initBaseShaders(canvas.gl),
		cubeShader: initCubeShaders(canvas.gl),
		transparentCubeShader: initTransparentCubeShaders(canvas.gl),
		coordBuffers: initCoordBuffers(canvas.gl),
		cubeBuffers: initCubeBuffers(canvas.gl),
        modelMatrix: new Matrix4(),
        modelviewMatrix: new Matrix4(),
		currentlyPressedKeys: [],
	};

	initKeyPress(renderInfo);
	const camera = new Camera(renderInfo.gl, renderInfo.currentlyPressedKeys);
	camera.camPosX = -1.5;
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

function initCubeShaders(gl) {
	// Leser shaderkode fra HTML-fila: Standard/enkel shader (posisjon og farge):
	let vertexShaderSource = document.getElementById('pos-vertex-shader').innerHTML;
	let fragmentShaderSource = document.getElementById('pos-fragment-shader').innerHTML;

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

function initTransparentCubeShaders(gl) {
	// Leser shaderkode fra HTML-fila: Standard/enkel shader (posisjon og farge):
	let vertexShaderSource = document.getElementById('pos-col-vertex-shader').innerHTML;
	let fragmentShaderSource = document.getElementById('pos-col-fragment-shader').innerHTML;

	// Initialiserer  & kompilerer shader-programmene;
	const glslShader = new WebGLShader(gl, vertexShaderSource, fragmentShaderSource);

	// Samler all shader-info i ET JS-objekt, som returneres.
	return  {
		program: glslShader.shaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexPosition'),
			vertexColor: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexColor')
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

function initCubeBuffers(gl) {
	let positions = [
		//Forsiden (pos):
		-1, 1, 1,
		-1,-1, 1,
		1,-1, 1,

		-1,1,1,
		1, -1, 1,
		1,1,1,

		//Høyre side:
		1,1,1,
		1,-1,1,
		1,-1,-1,

		1,1,1,
		1,-1,-1,
		1,1,-1,

		//Baksiden (pos):
		1,-1,-1,
		-1,-1,-1,
		1, 1,-1,

		-1,-1,-1,
		-1,1,-1,
		1,1,-1,

		//Venstre side:
		-1,-1,-1,
		-1,1,1,
		-1,1,-1,

		-1,-1,1,
		-1,1,1,
		-1,-1,-1,

		//Topp:
		-1,1,1,
		1,1,1,
		-1,1,-1,

		-1,1,-1,
		1,1,1,
		1,1,-1,

		//Bunn:
		-1,-1,-1,
		1,-1,1,
		-1,-1,1,

		-1,-1,-1,
		1,-1,-1,
		1,-1,1,
	];

	//Bruker ulike farger på hver side:
	let colors = [];
	//Forsiden (RØD)
	let color1 = {red: 1.0, green: 0.0, blue: 0.0, alpha: 0.7}
	for (let i = 0; i < 6; i++) {
		colors.push(color1.red, color1.green, color1.blue, color1.alpha);
	}
	//Høyre side ()GRØNN)
	let color2 = {red: 0.0, green: 1.0, blue: 0.0, alpha: 0.7}
	for (let i = 0; i < 6; i++) {
		colors.push(color2.red, color2.green, color2.blue, color2.alpha);
	}
	//Baksiden (BLÅ)
	let color3 = {red: 0.0, green: 0.0, blue: 1.0, alpha: 0.7}
	for (let i = 0; i < 6; i++) {
		colors.push(color3.red, color3.green, color3.blue, color3.alpha);
	}
	//Venstre side (CYAN/LYS BLÅ
	let color4 = {red: 0.0, green: 1.0, blue: 1.0, alpha: 0.7}
	for (let i = 0; i < 6; i++) {
		colors.push(color4.red, color4.green, color4.blue, color4.alpha);
	}
	//Topp (GUL)
	let color5 = {red: 1.0, green: 1.0, blue: 0.0, alpha: 0.7}
	for (let i = 0; i < 6; i++) {
		colors.push(color5.red, color5.green, color5.blue, color5.alpha);
	}
	//Bunn (MAGENTA/LILLA)
	let color6 = {red: 1.0, green: 0.0, blue: 1.0, alpha: 0.7}
	for (let i = 0; i < 6; i++) {
		colors.push(color6.red, color6.green, color6.blue, color6.alpha);
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

/**
 * Tegner!
 */
function draw(currentTime, renderInfo, camera) {
    const gl = renderInfo.gl;
	clearCanvas(gl);
	drawCoord(renderInfo, camera);

	//STEG 1: Tegner alle UGJENNOMSIKTIGE (OPAQUE) objekter først:
	//* Deaktiverer blending:
	gl.disable(gl.BLEND);
	//* Tegner:
	drawOpaqueObjects(renderInfo, camera);

	//STEG 2: Tegner alle GJENNOMSIKTIGE objekter, i rekkefølgen innerst til ytterst:
	//* Enabler blending:
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	//* Slår AV depthMask (endrer dermed ikke DEPTH-BUFFER):
	gl.depthMask(false);
	//* Tegner:
	drawTransparentObjects(renderInfo, camera);
    //* Rydder opp: slår av culling og slår PÅ depthMask (tilbake til standardverdier):
    gl.disable(gl.CULL_FACE);
    gl.depthMask(true);
}

/**
 * Tegner ugjennomsiktige kuber. Disse kan tegnes i vilkårlig rekkefølge.
 */
function drawOpaqueObjects(renderInfo, camera) {
	// Liste med ønskede posisjoner og farger for ikke-gjennomsiktige objekter/kuber:
	let cubesToDraw = [];
	cubesToDraw.push(
		{pos: {x: 1, y: 0, z: 9}, color:  {r: 0.2, g: 0.2, b: 0.2, a: 1.0}},
		{pos: {x: 1, y: 0, z: 3}, color:  {r: 1.0, g: 0.5, b: 0.0, a: 1.0}},
		{pos: {x: 1, y: 0, z: -3}, color: {r: 0.5, g: 0.0, b: 0.5, a: 1.0}},
		{pos: {x: 1, y: 0, z: -9}, color: {r: 0.0, g: 0.0, b: 1.0, a: 1.0}},
	);

	for (let i = 0; i < cubesToDraw.length; i++) {
        renderInfo.modelMatrix.setIdentity();
        renderInfo.modelMatrix.translate(cubesToDraw[i].pos.x, cubesToDraw[i].pos.y, cubesToDraw[i].pos.z);
		drawOpaqueCube(renderInfo, camera, cubesToDraw[i].color);
	}
}

/**
 * Tegner gjennomsiktige kuber. Disse tegnes nå alltid i riktig rekkefølge, basert på kameraavstand.
 * MERK: Bruker også et annet shaderpar for å tegne disse (som bruker verteksfarger):
 */
function drawTransparentObjects(renderInfo, camera) {
	// Liste med ønskede posisjoner for transparente objekter/kuber:
	let cubesToDraw = [];
    cubesToDraw.push(
        {
            pos: {x: 0, y: 0, z: 6}
        },
        {
            pos: {x: 0, y: 0, z: -6}
        },
        {
            pos: {x: 0, y: 0, z: 0}
        }
	);
	// Liste som inneholder kubenes posisjon (pos) og avstand til kamera (dist):
	let cubesToDrawWithDistanceToCamera = [];
    for (let i=0; i < cubesToDraw.length; i++) {
        cubesToDrawWithDistanceToCamera.push(
            {pos: cubesToDraw[i].pos, dist: distanceFromCamera(camera, cubesToDraw[i].pos)}
        );
    }

	// Sorterer transparente objekter basert på avstanden fra kamera.
	// Merk: Bruker sentrum av objektet, som ikke nødvendigvis alltid blir helt korrekt.
	cubesToDrawWithDistanceToCamera.sort((distFromCam1, distFromCam2) => compare(distFromCam1.dist, distFromCam2.dist));

	// Tegner de sorterte objektene i rekkefølge, innerst til ytterst:
	for (let i = 0; i < cubesToDrawWithDistanceToCamera.length; i++) {
		renderInfo.modelMatrix.setIdentity();
        renderInfo.modelMatrix.translate(cubesToDrawWithDistanceToCamera[i].pos.x, cubesToDrawWithDistanceToCamera[i].pos.y, cubesToDrawWithDistanceToCamera[i].pos.z);
		drawTransparentCube(renderInfo, camera);
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

function drawOpaqueCube(renderInfo, camera, color) {
    const gl = renderInfo.gl;
	// Aktiver shader:
	gl.useProgram(renderInfo.cubeShader.program);
	let color1 = [color.r, color.g, color.b, color.a];
	connectColorUniform(gl, renderInfo.cubeShader, color1);
	// Kople posisjon og farge-attributtene til tilhørende buffer:
	connectPositionAttribute(gl, renderInfo.cubeShader, renderInfo.cubeBuffers.position);
    // MODELVIEW:
    renderInfo.modelviewMatrix.set(camera.viewMatrix);
    renderInfo.modelviewMatrix.multiply(renderInfo.modelMatrix);
	gl.uniformMatrix4fv(renderInfo.cubeShader.uniformLocations.modelViewMatrix, false, renderInfo.modelviewMatrix.elements);
	gl.uniformMatrix4fv(renderInfo.cubeShader.uniformLocations.projectionMatrix, false, camera.projectionMatrix.elements);
	gl.drawArrays(gl.TRIANGLES, 0, renderInfo.cubeBuffers.vertexCount);
}

function drawTransparentCube(renderInfo, camera) {
    const gl = renderInfo.gl;
	// Aktiver shader:
	gl.useProgram(renderInfo.transparentCubeShader.program);
	// Kople posisjon og farge-attributtene til tilhørende buffer:
	connectPositionAttribute(gl, renderInfo.transparentCubeShader, renderInfo.cubeBuffers.position);
	connectColorAttribute(gl, renderInfo.transparentCubeShader, renderInfo.cubeBuffers.color);
    // MODELVIEW:
    renderInfo.modelviewMatrix.set(camera.viewMatrix);
    renderInfo.modelviewMatrix.multiply(renderInfo.modelMatrix);
	gl.uniformMatrix4fv(renderInfo.transparentCubeShader.uniformLocations.modelViewMatrix, false, renderInfo.modelviewMatrix.elements);
	gl.uniformMatrix4fv(renderInfo.transparentCubeShader.uniformLocations.projectionMatrix, false, camera.projectionMatrix.elements);

	// Bruker culling for korrekt blending:
	gl.frontFace(gl.CCW);     // Angir vertekser CCW.
	gl.enable(gl.CULL_FACE);  // Aktiverer culling.

	//Tegner baksidene først:
	gl.cullFace(gl.FRONT);    // Skjuler forsider.
	gl.drawArrays(gl.TRIANGLES, 0, renderInfo.cubeBuffers.vertexCount);

	//Tegner deretter forsidene:
	gl.cullFace(gl.BACK);     // Skjuler baksider.
	gl.drawArrays(gl.TRIANGLES, 0, renderInfo.cubeBuffers.vertexCount);

    gl.disable(gl.CULL_FACE);  // Deaktiverer culling.

	//Dette blir feil fordi kube er transparent. Vi må tegne baksidene først, og deretter forsidene:
	//gl.drawArrays(gl.TRIANGLES, 0, renderInfo.cubeBuffers.vertexCount);
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