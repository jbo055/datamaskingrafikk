import {WebGLCanvas} from '../../../base/helpers/WebGLCanvas.js';
import {WebGLShader} from '../../../base/helpers/WebGLShader.js';
import {Camera} from "../../../base/helpers/Camera.js";

/**
 * Demonstrerer alpha-blending.
 */

export function main() {
	// Oppretter et webGLCanvas for WebGL-tegning:
	const webGLCanvas = new WebGLCanvas('myCanvas', document.body, 960, 640);
	// Hjelpeobjekt som holder på objekter som trengs for rendring:
	const renderInfo = {
		gl: webGLCanvas.gl,
		coordShader: initCoordShaders(webGLCanvas.gl),
        rectangleShader: initRectangleShaders(webGLCanvas.gl),

		coordBuffers: initCoordBuffers(webGLCanvas.gl),
		transparentRectangleBuffers: initTransparentRectangleBuffers(webGLCanvas.gl),

        modelMatrix: new Matrix4(),
        modelviewMatrix: new Matrix4(),
		currentlyPressedKeys: [],
		lastTime: 0,
		fpsInfo: {  // Brukes til å beregne og vise FPS (Frames Per Seconds):
            frameCount: 0,      // Antall frames siden forrige visning.
            elapsedTotal: 0     // Sum forløpt tid (sek.) siden forrige visning.
		},
	};

	initKeyPress(renderInfo.currentlyPressedKeys);
	const camera = new Camera(renderInfo.gl, renderInfo.currentlyPressedKeys);
	camera.camPosX = 0;
	camera.camPosY = 0;
	camera.camPosZ = -15;
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
            vertexPosition: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexPosition'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uModelViewMatrix'),
            fragmentColor: gl.getUniformLocation(glslShader.shaderProgram, 'uFragmentColor'),
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
		0, 0, extent,
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
 * Bruker sider som er 4x4 enheter. Tegnes vha. gl.TRIANGLES
 * Et posisjonsbuffer og et fargebuffer.
 * MERK: Må være likt antall posisjoner og farger.
 */
