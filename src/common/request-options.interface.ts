export interface IRequestOptions {
    limit?: number,
    page?: number,
    fields?: string[],
    sort?: string[],
    credentials?: boolean,
    data?: any
}