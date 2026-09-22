/**
 * Beregner og viser FPS.
 * Summerer forløpt tid fra getElapsed() istedenfor å holde på et eget tidsstempel.
 * @param elapsed Forløpt tid (i sekunder) siden forrige frame.
 * @param fpsInfo
 */
export function calculateFps(elapsed, fpsInfo) {
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
