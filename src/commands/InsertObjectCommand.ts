import { DataObject } from "@openhps/core";
import { Command } from "./Command";

export class InsertObjectCommand extends Command {
    object: DataObject;
    returnObject: boolean = false;

    constructor(object: DataObject) {
        super("insert");
        this.object = object;
    }

    toJSON(): any {
        return {
            [this.key]: {
                object: this.object,
                "return-object": this.returnObject
            }
        }
    }
}
