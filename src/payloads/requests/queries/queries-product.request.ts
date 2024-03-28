import { QueriesRequest } from './queries.request';

export interface QueriesProduct<S> extends QueriesRequest<S> {
    size?: string;
    categories?: number;
    sort?: 'oldnest' | 'latest';
}
