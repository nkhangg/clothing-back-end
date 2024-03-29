import { IsArray } from 'class-validator';

export class DeleteRolesDto {
    @IsArray()
    ids: number[];
}
