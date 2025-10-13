import {MediaApp, MediaAppRole} from "renderer/dataStructure/MediaApp";

export class MediaAppRegistry {
    private _mediaApps: Map<number, MediaApp> = new Map();

    constructor() {
    }

    add(id: number, name: string, ip: string, role: MediaAppRole): void {
        let mediaApp: MediaApp = new MediaApp(id);
        mediaApp.ip = ip;
        mediaApp.name = name;
        mediaApp.role = role;

        this._mediaApps.set(id, mediaApp);
    }

    get(id: number): MediaApp | null {
        if (!this._mediaApps.has(id))
            return null;

        return this._mediaApps.get(id) as MediaApp;
    }

    require(id: number): MediaApp {
        const mediaApp: MediaApp | undefined = this._mediaApps.get(id);

        if (!mediaApp)
            throw new Error("Media-App with ID " + id + " does not exist!");

        return mediaApp;
    }

    getAll(): Map<number, MediaApp> {
        return this._mediaApps;
    }

    /**
     * returns null and prints an error  if there is no controller-app defined
     *
     * @returns {MediaApp | null}
     */
    getController(): MediaApp | null {
        let controller: MediaApp | null = null;

        this._mediaApps.forEach((mediaApp: MediaApp) => {
            if (mediaApp.role === MediaAppRole.CONTROLLER) {
                controller = mediaApp;
                return;
            }
        });

        if (!controller) {
            console.error("No controller-app is set!");
            return null;
        }

        return controller;
    }

    /**
     * returns null and prints an error  if there is no controller-app defined
     *
     * @returns {string | null}
     */
    getControllerIp(): string | null {
        let controller: MediaApp | null = this.getController();
        return controller === null ? null : controller.ip;
    }

    importFromJSON(json: any): void {
        let mediaApp: MediaApp | null = null;

        this._mediaApps = new Map();

        if (json) {
            for (let i: number = 0; i < json.length; i++) {
                if (this._jsonPropertyExists(json[i], "id"))
                    mediaApp = new MediaApp(json[i].id);

                if (!mediaApp)
                    continue;

                if (this._jsonPropertyExists(json[i], "name"))
                    mediaApp.name = json[i].name;
                if (this._jsonPropertyExists(json[i], "ip"))
                    mediaApp.ip = json[i].ip;
                if (this._jsonPropertyExists(json[i], "role"))
                    mediaApp.role = json[i].role;

                this._mediaApps.set(mediaApp.id, mediaApp);
            }
        }
    }

    reset(): void {
        this._mediaApps = new Map<number, MediaApp>();
    }

    private _jsonPropertyExists(json: any, propName: string): boolean {
        if (json.hasOwnProperty(propName))
            return true;
        else
            throw new Error("MediaStation: missing property in JSON: " + propName);
    }
}