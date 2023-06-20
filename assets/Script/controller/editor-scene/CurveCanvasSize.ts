import EditBox = cc.EditBox;
import {BezierEditorController} from './BezierEditorController';
import {ApplicationManager} from '../../manager/ApplicationManager';

const {ccclass} = cc._decorator;

@ccclass
export class CurveCanvasSize extends cc.Component {
    private editorController: BezierEditorController;

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
        this.editorController = cc.Canvas.instance.getComponent(BezierEditorController);

        const editBoxWidth = cc.find('editBoxWidth', this.node).getComponent(EditBox);
        const editBoxHeight = cc.find('editBoxHeight', this.node).getComponent(EditBox);

        this.editorController.afterDesignCurveCanvasSizeChanged.add((size) => {
            editBoxWidth.string = String(size.x);
            editBoxHeight.string = String(size.y);
        });

        editBoxWidth.string = String(this.editorController.designCurveCanvasSize.x);
        editBoxHeight.string = String(this.editorController.designCurveCanvasSize.y);

        const setEditBoxWidth = () => {
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
            this.editorController.setDesignCurveCanvasSize(width, height);
        };

        const setEditBoxHeight = () => {
        };

        editBoxWidth.node.on(
            'editing-return',
            () => {
                setEditBoxWidth();
                setEditBoxHeight();
            },
            this
        );

        editBoxHeight.node.on(
            'editing-return',
            () => {
                setEditBoxWidth();
                setEditBoxHeight();
            },
            this
        );
    }
}
