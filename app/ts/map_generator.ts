import {
    Vector3,
    Plane,
    Line3,
} from "three";

import * as Stars from "./stars";
import {
    dist,
    randomRange,
} from "./util";
import Star from "./star";
import Section from "./section";

export interface SectionInfo {
    position: Vector3;
    size: number;
}

function getControlPoints(p1: Vector3, p2: Vector3, p3: Vector3, tension: number){
    var d12 = p1.clone().sub(p2).length();
    var d23 = p2.clone().sub(p3).length();
    var fa = tension * d12 / (d12+d23);
    var fb = tension * d23 / (d12+d23);
    var c1 = p2.clone().sub(p3.clone().sub(p1).multiplyScalar(fa));
    var c2 = p2.clone().add(p3.clone().sub(p1).multiplyScalar(fb));

    return {
        left: c1,
        right: c2
    };
}

function quadratic(start: Vector3, end: Vector3, control: Vector3, t: number) {
    return start.clone().multiplyScalar(Math.pow(1 - t, 2))
            .add(control.clone().multiplyScalar(2 * (1 - t) * t))
            .add(end.clone().multiplyScalar(t * t));
}

function cubic(start: Vector3, end: Vector3, control1: Vector3, control2: Vector3, t: number) {
    return start.clone().multiplyScalar(Math.pow(1 - t, 3))
            .add(control1.clone().multiplyScalar(3 * Math.pow(1 - t, 2) * t))
            .add(control2.clone().multiplyScalar(3 * (1 - t) * t * t))
            .add(end.clone().multiplyScalar(t * t * t));
}

export default class MapGenerator {
    private _step: number;
    private _cur: Vector3;
    private _mag: number;
    private _center: Vector3[];
    private _centerIndex: number;

    private _prevVec: Vector3;
    private _stars: Star[];

    private _points: Vector3[];
    private _pointInd: number;

    constructor(step: number) {
        this._step = step;
        this._cur = new Vector3(0, 0, -1500);
        this._mag = 400;
        this._centerIndex = 0;

        this._prevVec = new Vector3(0, 0, this._step);

        this.genMap();
        this._pointInd = 0;
    }

    getStars() {
        return this._stars;
    }

    getNext(): SectionInfo {
        if (this._pointInd >= this._points.length) {
            this._pointInd = 0;
        }
        var r = {
            position: this._points[this._pointInd],
            size: 1.0
        };
        this._cur = this._points[this._pointInd].clone();
        this._pointInd += 1;
        return r;
    }

    genMap() {
        this._stars = [];
        var numStars = 8;
        var radius = 9 * this._step * numStars;
        var center = new Vector3(radius, 0, 0);
        var pointer = new Vector3(-radius, 0, 0);

        for(var i = 0; i < numStars; i++) {
            pointer.applyAxisAngle(new Vector3(0, 1, 0), Math.PI * 2 / (numStars + 1));
            var star = Stars.genRandom(new Vector3());
            if (i === 0) {
                var pos = center.clone().add(pointer);
            } else {
                var pos = this._genStarPoint(center.clone().add(pointer), star, radius);
            }
            star.setPosition(pos);
            this._stars.push(star);
        }
        this._genPoints(new Vector3(), new Vector3(0, 0, -this._step));
    }

    private _genStarPoint(point: Vector3, star: Star, radius: number) {
        var distAdd = Section.size * 3;
        if (star) {
            distAdd += this._getDist(star);
        }
        var count = 0;
        while (count < 10) {
            var mag = radius * 0.7;
            var p = point.clone().add(new Vector3(
                randomRange(-mag, mag),
                randomRange(-mag / 10, mag / 10),
                randomRange(-mag, mag)
            ));
            if (this._stars.every((star) => {
                return dist(p, star.position) > distAdd + this._getDist(star);
            })) {
                return p;
            }
        }
        throw "no";
    }

