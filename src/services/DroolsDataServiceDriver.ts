import { DataObject, DataServiceDriver, FilterQuery, FindOptions } from "@openhps/core";

export class DroolsDataServiceDriver<I, T extends DataObject> extends DataServiceDriver<I, T> {

    public findByUID(uid: I): Promise<T> {
        return new Promise<T>((resolve, reject) => {

        });
    }

    public findOne(query?: FilterQuery<T>, options: FindOptions = {}): Promise<T> {
        return new Promise<T>((resolve, reject) => {

        });
    }

    public findAll(query?: FilterQuery<T>, options: FindOptions = {}): Promise<T[]> {
        return new Promise<T[]>((resolve) => {

        });
    }

    public insert(id: I, object: T): Promise<T> {
        return new Promise<T>((resolve) => {
            
        });
    }

    public delete(id: I): Promise<void> {
        return new Promise<void>((resolve, reject) => {

        });
    }

    public count(filter?: FilterQuery<T>): Promise<number> {
        return new Promise((resolve) => {

        });
    }

    deleteAll(filter?: FilterQuery<T>): Promise<void> {
        return new Promise((resolve) => {

        });
    }
}
