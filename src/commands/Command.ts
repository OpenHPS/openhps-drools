export abstract class Command {
    protected key!: string;

    constructor(key: string) {
        this.key = key;
    }

    toJSON(): any {
        return {
            [this.key]: {}
        }
    }
}
