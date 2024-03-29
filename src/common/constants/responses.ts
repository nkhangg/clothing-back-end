import { HttpStatus } from '@nestjs/common';
import messages from './messages';

const responses = {
    errors: {
        notFound: {
            message: messages.errors.notFoud,
            status: true,
            code: HttpStatus.NOT_FOUND,
            data: null,
        },
        invalid: (data: { message: string; code?: HttpStatus }) => {
            return {
                message: data.message,
                status: true,
                code: data.code || HttpStatus.BAD_REQUEST,
                data: null,
            };
        },
        already: (data: { message: string; code?: HttpStatus }) => {
            return {
                message: data.message,
                status: true,
                code: data.code || HttpStatus.CONFLICT,
                data: null,
            };
        },
        handle: {
            message: messages.errors.handle,
            status: true,
            code: HttpStatus.BAD_REQUEST,
            data: null,
        },
        update: {
            message: messages.errors.update,
            status: true,
            code: HttpStatus.BAD_REQUEST,
            data: null,
        },
        active: {
            message: messages.errors.active,
            status: true,
            code: HttpStatus.BAD_REQUEST,
            data: null,
        },
        delete: {
            message: messages.errors.delete,
            status: true,
            code: HttpStatus.BAD_REQUEST,
            data: null,
        },
        badrequest(message = 'Không hợp lệ') {
            return {
                message: message,
                code: HttpStatus.BAD_REQUEST,
                data: null,
                status: true,
            };
        },
    },
    success: {
        restore<T>(data: T, message = 'Khôi phục thành công') {
            return {
                message: message,
                status: false,
                code: HttpStatus.OK,
                data: data,
            };
        },
        ajust<T>(data: T, message = 'Khôi phục thành công') {
            return {
                message: message,
                status: false,
                code: HttpStatus.GONE,
                data: data,
            };
        },
        get<T>(data: T, message = 'Get successfuly') {
            return {
                message: message,
                status: false,
                code: HttpStatus.OK,
                data: data,
            };
        },

        create<T>(data: T, message = 'Create successfuly') {
            return {
                message: message,
                code: HttpStatus.CREATED,
                data: data,
                status: false,
            };
        },
        update<T>(data: T, message = 'Update successfuly') {
            return {
                message: message,
                code: HttpStatus.OK,
                data: data,
                status: false,
            };
        },
        delete<T>(data: T, message = 'Xóa thành công') {
            return {
                message: message,
                code: HttpStatus.OK,
                data: data,
                status: false,
            };
        },
    },
};

export default responses;
