const {ccclass} = cc._decorator;

@ccclass
export class BezierNode extends cc.Component {
    private readonly _followerNodes: BezierNode[] = [];

    private _oppositeControlNode: BezierNode;

    private _masterNode: BezierNode;

    private readonly nodeOffsetMap = new Map<BezierNode, cc.Vec2>;

    //region getter and setter
    set oppositeControlNode(value: BezierNode) {
        this._oppositeControlNode = value;
    }

    //endregion

    protected onLoad() {
        this._followerNodes.push(this);
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    protected onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    addFollowerNode(node: BezierNode) {
        this._followerNodes.push(node);
        if (node !== this) {
            node._masterNode = this;
        }
    }

    private onTouchStart(event: cc.Event.EventTouch) {
        for (let followerNode of this._followerNodes) {
            this.nodeOffsetMap.set(followerNode, followerNode.node.getPosition().sub(event.getLocation()));
        }
    }

    private onTouchMove(event: cc.Event.EventTouch) {
        for (let followerNode of this._followerNodes) {
            followerNode.node.setPosition(event.getLocation().add(this.nodeOffsetMap.get(followerNode)));
        }

        for (let followerNode of this._followerNodes) {
            if (this._oppositeControlNode === undefined) {
                continue;
            }

            if (this._masterNode === undefined) {
                continue;
            }

            const masterPos = this._masterNode.node.getPosition();
            const oppositeMag = masterPos.sub(this._oppositeControlNode.node.getPosition()).mag();
            const thisOffset = masterPos.sub(this.node.getPosition());
            const oppositeOffset = thisOffset.normalize().mul(oppositeMag);
            this._oppositeControlNode.node.setPosition(masterPos.add(oppositeOffset));
        }
    }

    private onTouchEnd() {
        this.nodeOffsetMap.clear();
    }
}
