import {ApplicationManager} from '../manager/ApplicationManager';
import Color = cc.Color;
import Vec2 = cc.Vec2;
import {Bezier} from '../math/bezier';
import Graphics = cc.Graphics;

const {ccclass} = cc._decorator;

@ccclass
export default class BezierEditorController extends cc.Component {
    private nodeBezierNodePrefab: cc.Node;

    private graphics: Graphics;

    private bezierControlNodes: cc.Node[] = [];

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
        return this.bezierControlNodes.map(node => node.getPosition(new Vec2()));
    }

    private load() {
        cc.find('btnAddBezierPoints', this.node).on('click', () => this.addBezierNodes(), this);

        cc.find('btnGetBezierControlPoints', this.node).on('click', () => this.getJsonFile(), this);

        this.nodeBezierNodePrefab =
            ApplicationManager.instance.resourcesManager.prefabLoader.get<cc.Node>('prefab/nodeBezierNode');

        this.graphics = this.getComponent(Graphics);

        this.initBezierNodes();
    }

    private getJsonFile() {
        if (cc.sys.isBrowser) {
            const downloadLink = document.createElement("a");
            downloadLink.download = 'cubicBezierCurveControlPoints.json';
            downloadLink.innerHTML = "Download File";

            const blob = new Blob(
                [JSON.stringify(this.getBezierControlPoints())],
                {type: 'application/json'}
            );
            // Chrome允许点击链接
            if (window.webkitURL != null) {
                downloadLink.href = window.webkitURL.createObjectURL(blob);
            } else { //在点击之前 Firefox要求将链接添加到DOM中
                downloadLink.href = window.URL.createObjectURL(blob);
                downloadLink.style.display = "none";
                document.body.appendChild(downloadLink);
            }
            downloadLink.click();
        }
    }

    private drawAll() {
        this.graphics.clear();
        const length = this.bezierControlNodes.length;
        for (let i = 0; i <= (length - 4) / 3; i++) {
            const n = i * 3;
            this.drawBezier(
                this.bezierControlNodes[n].getPosition(),
                this.bezierControlNodes[n + 1].getPosition(),
                this.bezierControlNodes[n + 2].getPosition(),
                this.bezierControlNodes[n + 3].getPosition()
            );
            for (let j = 0; j < 1; j += 0.01) {
                const wayPoint = Bezier.cubicBezierCurve(j, [
                    this.bezierControlNodes[n].getPosition(),
                    this.bezierControlNodes[n + 1].getPosition(),
                    this.bezierControlNodes[n + 2].getPosition(),
                    this.bezierControlNodes[n + 3].getPosition()
                ]);

                this.graphics.lineWidth = 2;
                this.graphics.strokeColor = this.wayColor;
                this.graphics.circle(wayPoint.x, wayPoint.y, 16);
                this.graphics.stroke();
                this.graphics.strokeColor = this.defaultColor;
                this.graphics.lineWidth = 8;
            }
        }
    }

    private initBezierNodes() {
        this.bezierControlNodes.push(this.createNode(0, 0));
        this.bezierControlNodes.push(this.createNode(50, 0, this.control1Color));
        this.bezierControlNodes.push(this.createNode(-50, 50, this.control2Color));
        this.bezierControlNodes.push(this.createNode(0, 50));
    }

    private addBezierNodes() {
        const lastNode = this.bezierControlNodes[this.bezierControlNodes.length - 1];
        const position = lastNode.getPosition();
        this.bezierControlNodes.push(this.createNode(position.x + 50, position.y, this.control1Color));
        this.bezierControlNodes.push(this.createNode(position.x - 50, position.y + 50, this.control2Color));
        this.bezierControlNodes.push(this.createNode(position.x, position.y + 50));
    }

    private createNode(x: number, y: number, color?: Color) {
        const node = cc.instantiate(this.nodeBezierNodePrefab);
        cc.Canvas.instance.node.addChild(node);
        if (x != undefined && y != undefined) {
            node.setPosition(x, y);
        }
        if (color != undefined) {
            node.color = color;
        }
        return node;
    }

    private drawBezier(start: cc.Vec2, control1: cc.Vec2, control2: cc.Vec2, end: cc.Vec2) {
        this.graphics.moveTo(start.x, start.y);
        this.graphics.bezierCurveTo(
            control1.x, control1.y,
            control2.x, control2.y,
            end.x, end.y
        );
        this.graphics.stroke();

        this.graphics.moveTo(start.x, start.y);
        this.graphics.lineTo(control1.x, control1.y);
        this.graphics.stroke();

        this.graphics.moveTo(end.x, end.y);
        this.graphics.lineTo(control2.x, control2.y);
        this.graphics.stroke();
    }
}
