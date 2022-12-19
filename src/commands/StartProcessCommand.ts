import { Command } from "./Command";

export class StartProcessCommand extends Command {
    private _processId: string;
    private _parameters: Map<string, Object> = new Map();
    private _data: any[] = [];

    constructor() {
        super("start-process");
    }

    getProcessId(): string {
        return this._processId;
    }

    setProcessId(processId: string) {
        this._processId = processId;
    }

    toJSON(): any {
        return {
            [this.key]: {
                processId: this._processId,
                data: this._data,
                parameter: this._parameters
            }
        }
    }
}
