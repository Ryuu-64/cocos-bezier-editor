import RequestItem = cc.AssetManager.RequestItem;

export class AssetLoader {
    private readonly pathAssetMap: Map<String, cc.Asset> = new Map<String, cc.Asset>();

    loadAsync(dir: string, assetType: typeof cc.Asset, onProgress?: (process: number) => void): Promise<void> {
        const uuidPathMap: Map<String, String> = new Map<String, String>();

        return new Promise((resolve, reject) => {
            cc.resources.loadDir(
                dir,
                assetType,
                (finish: number, total: number, item: RequestItem) => {
                    if (onProgress) {
                        onProgress(finish / total);
                    }
                    const info = item.info;
                    if (!info) {
                        return;
                    }

                    const uuid = info.uuid;
                    if (!uuid) {
                        return;
                    }

                    const path = info.path;
                    if (!path) {
                        return;
                    }

                    uuidPathMap.set(uuid, path);
                },
                (error, assets) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    for (const asset of assets) {
                        // @ts-ignore
                        const uuid = asset._uuid;
                        const path = uuidPathMap.get(uuid);
                        this.pathAssetMap.set(path, asset);
                    }
                    resolve();
                }
            );
        });
    }

    get<T>(path: string): T {
        return this.pathAssetMap.get(path) as T;
    }
}
