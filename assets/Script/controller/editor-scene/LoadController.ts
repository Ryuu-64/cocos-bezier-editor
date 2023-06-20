import EditBox = cc.EditBox;
import {CubicBezierCurve} from '../../dto/cubic-bezier-curve';
import {BezierEditorController} from './BezierEditorController';

const {ccclass} = cc._decorator;

@ccclass
export class LoadController extends cc.Component {
    protected onLoad() {
        const editBoxCurveJson = cc.find('editBoxCurveJson', this.node).getComponent(EditBox);

        cc.find('btnClose', this.node).on(
            'click',
            () => this.node.active = false,
            this
        );

        const bezierEditorController = cc.Canvas.instance.getComponent(BezierEditorController);
        cc.find('btnLoad', this.node).on(
            'click',
            () => {
                const curveJsonString = editBoxCurveJson.string;
                const curve = JSON.parse(curveJsonString) as CubicBezierCurve;
                bezierEditorController.loadBezierNodes(curve);
            },
            this
        );
    }
}
