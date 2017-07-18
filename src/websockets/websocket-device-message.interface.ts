export interface IWebSocketDeviceMessage {
    data: any;
    resource: string,
    resourceId: string,
    componentId?: string,
    processorName?: string,
    attributeOrMethod?: string
}