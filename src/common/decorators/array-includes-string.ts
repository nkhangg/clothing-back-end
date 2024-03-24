import { registerDecorator, ValidationOptions, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'arrayIncludesString', async: false })
export class ArrayIncludesStringConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        const [array] = args.constraints;
        if (!Array.isArray(array)) {
            throw new Error('Invalid array');
        }
        if (typeof value !== 'string') {
            throw new Error('Invalid string');
        }
        return array.includes(value);
    }

    defaultMessage() {
        return `The string must include at least one of the values in the array`;
    }
}

export function ArrayIncludesString(array: any[], validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [array],
            validator: ArrayIncludesStringConstraint,
        });
    };
}
