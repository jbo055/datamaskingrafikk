import {WebGLShader} from './WebGLShader.js';

/**
 * Standard/enkel shader: posisjon, farge og tekstur.
 * Shaderkoden ligger i script-tagger i index.html.
 */
export function initBaseShaders(gl) {
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

/**
 * Egen shader for koordinataksene, som bruker farge per vertex
 * og en ferdig sammenganget modelview-matrise.
 */
export function initCoordShaders(gl) {
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
