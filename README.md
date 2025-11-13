# Musea-Client
Eine electron-library zur Steuerung von [Musea-Server](https://github.com/enniomariani/Musea-Server). Mehr Informationen unter [Musea](https://github.com/enniomariani/musea).

## Hauptfunktionen
- **Medienstationen verwalten** - Mehrere Musea Server zu Medienstationen gruppieren
- **Server-Registrierung** - Verfügbarkeit der Musea Server prüfen und registrieren
- **Ordnerstruktur** - Medien in Ordnern organisieren
- **Medien-Verwaltung** - Medien hochladen und löschen
- **Tag-System** - Medien mit Tags kategorisieren
- **Wiedergabe-Steuerung** - Medien abspielen sowie Licht und Lautstärke steuern

## Installation

```shell
npm i musea-client
```

## Schnellstart

Funktionierende Beispiele in den Apps [Musea Guide](https://github.com/enniomariani/Musea-Guide) und [Musea Admin](https://github.com/enniomariani/Musea-Admin).

**main**

```typescript
import {MuseaClientMain} from "Musea-Client/main";

//Während der Entwicklung muss der Pfad relativ zur Datei main.ts angegeben werden
const pathToDataFolder:string = environment === 'development' ? join(__dirname, 'pfad-zum-datenordner') : join(process.resourcesPath, '\\data\\');
const museaClientMain:MuseaClientMain = new MuseaClientMain(pathToDataFolder);
museaClientMain.init();
```
**preload**

- Folgenden Code in die Datei preload.ts einfügen.
- Muss bei einem Update von Musea Client eventuell auch aktualisiert werden!
- Falls ein Bundler für den main/preload-Kontext verwendet wird, sollte der import auch über ```typescriptimport {exposeMuseClientAPI} from "Musea-Client/preload"``` funktionieren. Bisher ist diese Option aber nicht getestet.
```typescript
//--- START FOR MUSEA-CLIENT ---
contextBridge.exposeInMainWorld("museaClientBackendFiles", {
    saveFile: (path: string, data: Uint8Array) => ipcRenderer.invoke('museaClient:saveFile', path, data),
    saveFileByPath: async (path: string, fileInstance: File) => {
        const pathToLoad: string = webUtils.getPathForFile(fileInstance);
        await ipcRenderer.invoke('museaClient:saveFileByPath', path, pathToLoad)
    },
    deleteFile: (path: string) => ipcRenderer.invoke('museaClient:deleteFile', path),
    loadFile: (path: string) => ipcRenderer.invoke('museaClient:loadFile', path),
    fileExists: (path: string) => ipcRenderer.invoke('museaClient:fileExists', path),
    getAllFileNamesInFolder: (path: string) => ipcRenderer.invoke('museaClient:getAllFileNamesInFolder', path)
});

contextBridge.exposeInMainWorld("museaClientBackendNetwork", {
    ping: (ip: string) => ipcRenderer.invoke('backendNetworkService:ping', ip)
});
//--- END FOR MUSEA-CLIENT ---
```

**renderer**

```typescript
import {MuseaClient} from "Musea-Client/renderer";

//pathToDataFolder ist ein string, siehe Variable pathToDataFolder oben im main Kontext
const museaClient = new MuseaClient(pathToDataFolder);
```

## API Dokumentation

Die vollständige API-Dokumentation befindet sich direkt im Code als JSDoc/TSDoc-Kommentare.
Das aktuelle Klassen-Diagramm befindet sich [hier](docs/UML-Musea-Client.drawio.png).


## Lizenz

Dieses Projekt steht unter der [GNU General Public License v3.0](LICENSE).

Das bedeutet: Der Code darf genutzt, verändert und weitergegeben werden, aber abgeleitete Werke müssen ebenfalls unter GPL-3.0 veröffentlicht werden.
