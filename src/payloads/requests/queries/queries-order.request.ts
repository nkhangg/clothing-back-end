import { QueriesRequest } from './queries.request';

export interface QueriesOrders<S> extends QueriesRequest<S> {
    state?: 'pending' | 'delivered' | 'refunded';
    sort?: 'oldnest' | 'latest';
}
