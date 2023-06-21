import {BezierNode} from './BezierNode';
import Color = cc.Color;
import Vec2 = cc.Vec2;
import Graphics = cc.Graphics;
import {CubicBezierCurve} from "../../dto/cubic-bezier-curve";
import {ApplicationManager} from '../../manager/ApplicationManager';
import Node = cc.Node;
import EventMouse = cc.Event.EventMouse;
import Camera = cc.Camera;

const {ccclass} = cc._decorator;

@ccclass
export class EditorController extends cc.Component {
    private nodeBezierNodePrefab: cc.Node;

    private graphics: Graphics;

    private bezierControlNodes: BezierNode[] = [];

    private control1Color = new cc.Color(255, 0, 0, 255);

    private control2Color = new cc.Color(0, 255, 0, 255);

    private curveCanvas: Node;

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
        // //region TODO
        // const onEventMouse = (event: cc.Event.EventMouse) => {
        //     const mousePosition = event.getLocation();
        //     console.log('Mouse Position:', mousePosition.x, mousePosition.y);
        // };
        // cc.Canvas.instance.node.on(
        //     cc.Node.EventType.TOUCH_START,
        //     onEventMouse,
        //     this
        // );
        // cc.Canvas.instance.node.on(
        //     cc.Node.EventType.TOUCH_MOVE,
        //     onEventMouse,
        //     this
        // );
        // cc.Canvas.instance.node.on(
        //     cc.Node.EventType.TOUCH_END,
        //     onEventMouse,
        //     this
        // );
        // cc.Canvas.instance.node.on(
        //     cc.Node.EventType.TOUCH_CANCEL,
        //     onEventMouse,
        //     this
        // );
        // //endregion
    }

    private getBezierControlPoints(): cc.Vec2[] {
        return this.bezierControlNodes.map(bezierNode => bezierNode.node.getPosition(new Vec2()));
    }

    private load() {
        const cameraMain = cc.find('cameraMain', cc.director.getScene()).getComponent(Camera);
        cc.Canvas.instance.node.on(
            cc.Node.EventType.MOUSE_WHEEL,
            (event: EventMouse) => {
                const scrollY = event.getScrollY();
                if (scrollY === 0) {
                    return;
                }

                cameraMain.orthoSize -= scrollY;
                if (cameraMain.orthoSize <= 0) {
                    cameraMain.orthoSize = 120;
                }
            },
            this
        );

        this.curveCanvas = cc.find('curveCanvas', cc.director.getScene());

        cc.find('Canvas/btnAddBezierPoints', cc.director.getScene())
            .on('click', () => this.addBezierNodes(), this);

        cc.find('Canvas/btnDownloadJson', cc.director.getScene())
            .on('click', () => this.downloadBezierControlPoints(), this);

        const pnlLoad = cc.find('Canvas/pnlLoad', cc.director.getScene());
        cc.find('Canvas/btnLoadFromJson', cc.director.getScene())
            .on('click', () => pnlLoad.active = true, this);

        this.nodeBezierNodePrefab =
            ApplicationManager.instance
                .resourcesManager
                .prefabLoader
                .get<cc.Node>('prefab/nodeBezierNode');

        this.graphics = cc.find('curveCanvas/nodeGraphics', cc.director.getScene()).getComponent(Graphics);

        this.initBezierNodes();
    }

    private downloadBezierControlPoints() {
        if (!cc.sys.isBrowser) {
            return;
        }

        const downloadLink = document.createElement("a");
        downloadLink.download = 'cubicBezierCurveControlPoints.json';
        downloadLink.innerHTML = "Download File";

        const blob = new Blob(
            [
                JSON.stringify(new CubicBezierCurve(
                    this.getBezierControlPoints()
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

        this.bezierControlNodes = [];
        if (curve.controlPoints.length < 4) {
            console.error(`curve controlPoints must >= 4, curve=${curve}`);
        }
        this.initBezierNodesByPos(
            curve.controlPoints[0],
            curve.controlPoints[1],
            curve.controlPoints[2],
            curve.controlPoints[3]
        );
        if (curve.controlPoints.length > 4) {
            this.addBezierNodesByPos(curve.controlPoints.slice(4));
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
