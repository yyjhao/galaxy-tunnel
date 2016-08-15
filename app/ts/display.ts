import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    Vector3,
    Quaternion,
    AmbientLight,
    PointLight,
    DirectionalLight,
    SphereBufferGeometry,
    Mesh,
    MeshBasicMaterial,
    SpotLight,
    CubeCamera,
    CubeRefractionMapping,
    CubeTextureLoader
} from "three";

import VRViewer from "./vr_viewer";
import MotionTracker from "./motion_tracker";

export default class Display extends VRViewer {
    light: SpotLight;

    constructor(container: HTMLElement, motionTracker: MotionTracker, update: () => any) {
        var light: SpotLight;
        super(container, motionTracker, (scene: Scene, renderer: WebGLRenderer) => {
            var camera = new PerspectiveCamera(100, window.innerWidth / window.innerHeight, 50, 1000000);
            scene.add(camera);
            scene.add(new AmbientLight(0xffdddd, 0.1))
            camera.position.z = 0;
            camera.lookAt(new Vector3(0, 0, 500));
            light = new SpotLight(0xffffff, 1, 7000, 0.6, 1, 2);
            light.add(new PointLight(0xffffff, 0.4, 5000));
			scene.add(light);

            return camera;
        }, () => {
            update();
        }, !!navigator.userAgent.match(/iPhone/i));
        this.light = light;
    }

    setCameraDefaultRotation(quaternion: Quaternion) {
        if (this.orientationControl) {
            this.orientationControl.setDefaultRotation(quaternion);
        }
    }

    setCameraPosition(position: Vector3) {
        this.camera.position.copy(position);
		this.light.position.copy(position).add(new Vector3(0, 0, 10));
    }
}
