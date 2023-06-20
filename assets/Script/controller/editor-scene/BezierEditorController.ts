import {BezierNode} from './BezierNode';
import Color = cc.Color;
import Vec2 = cc.Vec2;
import Graphics = cc.Graphics;
import {CubicBezierCurve} from "../../dto/cubic-bezier-curve";
import {ApplicationManager} from '../../manager/ApplicationManager';
import Node = cc.Node;
import {CurveCanvasSize} from './CurveCanvasSize';
import {MulticastFunction} from 'multicast-function';
import Canvas = cc.Canvas;

const {ccclass} = cc._decorator;

@ccclass
export class BezierEditorController extends cc.Component {
    private nodeBezierNodePrefab: cc.Node;

    private graphics: Graphics;

    private bezierControlNodes: BezierNode[] = [];

    private control1Color = new cc.Color(255, 0, 0, 255);

    private control2Color = new cc.Color(0, 255, 0, 255);

    private curveCanvas: Node;

    private _designCurveCanvasSize: cc.Vec2 = new cc.Vec2();

    private curveCanvasScale: number;

    readonly afterDesignCurveCanvasSizeChanged =
        new MulticastFunction<(size: cc.Vec2) => void>();

    //region getter and setter
    get designCurveCanvasSize(): cc.Vec2 {
        return this._designCurveCanvasSize;
    }

    setDesignCurveCanvasSize(width: number, height: number) {
        this._designCurveCanvasSize.x = width;
        this._designCurveCanvasSize.y = height;
        this.afterSetDesignCurveCanvasSize();
    }

    private afterSetDesignCurveCanvasSize() {
        this.afterDesignCurveCanvasSizeChanged.invoke(this._designCurveCanvasSize);

        this.curveCanvasScale = CurveCanvasSize.getScale(
            this._designCurveCanvasSize.x, this._designCurveCanvasSize.y
        );
        this.curveCanvas.width = this._designCurveCanvasSize.x / this.curveCanvasScale;
        this.curveCanvas.height = this._designCurveCanvasSize.y / this.curveCanvasScale;
    }

    //endregion

    protected onLoad() {
        if (!ApplicationManager.isInit) {
            ApplicationManager.init();
            ApplicationManager.afterApplicationInit.add(() => this.load());
        } else {
            this.load();
        }
    }

    protected update(dt: number) {
        if (!ApplicationManager.isInit) {
            return;
        }

        this.drawAll();
    }

    private getBezierControlPoints(): cc.Vec2[] {
        return this.bezierControlNodes.map(bezierNode => bezierNode.node.getPosition(new Vec2()));
    }

    private load() {
        this.curveCanvas = cc.find('curveCanvas', cc.Canvas.instance.node);

        cc.find('controlPanel/btnAddBezierPoints', this.node)
            .on('click', () => this.addBezierNodes(), this);

        cc.find('controlPanel/btnDownloadJson', this.node)
            .on('click', () => this.downloadBezierControlPoints(), this);

        const pnlLoad = cc.find('controlPanel/pnlLoad', this.node);
        cc.find('controlPanel/btnLoadFromJson', this.node)
            .on('click', () => pnlLoad.active = true, this);

        this.nodeBezierNodePrefab =
            ApplicationManager.instance
                .resourcesManager
                .prefabLoader
                .get<cc.Node>('prefab/nodeBezierNode');

        this.graphics = cc.find('curveCanvas/nodeGraphics', this.node).getComponent(Graphics);

        this.initBezierNodes();

        const designResolution = this.getComponent(Canvas).designResolution;
        this._designCurveCanvasSize = new Vec2(designResolution.width, designResolution.height);
    }

    private downloadBezierControlPoints() {
        if (!cc.sys.isBrowser) {
            return;
        }

        const downloadLink = document.createElement("a");
        downloadLink.download = 'cubicBezierCurveControlPoints.json';
        downloadLink.innerHTML = "Download File";

        const controlPoints = [];
        for (const controlPoint of this.getBezierControlPoints()) {
            controlPoints.push(new Vec2(
                controlPoint.x * this.curveCanvasScale,
                controlPoint.y * this.curveCanvasScale
            ));
        }
        const blob = new Blob(
            [
                JSON.stringify(new CubicBezierCurve(
                    this._designCurveCanvasSize, controlPoints
                ))
            ],
            {type: 'application/json'}
        );
        if (window.webkitURL != null) {
            downloadLink.href = window.webkitURL.createObjectURL(blob);
        } else { //在点击之前 Firefox 要求将链接添加到 DOM 中
            downloadLink.href = window.URL.createObjectURL(blob);
            downloadLink.style.display = "none";
            document.body.appendChild(downloadLink);
        }
        downloadLink.click();
    }

