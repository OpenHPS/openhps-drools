import { DataFrame, PushOptions, SinkNode, SinkNodeOptions } from '@openhps/core';

/**
 * Drools event sink is a sink node that will fire an event on the Drools KIE.
 */
export class DroolsEventSink<In extends DataFrame> extends SinkNode<In> {
    constructor(options?: DroolsEventSinkOptions) {
        super(options);
    }

    onPush(frame: In | In[], options?: PushOptions): Promise<void> {
        throw new Error('Method not implemented.');
    }
}

export type DroolsEventSinkOptions = SinkNodeOptions;
