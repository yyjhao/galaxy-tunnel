import {
    Vector3
} from "three";

import Display from "./display";
import World from "./world";
import Control from "./control";

export default class Game {
    display: Display;
    world: World;
    control: Control;

    constructor(container: HTMLElement) {
        this.control = new Control();
        this.display = new Display(container, this.control.motionTracker, this._update);
        this.world = new World();
        this.world.setupScene(this.display);
    }

    start() {
        this.display.start();
    }

    private _update = () => {
        this.world.update(this.control);
        this.world.updateScene(this.display);

        this.display.light.target.position.copy(this.display.camera.position).add(
            new Vector3(0, 0, -1000).applyQuaternion(this.display.camera.quaternion)
        );
    };
}