function initTransparentRectangleBuffers(gl) {
	const positions = new Float32Array([
		-2,2,0,
		-2,-2,0,
		2,-2,0,
		2,-2,0,
		2,2,0,
		-2,2,0,
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
 * Aktiverer position-bufferet.
 * Kalles fra draw()
 */
function connectPositionAttribute(gl, coordShader, positionBuffer) {
	const numComponents = 3;
	const type = gl.FLOAT;
	const normalize = false;
	const stride = 0;
	const offset = 0;
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.vertexAttribPointer(
		coordShader.attribLocations.vertexPosition,
		numComponents,
		type,
		normalize,
		stride,
		offset);
	gl.enableVertexAttribArray(coordShader.attribLocations.vertexPosition);
}

/**
 * Aktiverer color-bufferet.
 * Kalles fra draw()
 */
function connectColorAttribute(gl, coordShader, colorBuffer) {
	const numComponents = 4;
	const type = gl.FLOAT;
	const normalize = false;
	const stride = 0;
	const offset = 0;
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.vertexAttribPointer(
		coordShader.attribLocations.vertexColor,
		numComponents,
		type,
		normalize,
		stride,
		offset);
	gl.enableVertexAttribArray(coordShader.attribLocations.vertexColor);
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


function drawCoord(renderInfo, camera) {
	// Aktiver shader:
	renderInfo.gl.useProgram(renderInfo.coordShader.program);

	// Kople posisjon og farge-attributtene til tilhørende buffer:
	connectPositionAttribute(renderInfo.gl, renderInfo.coordShader, renderInfo.coordBuffers.position);
	connectColorAttribute(renderInfo.gl, renderInfo.coordShader, renderInfo.coordBuffers.color);

	let modelMatrix = new Matrix4();
	modelMatrix.setIdentity();
	// Lager en kopi for å ikke påvirke kameramatrisene:
	let viewMatrix = new Matrix4(camera.viewMatrix);
	let modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkefølge!
	// Send kameramatrisene til shaderen:
	renderInfo.gl.uniformMatrix4fv(renderInfo.coordShader.uniformLocations.modelViewMatrix, false, modelviewMatrix.elements);
	renderInfo.gl.uniformMatrix4fv(renderInfo.coordShader.uniformLocations.projectionMatrix, false, camera.projectionMatrix.elements);
	// Tegn coord:
	renderInfo.gl.drawArrays(renderInfo.gl.LINES, 0, renderInfo.coordBuffers.vertexCount);
}

/**
 * Klargjør canvaset.
 * Kalles fra draw()
 */
function clearCanvas(gl) {
	gl.clearColor(1.0, 1.0, 1.0, 1);
	//gl.clearColor(0, 0, 0, 0);
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);  // Nære objekter dekker fjerne objekter.
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

/**
 * Tegner!
 *
 * FRA: https://www.shapediver.com/blog/solving-a-common-webgl-issue-transparency-fixed
 * Usually, a solution would be to first render all opaque objects and let them write to the depth buffer.
 * Afterwards, all transparent objects are rendered from the back to the front without writing to the depth
 * buffer anymore, but still testing against it. This ensures that transparent objects are occluded by
 * opaque objects but not by each other.
 *
 * Although this solution works in most cases, especially when intersecting transparent objects,
 * some issues can still occur in complex situations.
 *      https://www.shapediver.com/blog/solving-a-common-webgl-issue-transparency-fixed
 *
 * MERK: renderInfo.gl.depthMask(false / true);
 *      Denne bestemmer om z-bufferet skal oppdateres eller ikke.
 */
function draw(currentTime, renderInfo, camera) {
    const gl = renderInfo.gl;
	clearCanvas(gl);
    drawCoord(renderInfo, camera);

    // Aktiver shader for å tegne rektangler:
    renderInfo.gl.useProgram(renderInfo.rectangleShader.program);

    // Aktiverer blending, og setter blend-funksjon. Dette gjør at farger blandes basert på alpha-verdien.:
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    //DrawTransparentObjects(renderInfo, camera);
    SortAndDrawTransparentObjects(renderInfo, camera);
}

/**
 * Tegner gjennomsiktige kvadrater.
 * Disse tegnes nå alltid i riktig rekkefølge, basert på kameraavstand.
 */
function SortAndDrawTransparentObjects(renderInfo, camera) {
    const gl = renderInfo.gl;
    const ALPHA = 0.7;
    //Slår på/av depthMask:
    gl.depthMask(true);

    // Liste med kvadrater som skal tegnes.
    // Et kvadrat er her representert vha. en posisjon og en farge.
    // Elementene i squaresToDraw kan legges til i vilkårlig rekkefølge, men vil bli sortert basert på avstand fra kamera.
    let squaresToDraw = [];
    squaresToDraw.push(
        {
            pos: {x: 1, y: 1, z: 0},
            color:{red:0.0, green:1.0, blue:0.0, alpha:ALPHA}
        },
        {
            pos: {x: 0, y: 0, z: -2},
            color: {red:1.0, green:0.0, blue:0.0, alpha:ALPHA}
        },
        {
            pos: {x: 2, y: 2, z: 2},
            color:{red:0.0, green:0.0, blue:1.0, alpha:ALPHA}
        },
    );
    // For å kunne få med avstand fra kamera lages her et nytt array der denne avstanden beregnes
    // basert på posisjonene gitt i squaresToDraw. Man kan ikke sette dist: distanceFromCamera(camera, squaresToDraw[i].pos)
    // i squaresToDraw, da pos ikke er definert på det tidspunktet.
    let squaresToDrawWithDistanceToCamera = [];
    for (let i=0; i < squaresToDraw.length; i++) {
        squaresToDrawWithDistanceToCamera.push(
            {pos: squaresToDraw[i].pos, color: squaresToDraw[i].color, dist: distanceFromCamera(camera, squaresToDraw[i].pos)}
        );
    }

    // Sorterer transparente objekter basert på avstanden fra kamera.
    // Merk: Bruker sentrum av objektet, som ikke nødvendigvis alltid blir helt korrekt.
    squaresToDrawWithDistanceToCamera.sort((distFromCam1, distFromCam2) => compare(distFromCam1.dist, distFromCam2.dist));

    // Tegner de sorterte kvadratene i rekkefølge, innerst til ytterst:
    for (let i = 0; i < squaresToDrawWithDistanceToCamera.length; i++) {
        renderInfo.modelMatrix.setIdentity();
        renderInfo.modelMatrix.translate(squaresToDrawWithDistanceToCamera[i].pos.x, squaresToDrawWithDistanceToCamera[i].pos.y, squaresToDrawWithDistanceToCamera[i].pos.z);
        drawTransparentSquare(renderInfo, camera, squaresToDrawWithDistanceToCamera[i].color);
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

/**
 * Tegner gjennomsiktige kvadrater.
 * Disse tegnes i gitt rekkefølge.
 * Endres rekkefølgen, endres også hvordan de blandes.
 */
function DrawTransparentObjects(renderInfo, camera) {
    const gl = renderInfo.gl;
    const ALPHA = 0.7;
    //** Slår av/på depthMask:
    gl.depthMask(false);

    //**A (rødt):
    renderInfo.modelMatrix.setIdentity();
    renderInfo.modelMatrix.translate(0, 0, -2);
    drawTransparentSquare(renderInfo, camera,{red:1.0, green:0.0, blue:0.0, alpha:ALPHA});

    //**B (grønt):
    renderInfo.modelMatrix.setIdentity();
    renderInfo.modelMatrix.translate(1, 1, 0);
    drawTransparentSquare(renderInfo, camera, {red:0.0, green:1.0, blue:0.0, alpha:ALPHA});

    //**C (blått):
    renderInfo.modelMatrix.setIdentity();
    renderInfo.modelMatrix.translate(2, 2, 2);
    drawTransparentSquare(renderInfo, camera, {red:0.0, green:0.0, blue:1.0, alpha:ALPHA});
}

function connectColorUniform(gl, shader, color) {
    gl.uniform4f(shader.uniformLocations.fragmentColor, color.red,color.green,color.blue,color.alpha);
}

function drawTransparentSquare(renderInfo, camera, color) {
    const gl = renderInfo.gl;
    connectPositionAttribute(gl, renderInfo.rectangleShader, renderInfo.transparentRectangleBuffers.position);
    // Setter farge (ved å endre verdien på en uniform-variabel):
    connectColorUniform(gl, renderInfo.rectangleShader, color);

    // MODELVIEW:
    renderInfo.modelviewMatrix.set(camera.viewMatrix);
    renderInfo.modelviewMatrix.multiply(renderInfo.modelMatrix);

	// Send kameramatrisene til shaderen:
	gl.uniformMatrix4fv(renderInfo.rectangleShader.uniformLocations.modelViewMatrix, false, renderInfo.modelviewMatrix.elements);
	gl.uniformMatrix4fv(renderInfo.rectangleShader.uniformLocations.projectionMatrix, false, camera.projectionMatrix.elements);

	gl.drawArrays(gl.TRIANGLES, 0, 6);
}