import {Curve} from "./curve";

export class CubicBezierCurve implements Curve {
    readonly type: string = 'cubicBezierCurve';

    canvasSize: cc.Vec2;

    controlPoints: cc.Vec2[];

    constructor(canvasSize: cc.Vec2, controlPoints: cc.Vec2[]) {
        this.canvasSize = canvasSize;
        this.controlPoints = controlPoints;
    }
}