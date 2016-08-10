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

// export var focalLength = ;
export var sep = 1.5;

export default class StereoEffect {
    _renderer: WebGLRenderer;
    private _cameraL: PerspectiveCamera;
    private _cameraR: PerspectiveCamera;
    private _width: number;
    private _height: number;

    constructor(renderer: WebGLRenderer) {
        this._renderer = renderer;
        renderer.autoClear = false;
        this._cameraL = new PerspectiveCamera();
        this._cameraR = new PerspectiveCamera();
    }

    setSize(width: number, height: number) {
        this._width = width;
        this._height = height;
        this._renderer.setSize(width, height);
    }

    render(scene: Scene, camera: PerspectiveCamera) {
        scene.updateMatrixWorld(false);

        if (camera.parent === undefined) camera.updateMatrixWorld(false);

        var focalLength = (<any>camera).getFocalLength();

        var _position = new Vector3();
        var _quaternion = new Quaternion();
        var _scale = new Vector3();
        camera.matrixWorld.decompose(_position, _quaternion, _scale);

        // Stereo frustum calculation

        // Effective fov of the camera
        var _fov = TMath.radToDeg(2 * Math.atan(Math.tan(TMath.degToRad( camera.fov ) * 0.5)));

        var _ndfl = camera.near / focalLength;
        var _halfFocalHeight = Math.tan(TMath.degToRad(_fov) * 0.5) * focalLength;
        var _halfFocalWidth = _halfFocalHeight * 0.5 * camera.aspect;

        var _top = _halfFocalHeight * _ndfl;
        var _bottom = -_top;
        var _innerFactor = (_halfFocalWidth + sep) / (_halfFocalWidth * 2.0);
        var _outerFactor = 1.0 - _innerFactor;

        var _outer = _halfFocalWidth * 2.0 * _ndfl * _outerFactor;
        var _inner = _halfFocalWidth * 2.0 * _ndfl * _innerFactor;

        // left

        this._cameraL.projectionMatrix.makeFrustum(
            -_outer,
            _inner,
            _bottom,
            _top,
            camera.near,
            camera.far
        );

        this._cameraL.position.copy(_position);
        this._cameraL.quaternion.copy(_quaternion);
        this._cameraL.translateX(-sep);

        // right

        this._cameraR.projectionMatrix.makeFrustum(
            -_inner,
            _outer,
            _bottom,
            _top,
            camera.near,
            camera.far
        );

        this._cameraR.position.copy(_position);
        this._cameraR.quaternion.copy(_quaternion);
        this._cameraR.translateX(sep);

        var wid = this._width / 2;

        this._renderer.setViewport(0, 0, this._width, this._height);
		// this._renderer.clear();
        // this._renderer.render(scene, camera);
		this._renderer.clear();
        this._renderer.autoClear = false;

		this._renderer.setViewport(0, 0, wid, this._height);
		this._renderer.render(scene, this._cameraL);

		this._renderer.setViewport(wid, 0, wid, this._height);
		this._renderer.render(scene, this._cameraR);
        this._renderer.autoClear = true;
    }
}
