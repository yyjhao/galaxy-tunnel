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
        var beta = control.motionTracker.getBeta();
        this._acceleration.copy(this._speed).divideScalar(30).clampLength(0.1, 3);
        this._acceleration.applyAxisAngle(yAxis, horizontalRotation(beta));

        this._speed.add(this._acceleration);
        this._speed.clampLength(0, 80);

        var newPos = new Vector3().addVectors(this._position, this._speed);
        this._playerTracker.updateSection(newPos);
        var collision = this._playerTracker.getCollision();
        if (collision) {
            newPos = collision;
            this._speed.multiplyScalar(0.3);
            newPos = this._playerTracker.getAdjusted(newPos);
            this._position.copy(newPos);
        } else {
            newPos = this._playerTracker.getAdjusted(newPos);

            this._acceleration.subVectors(newPos, this._position).sub(this._speed).clampLength(0, 5);
            this._speed.add(this._acceleration);
            this._position.add(this._speed);
        }

        this._direction.setFromUnitVectors(
            new Vector3(0, 0, 1),
            this._speed.clone().setY(0).setLength(1));

    }

    updateScene(display: Display) {
        display.setCameraPosition(this._position);
        display.setCameraDefaultRotation(this._direction);
    }
}
