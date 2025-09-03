import {MediaStationRepository} from "../dataStructure/MediaStationRepository";
import {MediaStation} from "../dataStructure/MediaStation";
import {Tag} from "../dataStructure/Tag";
import {ContentManager} from "../dataManagers/ContentManager";
import {Content} from "../dataStructure/Content";


export class TagDataService {

    private _mediaStationRepository: MediaStationRepository;
    private _contentManager: ContentManager;

    constructor(mediaStationRepo: MediaStationRepository, contentManager: ContentManager = new ContentManager()) {
        this._mediaStationRepository = mediaStationRepo;
        this._contentManager = contentManager;
    }

    createTag(mediaStationId: number, name: string): number {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        let tagId: number = mediaStation.getNextTagId();

        mediaStation.addTag(tagId, name);

        return tagId;
    }

    deleteTag(mediaStationId: number, id: number): void {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        let allContentIds: Map<number, number[]> = mediaStation.rootFolder.getAllContentIDsInFolderAndSubFolders();
        let content: Content;

        mediaStation.removeTag(id);

        for (const [key, contentIdsInFolder] of allContentIds) {
            for (let i: number = 0; i < contentIdsInFolder.length; i++) {
                content = this._contentManager.getContent(mediaStation, contentIdsInFolder[i]);
                console.log("CHECK CONTENT FOR TAG-DELETION: ", content.tagIds, content.tagIds.indexOf(id) , id)
                if (content.tagIds.indexOf(id) !== -1)
                    content.tagIds.splice(content.tagIds.indexOf(id), 1);

                console.log("tag-ids after deletion: ", content.tagIds);
            }
        }
    }

    getAllTags(mediaStationId: number): Map<number, string> {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        let returnMap: Map<number, string> = new Map();
        let allTags: Map<number, Tag> = mediaStation.getAllTags();

        for (const [key, tag] of allTags)
            returnMap.set(key, tag.name);

        return returnMap;
    }

    addTagToContent(mediaStationId: number, contentId: number, tagId: number): void {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        let content: Content = this._contentManager.getContent(mediaStation, contentId);

        if (content.tagIds.indexOf(tagId) !== -1)
            throw new Error("Content has tag-id already: " + tagId);

        content.tagIds.push(tagId);
    }

    removeTagFromContent(mediaStationId: number, contentId: number, tagId: number): void {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        let content: Content = this._contentManager.getContent(mediaStation, contentId);
        let tagIndex: number = content.tagIds.indexOf(tagId);

        if (tagIndex === -1)
            throw new Error("Content has no tag-id: " + tagId);
        else
            content.tagIds.splice(tagIndex, 1);
    }

    getTagIdsForContent(mediaStationId: number, contentId: number): number[] {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        let content: Content = this._contentManager.getContent(mediaStation, contentId);
        let tagIds:number[] = content.tagIds.concat();      //this is important, because if there is no copy made, changes in the returned array would directly affect the content!

        return tagIds;
    }

    findContentsByTag(mediaStationId: number, tagId: number): Map<number, string> {
        let mediaStation: MediaStation = this._findMediaStation(mediaStationId);
        let returnMap: Map<number, string> = new Map();
        let allContentIds: Map<number, number[]> = mediaStation.rootFolder.getAllContentIDsInFolderAndSubFolders();
        let content: Content;

        for (const [key, contentIdsInFolder] of allContentIds) {
            for (let i: number = 0; i < contentIdsInFolder.length; i++) {
                content = this._contentManager.getContent(mediaStation, contentIdsInFolder[i]);
                if (content.tagIds.indexOf(tagId) !== -1)
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