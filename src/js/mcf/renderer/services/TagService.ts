import {MediaStationRepository} from "../dataStructure/MediaStationRepository";
import {MediaStation} from "../dataStructure/MediaStation";
import {Tag} from "../dataStructure/Tag";
import {ContentManager} from "../dataManagers/ContentManager";
import {Content} from "../dataStructure/Content";


export class TagService {

    private _mediaStationRepository: MediaStationRepository;
    private _contentManager: ContentManager;

    constructor(mediaStationRepo: MediaStationRepository, contentManager:ContentManager) {
        this._mediaStationRepository = mediaStationRepo;
        this._contentManager = contentManager;
    }

    createTag(mediaStationId: number, name: string): number {
        let mediaStation:MediaStation = this._findMediaStation(mediaStationId);
        let tagId:number = mediaStation.getNextTagId();

        mediaStation.addTag(tagId, name);

        return tagId;
    }

    deleteTag(mediaStationId: number, id: number): void {
        let mediaStation:MediaStation = this._findMediaStation(mediaStationId);

        mediaStation.removeTag(id);
    }

    getAllTags(mediaStationId:number):Map<number, string>{
        let mediaStation:MediaStation = this._findMediaStation(mediaStationId);
        let returnMap:Map<number, string> = new Map();
        let allTags:Map<number, Tag> = mediaStation.getAllTags();

        for(const [key, tag] of allTags)
            returnMap.set(key, tag.name);

        return returnMap;
    }

    addTagToContent(mediaStationId: number, contentId: number, tagId: number): void {
        let mediaStation:MediaStation = this._findMediaStation(mediaStationId);
        let content:Content = this._contentManager.getContent(mediaStation, contentId);

        if(content.tagIds.indexOf(tagId) !== -1)
            throw new Error("Content has tag-id already: " + tagId);

        content.tagIds.push(tagId);
    }

    removeTagFromContent(mediaStationId: number, contentId: number, tagId: number): void {
        let mediaStation:MediaStation = this._findMediaStation(mediaStationId);
        let content:Content = this._contentManager.getContent(mediaStation, contentId);
        let tagIndex:number = content.tagIds.indexOf(tagId);

        if(tagIndex === -1)
            throw new Error("Content has no tag-id: " + tagId);
        else
            content.tagIds.splice(tagIndex, 1);
    }

    getTagsForContent(mediaStationId: number, contentId: number): Map<number, string> {
        let mediaStation:MediaStation = this._findMediaStation(mediaStationId);
        let content:Content = this._contentManager.getContent(mediaStation, contentId);

        let returnMap:Map<number, string> = new Map();
        let tagIdsOnContent:number[] = content.tagIds;
        let allTags:Map<number, Tag> = mediaStation.getAllTags();

        for(let i:number = 0; i < tagIdsOnContent.length;i++)
            returnMap.set(tagIdsOnContent[i], allTags.get(tagIdsOnContent[i]).name);

        return returnMap;
    }

    findContentsByTag(mediaStationId: number,tagId: number): Map<number, string> {
        let mediaStation:MediaStation = this._findMediaStation(mediaStationId);
        let returnMap:Map<number, string> = new Map();
        let allContentIds:Map<number, number[]> = mediaStation.rootFolder.getAllContentIDsInFolderAndSubFolders();
        let content:Content;

        for(const [key,contentIdsInFolder] of allContentIds ){
            for(let i:number = 0; i < contentIdsInFolder.length; i++){
                content = this._contentManager.getContent(mediaStation, contentIdsInFolder[i]);
                if(content.tagIds.indexOf(tagId) !== -1)
                    returnMap.set(content.id, content.name);
            }
        }

        return returnMap;
    }

    private _findMediaStation(id: number): MediaStation {
        let mediaStation: MediaStation = this._mediaStationRepository.findMediaStation(id);

        if (!mediaStation)
            throw new Error("Mediastation with this ID does not exist: " + id);
        else
            return mediaStation;
    }
}