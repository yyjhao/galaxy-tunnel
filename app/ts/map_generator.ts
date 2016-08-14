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
        if (this._pointInd < this._points.length) {
            var r = {
                position: this._points[this._pointInd],
                size: 1.0
            };
            this._cur = this._points[this._pointInd].clone();
            this._pointInd += 1;
            return r;
        } else {
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
            return {
                position: this._cur.clone(),
                size: 1.0
            };
        }
    }

    genMap() {
        this._stars = [
            Stars.genRandom(new Vector3(0, 0, this._step * 10))
        ];
        var start = new Vector3();
        var cur = this._stars[0].position;
        var dir = new Vector3(0, 0, 1);
        for (var i = 0; i < 7; i++) {
            var star = Stars.genRandom(new Vector3());
            var nextPoint = this._genNextBigPoint(cur, dir, star);
            star.setPosition(nextPoint);
            this._stars.push(star);
            dir.subVectors(nextPoint, cur).setLength(1);
            cur = nextPoint;
        }

        this._genPoints(start, this._genNextBigPoint(cur, dir, null));
    }

    private _genNextBigPoint(curPoint: Vector3, oldDir: Vector3, star: Star) {
        var distAdd = Section.size * 3;
        if (star) {
            distAdd += this._getDist(star);
        }
        var count = 0;
        var mul = 1;
        while (count < 10) {
            var length = randomRange(20, 40) * this._step * mul;
            var dir = oldDir.clone().applyAxisAngle(new Vector3(
                randomRange(-0.1, 0.1),
                randomRange(-1, 1),
                randomRange(-1, 1)
            ).normalize(), Math.PI / 4);
            var point = curPoint.clone().add(dir.setLength(length));
            if (this._stars.every((star) => {
                return dist(point, star.position) > distAdd + this._getDist(star);
            })) {
                return point;
            }
            count += 1;
            if (count === 10) {
                count = 0;
                mul *= 2;
                console.log("mul is", mul);
            }
        }
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

            var dir = nextNextPoint.clone().sub(cur);
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

            connectPoints.push(point);
            cur = curStarPoint;

            starInd += 1;
        }
        connectPoints.push(end);

        this._points.push(connectPoints[0]);
        var pointToStar: number[] = [null];
        connectPoints.forEach((point, ind) => {
            if (ind + 1 === connectPoints.length) return;
            var nextPoint = connectPoints[ind + 1];
            var dir = nextPoint.clone().sub(point).setLength(this._step);
            var cur = point.clone();
            var totalDist = dist(cur, nextPoint);

            var minDist: number;
            var starPosition: Vector3;
            var previousStarPosition: Vector3;
            var previousMinDist: number;
            if (ind < this._stars.length) {
                minDist = this._getDist(this._stars[ind]);
                starPosition = this._stars[ind].position;
            }
            if (ind > 0) {
                previousStarPosition = this._stars[ind - 1].position;
                previousMinDist = this._getDist(this._stars[ind - 1]);
            }
            for (var i = 1; i < totalDist / this._step; i++) {
                cur.add(dir);
                var pointToAdd = cur.clone();
                if (starPosition) {
                    pointToAdd.sub(starPosition).clampLength(minDist, 1/0).add(starPosition);
                }
                if (previousStarPosition) {
                    pointToAdd.sub(previousStarPosition).clampLength(previousMinDist, 1/0).add(previousStarPosition);
                }
                this._points.push(pointToAdd);

                if (!starPosition && !previousStarPosition) {
                    pointToStar.push(null);
                } else if (!starPosition) {
                    pointToStar.push(ind - 1);
                } else if (!previousStarPosition) {
                    pointToStar.push(ind);
                } else {
                    if (dist(starPosition, pointToAdd) > dist(previousStarPosition, pointToAdd)) {
                        pointToStar.push(ind - 1);
                    } else {
                        pointToStar.push(ind);
                    }
                }
            }
            var left = totalDist - Math.floor(totalDist / this._step) * this._step;
            if (left > this._step / 10) {
                this._points.push(nextPoint);
                pointToStar.push(ind);
            }
        });
        for (var i = 0; i < 10; i++) {
            this._points = this._smooth(this._points, 2, pointToStar);
        }
    }

    private _getDist(star: Star) {
        return star.getWrapSize() + Section.size * 1.5;
    }

    private _smooth(path: Vector3[], neighbour: number, pointToStar: number[]) {
        var newPath: Vector3[] = [];
        path.forEach((point, ind) => {
            if (ind < neighbour || ind >= path.length - neighbour) {
                newPath.push(point);
                return;
            }
            var newPoint = new Vector3();
            for (var i = ind - neighbour; i <= ind + neighbour; i++) {
                newPoint.add(path[i]);
            }
            newPoint.divideScalar(neighbour * 2 + 1);
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
