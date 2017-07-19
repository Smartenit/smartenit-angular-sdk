export interface ISmartenitConfig {
    clientId?: string,
    clientSecret?: string,
    apiURL: string,
    apiURLSet?: boolean,
    useLocalStorage?: boolean,
    useOfflineOperations?: boolean,
    offlineMode?: boolean,
    useLocalConnection?: boolean,
    currentAPIVersion?: string,
    currentGateway?: string
}