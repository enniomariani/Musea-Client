import {MediaStationRepository} from "../dataStructure/MediaStationRepository";
import {MediaStation} from "../dataStructure/MediaStation";
import {Tag} from "../dataStructure/Tag";
import {Content} from "../dataStructure/Content";
import {ContentManager} from "renderer/dataManagers/ContentManager";


export class TagDataService {

    private _mediaStationRepository: MediaStationRepository;
    private _contentManager: ContentManager;

    constructor(mediaStationRepo: MediaStationRepository, contentManager: ContentManager = new ContentManager()) {
        this._mediaStationRepository = mediaStationRepo;
        this._contentManager = contentManager;
    }

    /**
     *  Create a new tag.
     *  @returns {number}        returns the ID of the new tag
     */
    createTag(mediaStationId: number, name: string): number {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        const tagId: number = mediaStation.getNextTagId();

        mediaStation.tagRegistry.add(tagId, name);

        return tagId;
    }

    /**
     *  Delete an existing tag.
     */
    deleteTag(mediaStationId: number, id: number): void {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        const allContentIds: Map<number, number[]> = mediaStation.rootFolder.getAllContentIDsInFolderAndSubFolders();
        let content: Content;

        mediaStation.tagRegistry.remove(id);

        for (const [key, contentIdsInFolder] of allContentIds) {
            for (let i: number = 0; i < contentIdsInFolder.length; i++) {
                content = this._contentManager.requireContent(mediaStation, contentIdsInFolder[i]);
                if (content.tagIds.indexOf(id) !== -1)
                    content.tagIds.splice(content.tagIds.indexOf(id), 1);
            }
        }
    }

    /**
     *  Return a map of all tag-ids (keys) and names (values)
     */
    getAllTags(mediaStationId: number): Map<number, string> {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        let returnMap: Map<number, string> = new Map();
        let allTags: Map<number, Tag> = mediaStation.tagRegistry.getAll();

        for (const [key, tag] of allTags)
            returnMap.set(key, tag.name);

        return returnMap;
    }

    /**
     * Add the passed tag-id to the content.
     *
     * @throws {Error} If the content already has the tag-id.
     */
    addTagToContent(mediaStationId: number, contentId: number, tagId: number): void {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        const content: Content = this._contentManager.requireContent(mediaStation, contentId);

        if (content.tagIds.indexOf(tagId) !== -1)
            throw new Error("Content has tag-id already: " + tagId);

        content.tagIds.push(tagId);
    }

    /**
     * Remove the passed tag-id from the content.
     *
     * @throws {Error} If the content does not have the tag-id.
     */
    removeTagFromContent(mediaStationId: number, contentId: number, tagId: number): void {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        const content: Content = this._contentManager.requireContent(mediaStation, contentId);
        const tagIndex: number = content.tagIds.indexOf(tagId);

        if (tagIndex === -1)
            throw new Error("Content has no tag-id: " + tagId);
        else
            content.tagIds.splice(tagIndex, 1);
    }

    /**
     * return all tag-ids added to this content
     */
    getTagIdsForContent(mediaStationId: number, contentId: number): number[] {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        const content: Content = this._contentManager.requireContent(mediaStation, contentId);
        const tagIds:number[] = content.tagIds.concat();      //this is important, because if there is no copy made, changes in the returned array would directly affect the content!

        return tagIds;
    }

    /**
     * return all contents (id = key, name = value) that have the passed tag-id
     */
    findContentsByTag(mediaStationId: number, tagId: number): Map<number, string> {
        const mediaStation: MediaStation = this._mediaStationRepository.requireMediaStation(mediaStationId);
        let returnMap: Map<number, string> = new Map();
        let allContentIds: Map<number, number[]> = mediaStation.rootFolder.getAllContentIDsInFolderAndSubFolders();
        let content: Content;

        for (const [key, contentIdsInFolder] of allContentIds) {
            for (let i: number = 0; i < contentIdsInFolder.length; i++) {
                content = this._contentManager.requireContent(mediaStation, contentIdsInFolder[i]);
                if (content.tagIds.indexOf(tagId) !== -1)
                    returnMap.set(content.id, content.name);
            }
        }

        return returnMap;
    }
}