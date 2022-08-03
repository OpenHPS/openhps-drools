/**
 * Event, is a record of a significant change of state in the application domain at a given point in time.
 * 
 * An event is a fact that present a few distinguishing characteristics:
 * - Usually immutables: since, by the previously discussed definition, events are a record of a state change in the application domain, i.e., a record of something that already happened, and the past can not be "changed", events are immutables. This constraint is an important requirement for the development of several optimizations and for the specification of the event lifecycle. This does not mean that the Java object representing the object must be immutable. Quite the contrary, the engine does not enforce immutability of the object model, because one of the most common use cases for rules is event data enrichment.
 * - Strong temporal constraints: rules involving events usually require the correlation of multiple events, specially temporal correlations where events are said to happen at some point in time relative to other events.
 * - Managed lifecycle: due to their immutable nature and the temporal constraints, events usually will only match other events and facts during a limited window of time, making it possible for the engine to manage the lifecycle of the events automatically. In other words, one an event is inserted into the working memory, it is possible for the engine to find out when an event can no longer match other facts and automatically delete it, releasing its associated resources.
 * - Use of sliding windows: since all events have timestamps associated to them, it is possible to define and use sliding windows over them, allowing the creation of rules on aggregations of values over a period of time. Example: average of an event value over 60 minutes.
 * 
 * @see {@link https://docs.jboss.org/drools/release/6.2.0.CR3/drools-docs/html/DroolsComplexEventProcessingChapter.html}
 */
export interface DroolsEvent {

}
