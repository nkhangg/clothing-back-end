import { Controller, Get } from '@nestjs/common';
import { DashboardService } from '../services/dashboard.service';
import { routes } from 'src/common/routes/routers';

@Controller(routes('dashboards'))
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get()
    async getDashboard() {
        return this.dashboardService.getDashboard();
    }
}
