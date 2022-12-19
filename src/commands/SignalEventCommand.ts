import { Command } from "./Command";

export class SignalEventCommand extends Command {
    private _eventType: string;
    private _processInstanceId: number;
    private _data: Map<String, Object> = new Map();
    
    constructor() {
        super("signal-event");
    }

    setProcessInstanceId(instance: number): this {
        this._processInstanceId = instance;
        return this;
    }

    setEventType(type: string): this {
        this._eventType = type;;
        return this;
    }

    toJSON(): any {
        return {
            [this.key]: {
                'process-instance-id': this._processInstanceId,
                'event-type': this._eventType
            }
        }
    }
}