    private _genPoints(start: Vector3, end: Vector3) {
        this._points = [];
        var cur = start;
        var connectPoints = [start];
        var starInd = 0;
        while (starInd < this._stars.length) {
            var nextNextPoint: Vector3;
            if (starInd + 1 < this._stars.length) {
                nextNextPoint = this._stars[starInd + 1].position;
            } else {
                nextNextPoint = end;
            }

            var curStarPoint = this._stars[starInd].position;
            var minDist = this._getDist(this._stars[starInd]);

            var dir = nextNextPoint.clone().sub(cur).normalize();
            var plane = new Plane().setFromNormalAndCoplanarPoint(dir, curStarPoint);

            var starDir = curStarPoint.clone().sub(cur);

            var randomDir = starDir.clone().normalize().add(new Vector3(
                randomRange(-0.01, 0.01),
                randomRange(-0.01, 0.01),
                randomRange(-0.01, 0.01)
            )).setLength(starDir.length() * 2);
            var randomLine = new Line3(cur.clone(), cur.clone().add(randomDir));
            var point = plane.intersectLine(randomLine)
                        .sub(curStarPoint)
                        .setLength(minDist)
                        .add(curStarPoint);

            var connectLine = new Line3(
                cur.clone().sub(dir.clone().setLength(9999999)),
                nextNextPoint.clone().add(dir.clone().setLength(9999999)));
            var starDir = plane.intersectLine(connectLine).sub(curStarPoint);
            var pointDir = point.clone().sub(curStarPoint);
            if (pointDir.clone().projectOnVector(starDir).add(starDir).length() > starDir.length()) {
                point = curStarPoint.clone().sub(pointDir);
            }

            connectPoints.push(point);
            cur = curStarPoint;

            starInd += 1;
        }
        connectPoints.push(end);

        var controlPoints: Vector3[] = [];
        var pointToStar: number[] = [];
        connectPoints.forEach((point, ind) => {
            if (ind + 2 >= connectPoints.length) return;
            var cur = point,
                next = connectPoints[ind + 1],
                nextNext = connectPoints[ind + 2];

            var {left, right} = getControlPoints(cur, next, nextNext, 0.9);
            controlPoints.push(left, right);
        });
        connectPoints.forEach((point, ind) => {
            if (ind + 1 === connectPoints.length) return;
            var nextPoint = connectPoints[ind + 1];
            var numSteps = Math.ceil(nextPoint.clone().sub(point).length() / this._step);
            var tstep = 1 / numSteps;
            if (ind === 0) {
                for (var i = 0; i < numSteps; i += 1) {
                    this._points.push(quadratic(point, nextPoint, controlPoints[0], i * tstep));
                }
            } else if (ind + 2 === connectPoints.length) {
                for (var i = 0; i < numSteps; i+= 1) {
                    this._points.push(quadratic(point, nextPoint, controlPoints[ind * 2 - 1], i * tstep));
                }
                this._points.push(nextPoint);
            } else {
                for (var i = 0; i < numSteps; i+= 1) {
                    this._points.push(cubic(point, nextPoint, controlPoints[ind * 2 - 1], controlPoints[ind * 2], i * tstep));
                }
            }
            if (ind > 0) {
                for (var i = 0; i < numSteps / 2; i++) {
                    pointToStar.push(ind - 1);
                }
            } else {
                for (var i = 0; i < numSteps / 2; i++) {
                    pointToStar.push(null);
                }
            }
            if (ind + 2 < connectPoints.length) {
                for (var i = Math.ceil(numSteps / 2); i < numSteps; i++) {
                    pointToStar.push(ind);
                }
            } else {
                for (var i = Math.ceil(numSteps / 2); i <= numSteps; i++) {
                    pointToStar.push(null);
                }
            }
        });

        for (var i = 0; i < 30; i++) {
            this._points = this._smooth(this._points, 1, pointToStar);
        }
    }

    private _getDist(star: Star) {
        return star.getWrapSize() + Section.size * 3;
    }

    private _smooth(path: Vector3[], neighbour: number, pointToStar: number[]) {
        var newPath: Vector3[] = [];
        path.forEach((point, ind) => {
            if (ind === 0 || ind === path.length - 1) {
                newPath.push(point);
                return;
            }
            var tmpNeighbour = neighbour;
            if (ind < neighbour) {
                tmpNeighbour = ind;
            } else if (ind >= path.length - neighbour) {
                tmpNeighbour = path.length - 1 - ind;
            }
            var newPoint = new Vector3();
            for (var i = ind - tmpNeighbour; i <= ind + tmpNeighbour; i++) {
                newPoint.add(path[i]);
            }
            newPoint.divideScalar(tmpNeighbour * 2 + 1);
            var starInd = pointToStar[ind];
            if (starInd !== null) {
                var star = this._stars[starInd];
                newPoint.sub(star.position).clampLength(this._getDist(star), 1/0).add(star.position);
            }
            newPath.push(newPoint);
        });
        return newPath;
    }
}
