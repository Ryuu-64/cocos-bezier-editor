import {ApplicationManager} from '../manager/ApplicationManager';
import {Bezier} from '../math/bezier';
import {BezierNode} from './BezierNode';
import Color = cc.Color;
import Vec2 = cc.Vec2;
import Graphics = cc.Graphics;
import {CubicBezierCurve} from "../dto/cubic-bezier-curve";

const {ccclass} = cc._decorator;

@ccclass
export class BezierEditorController extends cc.Component {
    private nodeBezierNodePrefab: cc.Node;

    private graphics: Graphics;

    private bezierControlNodes: BezierNode[] = [];

    private defaultColor = new cc.Color(255, 255, 255, 255);

    private control1Color = new cc.Color(255, 0, 0, 255);

    private control2Color = new cc.Color(0, 255, 0, 255);

    private wayColor = new cc.Color(0, 0, 255, 255);

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

    getBezierControlPoints(): cc.Vec2[] {
        return this.bezierControlNodes.map(bezierNode => bezierNode.node.getPosition(new Vec2()));
    }

    private load() {
        cc.find('btnAddBezierPoints', this.node)
            .on('click', () => this.addBezierNodes(), this);

        cc.find('btnGetBezierControlPoints', this.node)
            .on('click', () => this.getJsonFile(), this);

        this.nodeBezierNodePrefab =
            ApplicationManager.instance
                .resourcesManager
                .prefabLoader
                .get<cc.Node>('prefab/nodeBezierNode');

        this.graphics = this.getComponent(Graphics);

        this.initBezierNodes();
    }

    private getJsonFile() {
        if (!cc.sys.isBrowser) {
            return;
        }

        const downloadLink = document.createElement("a");
        downloadLink.download = 'cubicBezierCurveControlPoints.json';
        downloadLink.innerHTML = "Download File";
        const blob = new Blob(
            [
                JSON.stringify(new CubicBezierCurve(this.getBezierControlPoints()))
            ],
            {type: 'application/json'}
        );
        if (window.webkitURL != null) {
            downloadLink.href = window.webkitURL.createObjectURL(blob);
        } else { //在点击之前 Firefox要求将链接添加到DOM中
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
            for (let j = 0; j < 1; j += 0.25) {
                const wayPoint = Bezier.cubicBezierCurve(j, [
                    this.bezierControlNodes[n].node.getPosition(),
                    this.bezierControlNodes[n + 1].node.getPosition(),
                    this.bezierControlNodes[n + 2].node.getPosition(),
                    this.bezierControlNodes[n + 3].node.getPosition()
                ]);

                this.graphics.strokeColor = this.wayColor;
                this.graphics.circle(wayPoint.x, wayPoint.y, 8);
                this.graphics.stroke();
                this.graphics.strokeColor = this.defaultColor;
            }
        }
    }

    private initBezierNodes() {
        const start = this.createNode(0, 0);
        this.bezierControlNodes.push(start);

        const control1 = this.createNode(50, 0, this.control1Color);
        this.bezierControlNodes.push(control1);

        const control2 = this.createNode(-50, 50, this.control2Color);
        this.bezierControlNodes.push(control2);

        const end = this.createNode(0, 50);
        this.bezierControlNodes.push(end);

        start.getComponent(BezierNode).addFollowerNode(control1);
        end.getComponent(BezierNode).addFollowerNode(control2);
    }

    private addBezierNodes() {
        const start = this.bezierControlNodes[this.bezierControlNodes.length - 1];
        const position = start.node.getPosition();
        const previousControl2 = this.bezierControlNodes[this.bezierControlNodes.length - 2];

        const control1 = this.createNode(position.x + 50, position.y, this.control1Color);
        this.bezierControlNodes.push(control1);

        const control2 = this.createNode(position.x - 50, position.y + 50, this.control2Color);
        this.bezierControlNodes.push(control2);

        const end = this.createNode(position.x, position.y + 50);
        this.bezierControlNodes.push(end);

        start.getComponent(BezierNode).addFollowerNode(control1);
        end.getComponent(BezierNode).addFollowerNode(control2);

        previousControl2.getComponent(BezierNode).oppositeControlNode = control1;
        control1.getComponent(BezierNode).oppositeControlNode = previousControl2;
    }

    private createNode(x: number, y: number, color?: Color) {
        const bezierNode = cc.instantiate(this.nodeBezierNodePrefab).getComponent(BezierNode);
        cc.Canvas.instance.node.addChild(bezierNode.node);
        if (x != undefined && y != undefined) {
            bezierNode.node.setPosition(x, y);
        }
        if (color != undefined) {
            bezierNode.node.color = color;
        }
        return bezierNode;
    }

    private drawBezier(start: cc.Vec2, control1: cc.Vec2, control2: cc.Vec2, end: cc.Vec2) {
        this.graphics.moveTo(start.x, start.y);
        this.graphics.bezierCurveTo(
            control1.x, control1.y,
            control2.x, control2.y,
            end.x, end.y
        );
        this.graphics.stroke();

        const lastStrokeColor = this.graphics.strokeColor;
        this.graphics.strokeColor = new Color(0, 0, 255, 255);
        const lastLineWidth = this.graphics.lineWidth;
        this.graphics.lineWidth = 4;

        this.graphics.moveTo(start.x, start.y);
        this.graphics.lineTo(control1.x, control1.y);
        this.graphics.stroke();

        this.graphics.moveTo(end.x, end.y);
        this.graphics.lineTo(control2.x, control2.y);
        this.graphics.stroke();

        this.graphics.lineWidth = lastLineWidth;
        this.graphics.strokeColor = lastStrokeColor;
    }
}
