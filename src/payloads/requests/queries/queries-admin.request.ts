import { ERoles } from 'src/common/enums/e-roles';
import { QueriesRequest } from './queries.request';

export interface QueriesAdmin<S> extends QueriesRequest<S> {
    sort?: 'oldnest' | 'latest';
    role?: ERoles;
}
