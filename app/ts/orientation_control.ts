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

import MotionTracker from "./motion_tracker";

export default class OrientationControl {
    private _camera: PerspectiveCamera;
    private _motionTracker: MotionTracker;

    private _autoAlign = true;
    private _alignQuaternion: Quaternion;
    private _quaternionLerp: Quaternion;
    private _defaultRotation: Quaternion;


    constructor(camera: PerspectiveCamera, motionTracker: MotionTracker) {
        this._camera = camera;
        this._camera.rotation.reorder('YXZ');

        this._motionTracker = motionTracker;

        this._alignQuaternion = new Quaternion();
        this._quaternionLerp = new Quaternion();
    }

    update() {
        var orientationQuaternion = new Quaternion();
        var quaternion = new Quaternion();
        var tempVector3 = new Vector3();
        var tempMatrix4 = new Matrix4();
        var tempEuler = new Euler(0, 0, 0, 'YXZ');
        var tempQuaternion = new Quaternion();

        var zee = new Vector3(0, 0, 1);
        var up = new Vector3(0, 1, 0);
        var v0 = new Vector3(0, 0, 0);
        var euler = new Euler();
        var q0 = new Quaternion(); // - PI/2 around the x-axis
        var q1 = new Quaternion(- Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));

        euler.set(this._motionTracker.getBeta(), this._motionTracker.getAlpha(), -this._motionTracker.getGamma(), 'YXZ');
        quaternion.setFromEuler(euler);
        this._quaternionLerp.slerp(quaternion, 0.5);
        if (this._autoAlign) orientationQuaternion.copy(quaternion); // interpolation breaks the auto alignment
        else orientationQuaternion.copy(this._quaternionLerp);
        orientationQuaternion.multiply(q1);
        orientationQuaternion.multiply(q0.setFromAxisAngle(zee, - this._motionTracker.getOrient()));

        if (this._autoAlign && this._motionTracker.getAlpha() !== 0) {

            this._autoAlign = false;

            (<any>tempVector3)
            .set(0, 0, -1)
            .applyQuaternion( tempQuaternion.copy(orientationQuaternion).inverse(), 'ZXY' );

            tempEuler.setFromQuaternion(
                tempQuaternion.setFromRotationMatrix(
                    tempMatrix4.lookAt(tempVector3, v0, up)
                )
            );

            tempEuler.set(0, tempEuler.y, 0);
            this._alignQuaternion.setFromEuler(tempEuler);
        }

        this._camera.quaternion.copy(this._defaultRotation);
        this._camera.quaternion.multiply(this._alignQuaternion);
        this._camera.quaternion.multiply(orientationQuaternion);
    }

    setDefaultRotation(quaternion: Quaternion) {
        this._defaultRotation = quaternion;
    }
}
