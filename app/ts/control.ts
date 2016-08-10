import MotionTracker from "./motion_tracker";

export default class Control {
    motionTracker: MotionTracker

    constructor() {
        this.motionTracker = new MotionTracker();
    }
}