    private drawAll() {
        this.graphics.clear();
        const length = this.bezierControlNodes.length;
        for (let i = 0; i <= (length - 4) / 3; i++) {
            const n = i * 3;
            this.drawBezier(
                this.bezierControlNodes[n].node.getPosition(),
                this.bezierControlNodes[n + 1].node.getPosition(),
                this.bezierControlNodes[n + 2].node.getPosition(),
                this.bezierControlNodes[n + 3].node.getPosition()
            );
        }
    }

    private initBezierNodes() {
        this.initBezierNodesByPos(
            new Vec2(0, 0),
            new Vec2(50, 0),
            new Vec2(-50, 50),
            new Vec2(0, 50)
        );
    }

    public loadBezierNodes(curve: CubicBezierCurve) {
        for (let bezierControlNode of this.bezierControlNodes) {
            bezierControlNode.node.destroy();
        }

        this.setDesignCurveCanvasSize(curve.canvasSize.x, curve.canvasSize.y);
        this.bezierControlNodes = [];
        const controlPoints = [];
        for (const controlPoint of curve.controlPoints) {
            controlPoints.push(new Vec2(
                controlPoint.x / this.curveCanvasScale,
                controlPoint.y / this.curveCanvasScale
            ));
        }
        if (controlPoints.length < 4) {
            console.error(`curve controlPoints must >= 4, curve=${curve}`);
        }
        this.initBezierNodesByPos(
            controlPoints[0],
            controlPoints[1],
            controlPoints[2],
            controlPoints[3]
        );
        if (controlPoints.length > 4) {
            this.addBezierNodesByPos(controlPoints.slice(4));
        }
    }

    private addBezierNodes() {
        const startPos = this.bezierControlNodes[this.bezierControlNodes.length - 1].node.getPosition();
        this.addBezierNodesByPos([
            new cc.Vec2(startPos.x + 50, startPos.y),
            new cc.Vec2(startPos.x - 50, startPos.y + 50),
            new cc.Vec2(startPos.x, startPos.y + 50)
        ]);
    }

    private initBezierNodesByPos(
        startPos: Vec2, control1Pos: Vec2, control2Pos: Vec2, endPos: Vec2
    ) {
        const control0 = this.createNode(startPos.x, startPos.y);
        this.bezierControlNodes.push(control0);

        const control1 = this.createNode(control1Pos.x, control1Pos.y, this.control1Color);
        this.bezierControlNodes.push(control1);

        const control2 = this.createNode(control2Pos.x, control2Pos.y, this.control2Color);
        this.bezierControlNodes.push(control2);

        const control3 = this.createNode(endPos.x, endPos.y);
        this.bezierControlNodes.push(control3);

        control0.addFollowerNode(control1);
        control3.addFollowerNode(control2);
    }

    private addBezierNodesByPos(positions: Vec2[]) {
        for (let i = 0; i < positions.length; i += 3) {
            const control0 = this.bezierControlNodes[this.bezierControlNodes.length - 1];
            const previousControl2 = this.bezierControlNodes[this.bezierControlNodes.length - 2];

            const control1 = this.createNode(positions[i].x, positions[i].y, this.control1Color);
            this.bezierControlNodes.push(control1);
            control0.addFollowerNode(control1);

            const control2 = this.createNode(positions[i + 1].x, positions[i + 1].y, this.control2Color);
            this.bezierControlNodes.push(control2);

            const control3 = this.createNode(positions[i + 2].x, positions[i + 2].y);
            this.bezierControlNodes.push(control3);
            control3.addFollowerNode(control2);

            previousControl2.oppositeControlNode = control1;
            control1.oppositeControlNode = previousControl2;
        }
    }

    private createNode(x: number, y: number, color?: Color) {
        const bezierNode = cc.instantiate(this.nodeBezierNodePrefab).getComponent(BezierNode);
        this.curveCanvas.addChild(bezierNode.node);
        if (x != undefined && y != undefined) {
            bezierNode.node.setPosition(x, y);
        }
        if (color != undefined) {
            bezierNode.node.color = color;
        }
        return bezierNode;
    }

    private drawBezier(control0: cc.Vec2, control1: cc.Vec2, control2: cc.Vec2, control3: cc.Vec2) {
        this.graphics.moveTo(control0.x, control0.y);
        this.graphics.bezierCurveTo(
            control1.x, control1.y,
            control2.x, control2.y,
            control3.x, control3.y
        );
        this.graphics.stroke();

        const lastStrokeColor = this.graphics.strokeColor;
        this.graphics.strokeColor = new Color(0, 0, 255, 255);
        const lastLineWidth = this.graphics.lineWidth;
        this.graphics.lineWidth = 4;

        this.graphics.moveTo(control0.x, control0.y);
        this.graphics.lineTo(control1.x, control1.y);
        this.graphics.stroke();

        this.graphics.moveTo(control3.x, control3.y);
        this.graphics.lineTo(control2.x, control2.y);
        this.graphics.stroke();

        this.graphics.lineWidth = lastLineWidth;
        this.graphics.strokeColor = lastStrokeColor;
    }
}
