export class BaseResponse<T> {
    message: string;
    status: boolean;
    code: number;
    data: T | null;
}
