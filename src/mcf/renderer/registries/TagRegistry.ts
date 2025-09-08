import {Tag} from "src/mcf/renderer/dataStructure/Tag";
import {MediaStation} from "src/mcf/renderer/dataStructure/MediaStation";

export class TagRegistry {
    private _tags: Map<number, Tag> = new Map();

    constructor(){}

    add(ms:MediaStation, name: string): void {
        const id:number = ms.getNextTagId();
        let tag: Tag = new Tag(id, name);

        this._tags.set(id, tag);
    }

    remove(id: number): void {
        if (this._tags.has(id))
            this._tags.delete(id);
        else
            throw new Error("Tag with the following ID does not exist: " + id);
    }

    get(id: number): Tag {
        let tag: Tag = this._tags.get(id);

        if (tag)
            return tag;
        else
            throw new Error("Tag with the following ID does not exist: " + id);
    }

    getAll(): Map<number, Tag> {
        return this._tags;
    }

    reset():void{
        this._tags = new Map<number, Tag>();
    }
}