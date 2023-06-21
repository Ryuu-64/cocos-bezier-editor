import {Curve} from "./curve";

export class CubicBezierCurve implements Curve {
    readonly type: string = 'cubicBezierCurve';

    controlPoints: cc.Vec2[];

    constructor(controlPoints: cc.Vec2[]) {
        this.controlPoints = controlPoints;
    }
}