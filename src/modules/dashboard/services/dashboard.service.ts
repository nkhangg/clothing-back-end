import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import responses from 'src/common/constants/responses';
import { Customers } from 'src/entities/customers';
import { Sizes } from 'src/entities/sizes';
import { Repository } from 'typeorm';
import { addMonths, startOfMonth, endOfMonth, startOfYear, endOfYear, subYears } from 'date-fns';
import { Orders } from 'src/entities/orders';
import { AcceptOrders } from 'src/entities/accept-orders';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Customers)
        public customersRepository: Repository<Customers>,
        @InjectRepository(Sizes)
        public sizesRepository: Repository<Sizes>,
        @InjectRepository(Orders)
        public ordersRepository: Repository<Orders>,
        @InjectRepository(AcceptOrders)
        public acceptOrdersRepository: Repository<AcceptOrders>,
    ) {}

    currentDate = new Date();

    firstDayOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    lastDayOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);

    firstDayOfPreviousMonth = startOfMonth(addMonths(this.currentDate, -1));
    lastDayOfPreviousMonth = endOfMonth(addMonths(this.currentDate, -1));

    firstDayOfYear = startOfYear(this.currentDate);
    lastDayOfYear = endOfYear(this.currentDate);

    firstDayOfLastYear = startOfYear(subYears(this.currentDate, 1));
    lastDayOfLastYear = endOfYear(subYears(this.currentDate, 1));

    calculateEvulution(prev: number, now: number) {
        const numPrev = prev ? prev : 0;
        const numNow = now ? now : 0;

        if (!numPrev) {
            return { value: numNow, evolution: (now / 100).toFixed(0) || 0 };
        }

        const evolution = ((numNow - numPrev) / numPrev) * 100;

        return { value: numNow, evolution: evolution ? evolution.toFixed(0) : 0 };
    }

    async getBudget() {
        try {
            const prevMonth = await this.sizesRepository
                .createQueryBuilder('s')
                .select('SUM(price * store) as total')
                .where('s.deletedAt IS NULL')
                .andWhere('s.updatedAt >= :firstDayOfPreviousMonth AND s.updatedAt <= :lastDayOfPreviousMonth', {
                    firstDayOfPreviousMonth: this.firstDayOfPreviousMonth,
                    lastDayOfPreviousMonth: this.lastDayOfPreviousMonth,
                })
                .andWhere('s.createdAt >= :firstDayOfYear AND s.createdAt <= :lastDayOfYear', {
                    firstDayOfYear: this.firstDayOfYear,
                    lastDayOfYear: this.lastDayOfYear,
                })
                .getRawOne();

            const thisMonth = await this.sizesRepository
                .createQueryBuilder('s')
                .select('SUM(price * store) as total')
                .where('s.deletedAt IS NULL')
                .andWhere('s.updatedAt >= :firstDayOfMonth AND s.updatedAt <= :lastDayOfMonth', {
                    firstDayOfMonth: this.firstDayOfMonth,
                    lastDayOfMonth: this.lastDayOfMonth,
                })
                .andWhere('s.updatedAt >= :firstDayOfYear AND s.updatedAt <= :lastDayOfYear', {
                    firstDayOfYear: this.firstDayOfYear,
                    lastDayOfYear: this.lastDayOfYear,
                })
                .getRawOne();

            return this.calculateEvulution(prevMonth.total, thisMonth.total);
        } catch (error) {}
    }

    async getCustomers() {
        try {
            const prevMonth = await this.customersRepository
                .createQueryBuilder('c')
                .select('COUNT(*) as total')
                .where('c.deletedAt IS NULL')
                .andWhere('c.createdAt >= :firstDayOfPreviousMonth AND c.createdAt <= :lastDayOfPreviousMonth', {
                    firstDayOfPreviousMonth: this.firstDayOfPreviousMonth,
                    lastDayOfPreviousMonth: this.lastDayOfPreviousMonth,
                })
                .andWhere('c.createdAt >= :firstDayOfYear AND c.createdAt <= :lastDayOfYear', {
                    firstDayOfYear: this.firstDayOfYear,
                    lastDayOfYear: this.lastDayOfYear,
                })
                .getRawOne();

            const thisMonth = await this.customersRepository
                .createQueryBuilder('c')
                .select('COUNT(*) as total')
                .where('c.deletedAt IS NULL')
                .andWhere('c.createdAt >= :firstDayOfMonth AND c.createdAt <= :lastDayOfMonth', {
                    firstDayOfMonth: this.firstDayOfMonth,
                    lastDayOfMonth: this.lastDayOfMonth,
                })
                .andWhere('c.createdAt >= :firstDayOfYear AND c.createdAt <= :lastDayOfYear', {
                    firstDayOfYear: this.firstDayOfYear,
                    lastDayOfYear: this.lastDayOfYear,
                })
                .getRawOne();

            return this.calculateEvulution(prevMonth.total, thisMonth.total);
        } catch (error) {}
    }

    async getTasks() {
        try {
            const { complate } = await this.ordersRepository
                .createQueryBuilder('o')
                .innerJoin('o.acceptOrder', 'ac')
                .select('COUNT(*) AS complate')
                .where('o.deletedAt IS NULL')
                .andWhere('o.createdAt >= :firstDayOfMonth AND o.createdAt <= :lastDayOfMonth', {
                    firstDayOfMonth: this.firstDayOfMonth,
                    lastDayOfMonth: this.lastDayOfMonth,
                })
                .andWhere('o.createdAt >= :firstDayOfYear AND o.createdAt <= :lastDayOfYear', {
                    firstDayOfYear: this.firstDayOfYear,
                    lastDayOfYear: this.lastDayOfYear,
                })
                .getRawOne();

            const { total } = await this.ordersRepository
                .createQueryBuilder('o')
                .select('COUNT(*) AS total')
                .where('o.deletedAt IS NULL')
                .andWhere('o.createdAt >= :firstDayOfMonth AND o.createdAt <= :lastDayOfMonth', {
                    firstDayOfMonth: this.firstDayOfMonth,
                    lastDayOfMonth: this.lastDayOfMonth,
                })
                .andWhere('o.createdAt >= :firstDayOfYear AND o.createdAt <= :lastDayOfYear', {
                    firstDayOfYear: this.firstDayOfYear,
                    lastDayOfYear: this.lastDayOfYear,
                })
                .getRawOne();

            const evolution = (complate / total) * 100;

            return {
                value: complate,
                evolution: evolution ? evolution.toFixed(2) : 0,
            };
        } catch (error) {}
    }

    async getTotalProfit() {
        try {
            const prevMonth = await this.acceptOrdersRepository
                .createQueryBuilder('ac')
                .innerJoin('ac.order', 'o')
                .innerJoin('o.orderDetail', 'od')
                .select('SUM(od.price * od.quantity * (1 - od.discount / 100)) AS result')
                .where('ac.deletedAt IS NULL')
                .andWhere('ac.cancel = 0')
                .andWhere('ac.pat_at IS NOT NULL')
                .andWhere('ac.updatedAt >= :firstDayOfPreviousMonth AND ac.updatedAt <= :lastDayOfPreviousMonth', {
                    firstDayOfPreviousMonth: this.firstDayOfPreviousMonth,
                    lastDayOfPreviousMonth: this.lastDayOfPreviousMonth,
                })
                .andWhere('ac.createdAt >= :firstDayOfYear AND ac.createdAt <= :lastDayOfYear', {
                    firstDayOfYear: this.firstDayOfYear,
                    lastDayOfYear: this.lastDayOfYear,
                })
                .getRawOne();

            const thisMonth = await this.acceptOrdersRepository
                .createQueryBuilder('ac')
                .innerJoin('ac.order', 'o')
                .innerJoin('o.orderDetail', 'od')
                .select('SUM(od.price * od.quantity * (1 - od.discount / 100)) AS result')
                .where('ac.deletedAt IS NULL')
                .andWhere('ac.cancel = 0')
                .andWhere('ac.pat_at IS NOT NULL')
                .andWhere('ac.createdAt >= :firstDayOfMonth AND ac.createdAt <= :lastDayOfMonth', {
                    firstDayOfMonth: this.firstDayOfMonth,
                    lastDayOfMonth: this.lastDayOfMonth,
                })
                .andWhere('ac.createdAt >= :firstDayOfYear AND ac.createdAt <= :lastDayOfYear', {
                    firstDayOfYear: this.firstDayOfYear,
                    lastDayOfYear: this.lastDayOfYear,
                })
                .getRawOne();

            return this.calculateEvulution(prevMonth.result || 0, thisMonth.result);
        } catch (error) {
            console.log(error);
        }
    }

    async getCharts() {
        try {
            const prevYear = await this.ordersRepository
                .createQueryBuilder('o')
                .select('MONTH(o.created_at) AS month, COUNT(*) AS total')
                .where('o.deletedAt is null')

                .where('o.createdAt >= :firstDayOfLastYear AND o.createdAt <= :lastDayOfLastYear', {
                    firstDayOfLastYear: this.firstDayOfLastYear,
                    lastDayOfLastYear: this.lastDayOfLastYear,
                })
                .groupBy('MONTH(o.created_at)')
                .getRawMany();

            const thisYear = await this.ordersRepository
                .createQueryBuilder('o')
                .select('MONTH(o.created_at) AS month, COUNT(*) AS total')
                .where('o.deletedAt is null')
                .andWhere('o.createdAt >= :firstDayOfYear AND o.createdAt <= :lastDayOfYear', {
                    firstDayOfYear: this.firstDayOfYear,
                    lastDayOfYear: this.lastDayOfYear,
                })
                .groupBy('MONTH(o.created_at)')
                .getRawMany();

            if (!prevYear.length && !thisYear.length) {
                return [
                    { name: 'Năm nay', data: [] },
                    { name: 'Năm trước', data: [] },
                ];
            }

            // find value max in array
            const findMaxMonth = prevYear.concat(thisYear).map((item) => item.month);

            const length = Math.max(...findMaxMonth);

            // create to clone array
            const resultPrevYear = Array.from({ length }).fill(0);
            const resultThisYear = Array.from({ length }).fill(0);

            // set value with month
            prevYear.forEach((item) => {
                resultPrevYear[item.month - 1] = Number(item.total);
            });
            thisYear.forEach((item) => {
                resultThisYear[item.month - 1] = Number(item.total);
            });

            return [
                { name: 'Năm nay', data: resultThisYear },
                { name: 'Năm trước', data: resultPrevYear },
            ];
        } catch (error) {}
    }

    async getDashboard() {
        try {
            const budget = await this.getBudget();

            const cutomers = await this.getCustomers();

            const tasks = await this.getTasks();

            const totalProfit = await this.getTotalProfit();

            const charts = await this.getCharts();

            return responses.success.get({ budget, cutomers, tasks, totalProfit, charts });
        } catch (error) {
            console.log(error);
            return responses.errors.handle;
        }
    }
}
