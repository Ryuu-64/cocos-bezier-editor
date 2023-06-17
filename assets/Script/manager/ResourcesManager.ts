import ccclass = cc._decorator.ccclass;
import {MulticastFunction} from "multicast-function";
import {AssetLoader} from '../asset/asset-loader';

@ccclass
export class ResourcesManager extends cc.Component {
    private _prefabLoader: AssetLoader;

    private _afterAllLoaderLoad = new MulticastFunction<() => any>();

    //region getter and setter
    get afterAllLoaderLoad(): MulticastFunction<() => any> {
        return this._afterAllLoaderLoad;
    }

    get prefabLoader(): AssetLoader {
        return this._prefabLoader;
    }

    //endregion

    protected onLoad() {
        const prefabLoaderPromise =
            this.createLoaderAndLoad('prefab/', cc.Prefab)
                .then(loader => this._prefabLoader = loader);

        Promise
            .all([
                prefabLoaderPromise
            ])
            .then(() => {
                console.log(`${ResourcesManager.name}, 全部资源加载完成`);
                this._afterAllLoaderLoad.invoke();
            });
    }

    private createLoaderAndLoad(dir: string, assetType: typeof cc.Asset): Promise<AssetLoader> {
        return new Promise((resolve, reject) => {
            const assetLoader = new AssetLoader();
            assetLoader
                .loadAsync(
                    dir, assetType
                )
                .then(() => {
                    console.info(`${ResourcesManager.name}, 加载完成, dir=${dir}`);
                    resolve(assetLoader);
                })
                .catch((error) => {
                    console.error(error);
                    reject(error);
                });
        });
    }
}
