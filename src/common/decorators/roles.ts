import { Reflector } from '@nestjs/core';
import { ERoles } from '../enums/e-roles';

export const Roles = Reflector.createDecorator<ERoles[]>();
