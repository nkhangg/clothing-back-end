import { QueriesRequest } from './queries.request';

export interface QueriesProduct extends QueriesRequest {
    size?: string;
    categories?: number;
}
