import { RequestMethod } from '@nestjs/common';
import { RouteInfo } from '@nestjs/common/interfaces';
import { routes } from 'src/common/routes/routers';

export const exludeRoutes = [
    {
        path: routes('conllections-home'),
        method: RequestMethod.GET,
    },
    {
        path: routes('products'),
        method: RequestMethod.GET,
    },
    {
        path: routes('products/:id'),
        method: RequestMethod.GET,
    },
    {
        path: routes('categories'),
        method: RequestMethod.GET,
    },
] as (string | RouteInfo)[];
