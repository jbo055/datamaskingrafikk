import {WebGLCanvas} from '../../../base/helpers/WebGLCanvas.js';
import {WebGLShader} from '../../../base/helpers/WebGLShader.js';

/**
 * Et WebGL-program som tegner samme trekant to ganger med ulike transformasjoner
 * og animasjoner.
 * Bruker ikke klasser, kun funksjoner.
 */
export function main() {
    // Oppretter et webGLCanvas for WebGL-tegning:
    const webGLCanvas = new WebGLCanvas('myCanvas', document.body, 960, 640);
    // Hjelpeobjekt som holder på objekter som trengs for rendring:
    const renderInfo = {
        gl: webGLCanvas.gl,
        baseShader: initBaseShaders(webGLCanvas.gl),
        coordBuffers: initCoordBuffers(webGLCanvas.gl),
        rectangleBuffer: initRectangleBuffers(webGLCanvas.gl),
        modelMatrix: new Matrix4(),           // Arbeidsmatriser som gjenbrukes
        modelviewMatrix: new Matrix4(),       // for hver frame.
        currentlyPressedKeys: [],
    };
    const camera = initCamera(webGLCanvas.gl);
    animate( 0, renderInfo, camera);
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

/**
 * Oppretter verteksbuffer for rektanglet.
 * Et posisjonsbuffer og et fargebuffer.
 * MERK: Må være likt antall posisjoner og farger.
 */
function initRectangleBuffers(gl) {
    const positions = new Float32Array([
        -10,0, 10,
        -10,0, -10,
        10,0, -10,
        10,0, -10,
        10,0, 10,
        -10,0, 10
    ]);

    const colors = new Float32Array([
        1, 0.3, 0, 1,   //R G B A
        1, 0.3, 0, 1,   //R G B A
        1, 0.3, 0, 1,   //R G B A
        0, 0.3, 1, 1,   //R G B A
        0, 0.3, 1, 1,   //R G B A
        0, 0.3, 1, 1,   //R G B A
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
 * Genererer view- og projeksjonsmatrisene.
 * Disse utgjør tilsanmmen det virtuelle kameraet.
 */
function initCamera(gl) {
    // Kameraposisjon:
    const camPosX = 0;
    const camPosY = 100;
    const camPosZ = 0;

    // Kamera ser mot ...
    const lookAtX = 0;
    const lookAtY = 0;
    const lookAtZ = 0;

    // Kameraorientering:
    const upX = 0;
    const upY = 0;
    const upZ = -1;

    let viewMatrix = new Matrix4();
    let projectionMatrix = new Matrix4();

    // VIEW-matrisa:
    viewMatrix.setLookAt(camPosX, camPosY, camPosZ, lookAtX, lookAtY, lookAtZ, upX, upY, upZ);
    // PROJECTION-matrisa (frustum): cuon-utils: Matrix4.prototype.setPerspective = function(fovy, aspect, near, far)
    const fieldOfView = 45; // I grader.
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const near = 0.1;
    const far = 1000.0;
    // PROJEKSJONS-matrisa; Bruker cuon-utils: Matrix4.prototype.setPerspective = function(fovy, aspect, near, far)
    projectionMatrix.setPerspective(fieldOfView, aspect, near, far);

    return {
        viewMatrix: viewMatrix,
        projectionMatrix: projectionMatrix
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
    draw(currentTime, renderInfo, camera);
}

function draw(currentTime, renderInfo, camera) {
    const gl = renderInfo.gl;
    clearCanvas(gl);
    drawCoord(renderInfo, camera);
    drawRectangle(renderInfo, camera);
}

function drawRectangle(renderInfo, camera) {
    const gl = renderInfo.gl;
    // Aktiver shader:
    gl.useProgram(renderInfo.baseShader.program);
    // Kople posisjon og farge-attributtene til tilhørende buffer:
    connectPositionAttribute(gl, renderInfo.baseShader, renderInfo.rectangleBuffer.position);
    connectColorAttribute(gl, renderInfo.baseShader, renderInfo.rectangleBuffer.color);
    // MODEL:
    // MODEL: M=I*O*R, der O=R*T
    let orbAngle = 60;
    let orbTrans=20;
    let rotAngle = Math.PI/180;
    // MODEL: M=I*T*O*R*S, der O=R*T
    renderInfo.modelMatrix.setTranslate(0, 0, 20);     //Flytt langs z-aksen.
    renderInfo.modelMatrix.rotate(60, 0, 1, 0);        //Roterer om y-aksen.
    // MODELVIEW:
    // Siden cuon-matrix sin multiply() endrer matrisa den kalles på, kopieres camera.viewMatrix inn i
    // en "arbeidsmatrise", renderInfo.modelviewMatrix, FØR multiplikasjonen med renderInfo.modelMatrix.
    // Dette gjør at camera.viewMatrix ikke endres og kan gjenbrukes neste frame.
    renderInfo.modelviewMatrix.set(camera.viewMatrix);
    renderInfo.modelviewMatrix.multiply(renderInfo.modelMatrix);
    // Send kameramatrisene til shaderen:
    gl.uniformMatrix4fv(renderInfo.baseShader.uniformLocations.modelViewMatrix, false, renderInfo.modelviewMatrix.elements);
    gl.uniformMatrix4fv(renderInfo.baseShader.uniformLocations.projectionMatrix, false, camera.projectionMatrix.elements);
    // Tegn!
    gl.drawArrays(gl.TRIANGLES, 0, renderInfo.rectangleBuffer.vertexCount);
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
