import {
    Vector3,
    Quaternion,
    Mesh,
    BoxGeometry,
    MeshBasicMaterial
} from "three";

import Tunnel from "./tunnel";
import MotionTracker from "./motion_tracker";
import Display from "./display";
import PlayerTracker from "./player_tracker";
import Section from "./section";

export interface World {
    tunnel: Tunnel;
}

export interface Control {
    motionTracker: MotionTracker;
}

var yAxis = new Vector3(0, 1, 0);


function sign(num: number) {
    return num < 0 ? 1 : -1;
}

function horizontalRotation(beta: number) {
    return Math.max(0, (Math.PI / 2 - Math.abs(Math.PI / 2 - Math.abs(beta)) - 0.05)) * sign(beta);
}

export default class Player {
    private _position: Vector3;
    private _speed: Vector3;
    private _acceleration: Vector3;
    private _direction: Quaternion;
    private _playerTracker: PlayerTracker;
    private _done = false;

    constructor() {
        this._position = new Vector3(0, 0, 40);
        this._speed = new Vector3(0, 0, 40);
        this._acceleration = new Vector3(0, 0, 5);
        this._direction = new Quaternion();
    }

    setupScene(display: Display) {

    }

    setupPlayerTracker(section: Section) {
        this._playerTracker = new PlayerTracker(section);
    }

    getPlayerTracker() {
        return this._playerTracker;
    }

    update(world: World, control: Control) {
        if (this._playerTracker.isOut()) {
            return;
        }
        var beta = control.motionTracker.getBeta();
        this._acceleration.copy(this._speed).setLength(3);
        this._acceleration.applyAxisAngle(yAxis, horizontalRotation(beta));

        // this._acceleration.z = 0.01;
        this._speed.add(this._acceleration);
        this._speed.clampLength(0, 80);


        this._playerTracker.updateSection(this._position);
        var newPos = this._playerTracker.getAdjusted(
            new Vector3().addVectors(this._position, this._speed));

        this._acceleration.subVectors(newPos, this._position).sub(this._speed).clampLength(0, 5);
        // this._speed.set(newPos.x - this._position.x, newPos.y - this._position.y, newPos.z - this._position.z);
        // this._position.copy(newPos);
        this._speed.add(this._acceleration);
        this._position.add(this._speed);

        this._direction.setFromUnitVectors(
            new Vector3(0, 0, 1),
            this._speed.clone().setY(0).setLength(1));

    }

    updateScene(display: Display) {
        if (this._done) {
            return;
        }
        // display.scene.add(this._playerTracker._boundingShape);
        if (this._playerTracker.isOut()) {
            var mesh = new Mesh(new BoxGeometry(100, 100, 100), new MeshBasicMaterial({color: 0x00ff00}));
            mesh.position.copy(this._position);
            var mesh2 = new Mesh(new BoxGeometry(10, 10, 10), new MeshBasicMaterial({color: 0xff0000}));
            mesh2.position.copy(new Vector3().subVectors(this._position, this._speed));
            display.scene.add(mesh);
            display.scene.add(mesh2);
            display.setCameraPosition(new Vector3().subVectors(this._position, this._speed.setLength(1000)));

            this._done = true;
        } else {
            display.setCameraPosition(this._position);
            display.setCameraDefaultRotation(this._direction);
        }
    }
}
