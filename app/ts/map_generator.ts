import {
    Vector3
} from "three";

export interface SectionInfo {
    position: Vector3;
    size: number;
}

export default class MapGenerator {
    private _step: number;
    private _cur: Vector3;
    private _mag: number;
    private _center: Vector3[];
    private _centerIndex: number;

    private _prevVec: Vector3;
    private _stars: Vector3[];

    constructor(step: number) {
        this._step = step;
        this._cur = new Vector3(0, 0, -1500);
        this._center = [];
        this._mag = 400;
        this._centerIndex = 0;

        this._prevVec = new Vector3(0, 0, this._step);

        this._stars = [
            new Vector3(-19000, 0, step * 10),
            new Vector3(-19000, 0, step * 50),
            new Vector3(19000, 0, step * 100),
            new Vector3(-19000, 0, step * 200),
        ];
    }

    getStars() {
        return this._stars;
    }

    getNext(): SectionInfo {
        var vec = new Vector3(0, Math.floor(Math.random() * this._mag * 2) - this._mag, this._step);
        // var vec = new Vector3(Math.floor(Math.random() * this._mag * 2) - this._mag, Math.floor(Math.random() * this._mag * 2) - this._mag, this._step);
        // var vec = new Vector3(200, 400, this._step);
        // var vec = new Vector3(200, 400, this._step / 2);
        // var vec = new Vector3(0, Math.floor(Math.random() * this._mag * 2) - this._mag, this._step);
        // var vec = new Vector3(0, 0, this._step);
        // var vec = new Vector3(Math.floor(Math.random() * this._mag * 2) - this._mag, 0, this._step);
        // var axis = new Vector3( 0, 1, 0 );
        // var angle = 0.1;
        // this._prevVec.applyAxisAngle( axis, angle );
        // var vec = this._prevVec.clone();
        // vec.y = 100;
        // vec.setLength(this._step);
        this._cur.add(vec);
        this._center.push(this._cur.clone());
        return {
            position: this._cur.clone(),
            size: 1.0
        };
    }
}
