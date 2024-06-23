import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    } from 'class-validator';

    @ValidatorConstraint({ async: false })
    export class IsMeOrUserIdConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        return !isNaN(value) || value === 'me';
    }

    defaultMessage(
        validationArguments?: ValidationArguments | undefined,
    ): string {
        return 'Author must be a number or "me"';
    }
    }

    export function IsMeOrUserId(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        constraints: [],
        validator: IsMeOrUserIdConstraint,
        });
    };
}
