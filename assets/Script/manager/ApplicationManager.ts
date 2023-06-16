import Node = cc.Node;
import ccclass = cc._decorator.ccclass;
import {ResourcesManager} from "./ResourcesManager";
import {MulticastFunction} from 'multicast-function';

@ccclass
export class ApplicationManager extends cc.Component {
    private static _isInit: boolean;

    private static _instance: ApplicationManager;

    private _resourcesManager: ResourcesManager;

    private static readonly _afterApplicationInit = new MulticastFunction<() => void>();

    //region getter and setter
    static get isInit(): boolean {
        return this._isInit;
    }

    static get instance(): ApplicationManager {
        return this._instance;
    }

    static get afterApplicationInit(): MulticastFunction<() => void> {
        return ApplicationManager._afterApplicationInit;
    }

    get resourcesManager(): ResourcesManager {
        return this._resourcesManager;
    }

    //endregion

    protected onLoad() {
        this._resourcesManager = this.node.addComponent(ResourcesManager);
        this._resourcesManager.afterAllLoaderLoad.add(() => {
            ApplicationManager._isInit = true;
            ApplicationManager._afterApplicationInit.invoke();
        });
    }

    static init() {
        if (this._instance != null) {
            return;
        }

        console.info(`${ApplicationManager.name}, 初始化`);
        const node = new Node();
        cc.game.addPersistRootNode(node);
        node.name = "applicationManager";
        this._instance = node.addComponent(ApplicationManager);
    }
}