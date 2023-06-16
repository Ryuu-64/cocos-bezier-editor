const {ccclass} = cc._decorator;

@ccclass
export default class BezierNode extends cc.Component {
    private offset: cc.Vec2 = cc.Vec2.ZERO;

    protected onLoad() {
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

    private onTouchStart(event: cc.Event.EventTouch) {
        this.offset = this.node.getPosition().sub(event.getLocation());
    }

    private onTouchMove(event: cc.Event.EventTouch) {
        this.node.setPosition(event.getLocation().add(this.offset));
    }

    private onTouchEnd() {
        this.offset = cc.Vec2.ZERO;
    }
}
