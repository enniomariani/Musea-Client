import {MediaPlayer, MediaPlayerRole} from "renderer/dataStructure/MediaPlayer.js";

export class MediaPlayerRegistry {
    private _mediaPlayers: Map<number, MediaPlayer> = new Map();

    constructor() {}

    add(id: number, name: string, ip: string, role: MediaPlayerRole): void {
        let mediaPlayer: MediaPlayer = new MediaPlayer(id);
        mediaPlayer.ip = ip;
        mediaPlayer.name = name;
        mediaPlayer.role = role;

        this._mediaPlayers.set(id, mediaPlayer);
    }

    get(id: number): MediaPlayer | null {
        if (!this._mediaPlayers.has(id))
            return null;

        return this._mediaPlayers.get(id) as MediaPlayer;
    }

    require(id: number): MediaPlayer {
        const mediaPlayer: MediaPlayer | undefined = this._mediaPlayers.get(id);

        if (!mediaPlayer)
            throw new Error("Media-Player with ID " + id + " does not exist!");

        return mediaPlayer;
    }

    getAll(): Map<number, MediaPlayer> {
        return this._mediaPlayers;
    }

    /**
     * returns null and prints an error  if there is no controller-app defined
     *
     * @returns {MediaPlayer | null}
     */
    getController(): MediaPlayer | null {
        let controller: MediaPlayer | null = null;

        this._mediaPlayers.forEach((mediaPlayer: MediaPlayer) => {
            if (mediaPlayer.role === MediaPlayerRole.CONTROLLER) {
                controller = mediaPlayer;
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
        let controller: MediaPlayer | null = this.getController();
        return controller === null ? null : controller.ip;
    }

    importFromJSON(json: any): void {
        let mediaPlayer: MediaPlayer | null = null;

        this._mediaPlayers = new Map();

        if (json) {
            for (let i: number = 0; i < json.length; i++) {
                if (this._jsonPropertyExists(json[i], "id"))
                    mediaPlayer = new MediaPlayer(json[i].id);

                if (!mediaPlayer)
                    continue;

                if (this._jsonPropertyExists(json[i], "name"))
                    mediaPlayer.name = json[i].name;
                if (this._jsonPropertyExists(json[i], "ip"))
                    mediaPlayer.ip = json[i].ip;
                if (this._jsonPropertyExists(json[i], "role"))
                    mediaPlayer.role = json[i].role;

                this._mediaPlayers.set(mediaPlayer.id, mediaPlayer);
            }
        }
    }

    reset(): void {
        this._mediaPlayers = new Map<number, MediaPlayer>();
    }

    private _jsonPropertyExists(json: any, propName: string): boolean {
        if (json.hasOwnProperty(propName))
            return true;
        else
            throw new Error("MediaStation: missing property in JSON: " + propName);
    }
}