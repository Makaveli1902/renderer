import { PerspectiveCamera, WebGLRenderer } from "three";

export function resizeRenderingArea(camera: PerspectiveCamera,renderer: WebGLRenderer) {
	if(camera && renderer){
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}
}