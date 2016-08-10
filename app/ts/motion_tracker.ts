import {
    Math as TMath
} from "three";

export default class MotionTracker {
    private _gamma: number;
    private _beta: number;
    private _alpha: number;
    private _orient: number;

    constructor() {
        this._gamma = 0;
        this._beta = 0;
        this._alpha = 0;
        this._orient = 0;

        window.addEventListener('deviceorientation', this._orientEvent, false);
        window.addEventListener('orientationchange', this.updateOrient, false);

        this.updateOrient();
    }

    getGamma() {
        return this._gamma;
    }

    getBeta() {
        return this._beta;
    }

    getAlpha() {
        return this._alpha;
    }

    getOrient() {
        return this._orient;
    }

    private _orientEvent = (evt: DeviceOrientationEvent) => {
        this._gamma = TMath.degToRad(evt.gamma);
        this._beta = TMath.degToRad(evt.beta);
        this._alpha = TMath.degToRad(evt.alpha);
    };

    updateOrient = () => {
        this._orient = TMath.degToRad(<number>window.orientation || 0);
    };
}
