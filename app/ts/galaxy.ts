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
    Euler,
    Clock,
    ShaderMaterial,
    PlaneBufferGeometry,
    Vector2,
    FogExp2,
    PointsMaterial,
    Points,
    SphereGeometry,
    PointLight
} from "three";

import Display from "./display";

var parameters = [
    [
        [0, 1, 0.5], 15
    ],
    [
        [0.95, 2, 0.5], 15
    ],
    [
        [0.90, 3, 0.5], 15
    ],
    [
        [0.85, 4, 0.5], 15
    ],
    [
        [0.80, 5, 0.5], 15
    ]
];

export default class Galaxy {
    pointClouds: Points[];
    added = false;

    constructor() {
        this.pointClouds = [
            new Points(this._genPointGeometry(100), this._genPointMaterial()),
            new Points(this._genPointGeometry(100), this._genPointMaterial()),
            new Points(this._genPointGeometry(100), this._genPointMaterial()),
            new Points(this._genPointGeometry(100), this._genPointMaterial()),
            new Points(this._genPointGeometry(100), this._genPointMaterial()),
            new Points(this._genPointGeometry(100), this._genPointMaterial())
        ];
    }

    _genPointGeometry(numPoint: number) {
        var geo = new Geometry();
        for (var i = 0; i < numPoint; i++) {
            geo.vertices.push(new Vector3(0, 0, Math.floor(Math.random() * 10000) + 20000));
            geo.rotateX(Math.random() * Math.PI * 2);
            geo.rotateY(Math.random() * Math.PI * 2);
            geo.rotateZ(Math.random() * Math.PI * 2);
        }
        return geo;
    }

    _genPointMaterial() {
        return new PointsMaterial({
            color: Math.floor(Math.random() * 0xffffff),
            size: 1,
            sizeAttenuation: false,
            depthTest: false,
            depthWrite: false
        });
    }

    setupScene(display: Display) {
        this.pointClouds.forEach((p) => {
            display.scene.add(p);
        });
    }

    update() {
        this.pointClouds.forEach(function(p, ind) {
            if (Math.random() < 0.9) return;
            (<any>p.material).color.setHSL(Math.random(), 1, Math.random() * 0.5 + 0.5);
        });
    }

    updateScene(display: Display) {
        this.pointClouds.forEach(function(p) {
            p.position.copy(display.camera.position);
        });
    }
}
