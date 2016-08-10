import {
    WebGLRenderer,
    Camera,
    Scene,
    Renderer,
    PerspectiveCamera,
    Geometry,
    CubeGeometry,
    MeshBasicMaterial,
    Mesh,
    Vector3,
    Color,
    Math as TMath,
    Quaternion,
    Matrix4,
    Euler
} from "three";

import StereoEffect from "./stereo_effect";
import OrientationControl from "./orientation_control";
import MotionTracker from "./motion_tracker";

export interface WorldCreator {
    (scene: Scene, renderer: Renderer): PerspectiveCamera;
}

export default class VRViewer {
    _renderer: StereoEffect;
    camera: PerspectiveCamera;
    orientationControl: OrientationControl;
    scene: Scene;
    _updateWorld: () => any;

    constructor(container: HTMLElement, motionTracker: MotionTracker, initWorld: WorldCreator, updateWorld: () => any, orientationControl: boolean=true) {
        var viewWidth = container.offsetWidth;
        var viewHeight = container.offsetHeight;
        var webGlRenderer = new WebGLRenderer({
            antialias: true
        });
        this._renderer = new StereoEffect(webGlRenderer);
        this._renderer.setSize(viewWidth, viewHeight);
        // webGlRenderer.shadowMap.enabled = true;
        webGlRenderer.gammaInput = true;
		webGlRenderer.gammaOutput = true;
        container.appendChild(webGlRenderer.domElement);

        this.scene = new Scene();

        this.camera = initWorld(this.scene, webGlRenderer);
        if (orientationControl) {
            this.orientationControl = new OrientationControl(this.camera, motionTracker);
        }
        this.scene.add(this.camera);

        this._updateWorld = updateWorld;
    }

    updateFrame = () => {
        this._updateWorld();
        if (this.orientationControl) {
            this.orientationControl.update();
        }
        this._renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.updateFrame);
    };

    start() {
        this.updateFrame();
    }
}
