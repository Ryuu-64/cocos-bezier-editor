class BezierControlWayPoint {
    x: number;
    y: number;
    lx: number;
    ly: number;
    rx: number;
    ry: number;

    static convertToControlPoints(controlWayPoints: BezierControlWayPoint[]): Vec2[] {
        if (!controlWayPoints) {
            return [];
        }

        if (controlWayPoints.length < 2) {
            return [];
        }

        const controlPoints: Vec2[] = [];
        const firstPoint = BezierControlWayPoint.convertToVec2s(controlWayPoints[0]);
        controlPoints.push(firstPoint[0]); // control0
        controlPoints.push(firstPoint[1]); // control1
        for (let i = 1; i < controlWayPoints.length - 1; i++) {
            const point = BezierControlWayPoint.convertToVec2s(controlWayPoints[i]);
            controlPoints.push(point[2]); // control2
            controlPoints.push(point[0]); // control0 || control3
            controlPoints.push(point[1]); // control1
        }
        const lastPoint = BezierControlWayPoint.convertToVec2s(controlWayPoints[controlWayPoints.length - 1]);
        controlPoints.push(lastPoint[2]); // control2
        controlPoints.push(lastPoint[0]); // control3
        return controlPoints;
    };

    static convertToVec2s(bezierControlWayPoint: BezierControlWayPoint): Vec2[] {
        return [
            new Vec2(bezierControlWayPoint.x, bezierControlWayPoint.y),
            new Vec2(bezierControlWayPoint.rx, bezierControlWayPoint.ry),
            new Vec2(bezierControlWayPoint.lx, bezierControlWayPoint.ly)
        ];
    }
}

class Vec2 {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.z = 0;
    }
}

class CubicBezierCurve {
    readonly type: string = 'cubicBezierCurve';

    canvasSize: Vec2;

    controlPoints: Vec2[];

    constructor(canvasSize: Vec2, controlPoints: Vec2[]) {
        this.canvasSize = canvasSize;
        this.controlPoints = controlPoints;
    }
}

describe('misc', () => {
    it('misc', () => {
        const road1 = [
            {
                "x": 579.0476,
                "y": 1150.3175,
                "lx": 629.02985,
                "ly": 1151.6504,
                "rx": 519.5238,
                "ry": 1148.7302
            },
            {
                "x": 279.04758,
                "y": 1148.7303,
                "lx": 341.39172,
                "ly": 1148.693,
                "rx": 243.35782,
                "ry": 1148.7517
            },
            {
                "x": 204.44446,
                "y": 1085.238,
                "lx": 223.99875,
                "ly": 1136.5992,
                "rx": 184.56102,
                "ry": 1033.0123
            },
            {
                "x": 83.80948,
                "y": 764.60315,
                "lx": 102.22422,
                "ly": 809.6809,
                "rx": 63.007175,
                "ry": 713.68085
            },
            {
                "x": 85.39679,
                "y": 661.4286,
                "lx": 67.15446,
                "ly": 700.4593,
                "rx": 106.256424,
                "ry": 616.798
            },
            {
                "x": 205.7708,
                "y": 403.15494,
                "lx": 181.638,
                "ly": 446.5251,
                "rx": 311.6265,
                "ry": 233.78586
            },
            {
                "x": 508.90192,
                "y": 405.67728,
                "lx": 439.35773,
                "ly": 282.4079,
                "rx": 553.5867,
                "ry": 470.9975
            },
            {
                "x": 675.87305,
                "y": 724.92065,
                "lx": 636.306,
                "ly": 630.3203,
                "rx": 708.6602,
                "ry": 803.31116
            },
            {
                "x": 489.9196,
                "y": 980.69366,
                "lx": 639.2312,
                "ly": 821.6762,
                "rx": 408.09348,
                "ry": 1056.9517
            },
            {
                "x": 408.01044,
                "y": 888.4127,
                "lx": 345.2461,
                "ly": 955.8785,
                "rx": 507.31128,
                "ry": 786.5481
            },
            {
                "x": 614.9248,
                "y": 676.1055,
                "lx": 555.0385,
                "ly": 742.31024,
                "rx": 675.1362,
                "ry": 609.5414
            },
            {
                "x": 538.7127,
                "y": 224.11603,
                "lx": 684.1021,
                "ly": 305.21274,
                "rx": 451.14758,
                "ry": 157.50134
            },
            {
                "x": 127.862564,
                "y": 322.24615,
                "lx": 195.03262,
                "ly": 158.21843,
                "rx": 84.97635,
                "ry": 407.38016
            },
            {
                "x": 128.2539,
                "y": 577.8886,
                "lx": 100.83453,
                "ly": 515.08466,
                "rx": 158.53131,
                "ry": 647.2389
            },
            {
                "x": 352.06348,
                "y": 1161.4286,
                "lx": 331.80618,
                "ly": 1115.7161,
                "rx": 384.11896,
                "ry": 1233.7649
            },
            {
                "x": 256.82544,
                "y": 1242.3812,
                "lx": 316.40213,
                "ly": 1244.0663,
                "rx": 141.35625,
                "ry": 1239.1152
            },
            {
                "x": 58.412506,
                "y": 961.4285,
                "lx": 160.1983,
                "ly": 1244.2153,
                "rx": 41.479095,
                "ry": 914.38324
            }
        ];
        const controlPoints = BezierControlWayPoint.convertToControlPoints(road1);
        const xOffset = -720 / 2;
        const yOffset = -1280 / 2;
        controlPoints.forEach(vec2 => {
            vec2.x += xOffset;
            vec2.y += yOffset;
        });
        const cubicBezierCurve = new CubicBezierCurve(new Vec2(720, 1600), controlPoints);
        console.log(JSON.stringify(cubicBezierCurve));
    });
});
