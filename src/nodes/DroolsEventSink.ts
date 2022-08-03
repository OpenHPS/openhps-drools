import { DataFrame, PushOptions, SinkNode } from "@openhps/core";

export class DroolsEventSink<In extends DataFrame> extends SinkNode<In> {
    
    onPush(frame: In | In[], options?: PushOptions): Promise<void> {
        throw new Error("Method not implemented.");
    }

}
