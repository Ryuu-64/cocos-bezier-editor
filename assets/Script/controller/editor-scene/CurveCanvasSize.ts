import EditBox = cc.EditBox;
import {ApplicationManager} from '../../manager/ApplicationManager';

const {ccclass} = cc._decorator;

@ccclass
export class CurveCanvasSize extends cc.Component {
    protected onLoad() {
        if (!ApplicationManager.isInit) {
            ApplicationManager.init();
            ApplicationManager.afterApplicationInit.add(() => this.load());
        } else {
            this.load();
        }
    }

    static getScale(targetWidth: number, targetHeight: number) {
        const scale = Math.max(
            targetWidth / cc.Canvas.instance.designResolution.width,
            targetHeight / cc.Canvas.instance.designResolution.height
        );
        return scale <= 1 ? 1 : scale;
    }

    private load() {

        const editBoxWidth = cc.find('editBoxWidth', this.node).getComponent(EditBox);
        const editBoxHeight = cc.find('editBoxHeight', this.node).getComponent(EditBox);

        const nodeBackground = cc.find('curveCanvas/background', cc.director.getScene());
        editBoxWidth.string = String(nodeBackground.width);
        editBoxHeight.string = String(nodeBackground.height);

        const setEditBoxWidthAndHeight = () => {
            const width = Number(editBoxWidth.string);
            if (Number.isNaN(width)) {
                console.warn(`invalid curve canvas width, value=${editBoxWidth.string}`);
                editBoxWidth.string = '0';
            }
            const height = Number(editBoxHeight.string);
            if (Number.isNaN(height)) {
                console.warn(`invalid curve canvas height, value=${editBoxHeight.string}`);
                editBoxHeight.string = '0';
            }
            nodeBackground.width = width;
            nodeBackground.height = height;
        };

        editBoxWidth.node.on(
            'editing-return',
            setEditBoxWidthAndHeight,
            this
        );

        editBoxHeight.node.on(
            'editing-return',
            setEditBoxWidthAndHeight,
            this
        );
    }
}
