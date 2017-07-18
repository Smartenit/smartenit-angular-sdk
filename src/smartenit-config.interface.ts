export interface ISmartenitConfig {
    clientId?: string,
    clientSecret?: string,
    apiURL: string,
    useLocalStorage?: boolean,
    useOfflineOperations?: boolean,
    offlineMode?: boolean,
    useLocalConnection?: boolean,
    currentAPIVersion?: string,
    currentGateway?: string
}