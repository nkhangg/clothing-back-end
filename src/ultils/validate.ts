export type ValidateType = { message: string; error: boolean };

const Validate = {
    isBlank(value: string): boolean {
        return value.trim().length <= 0;
    },

    isNotBlank(value: string): boolean {
        return value.trim().length > 0;
    },

    isSpecialChars(value: string): boolean {
        const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        return specialChars.test(value);
    },

    isEmail(value: string): boolean {
        const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return re.test(value);
    },

    isNumber(value: string): boolean {
        const num = /^\d+$/;

        return num.test(value);
    },
    isUrl(url: string, acvence = true) {
        if (acvence) {
            try {
                new URL(url);
                return true;
            } catch (error) {
                return false;
            }
        }

        return /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g.test(url);
    },

    isPhone(value: string): boolean {
        const regexPhoneNumber = /(84|0[3|5|7|8|9|1])+([0-9]{8})\b/g;

        return regexPhoneNumber.test(value);
    },

    isValidBirthday(value: string, maxAge = 14): boolean {
        const age = new Date().getFullYear() - new Date(value).getFullYear() < maxAge;

        return age;
    },

    isValidString(value: string, prefix: string): ValidateType {
        if (this.isBlank(value)) return { message: prefix + " can't be blank ", error: true };

        if (this.isNumber(value)) return { message: prefix + ' is not numberic ', error: true };

        if (this.isSpecialChars(value))
            return {
                message: prefix + ' is not include special characters ',
                error: true,
            };

        return { message: '', error: false };
    },

    isValidAcceptNunString(value: string, prefix: string): ValidateType {
        if (this.isBlank(value)) return { message: prefix + " can't be blank ", error: true };

        if (this.isSpecialChars(value))
            return {
                message: prefix + ' is not include special characters ',
                error: true,
            };

        return { message: '', error: false };
    },

    description(value: string): ValidateType {
        if (this.isBlank(value)) return { message: `Description can't be blank `, error: true };
        return { message: '', error: false };
    },
    fosterDate(value: string): ValidateType {
        if (this.isBlank(value)) return { message: `Description can't be blank `, error: true };
        return { message: '', error: false };
    },

    message(value: string): ValidateType {
        if (this.isBlank(value)) return { message: `Message can't be blank `, error: true };
        return { message: '', error: false };
    },

    number(value: string | number, name?: string): ValidateType {
        if (!this.isNumber(value.toString())) return { message: `${name} is invalid `, error: true };

        if (Number.parseInt(value.toString()) <= 0) return { message: `${name} is invalid `, error: true };

        return { message: '', error: false };
    },

    infomation(value: string | any[], name?: string | (() => void)): ValidateType {
        const callName = typeof name === 'function' ? name() : name;

        if (typeof value === 'object') {
            if (value.length <= 0) return { message: `${callName} can't be blank `, error: true };
        } else {
            if (this.isBlank(value)) return { message: `${callName} can't be blank `, error: true };

            if (this.isSpecialChars(value)) return { message: `${callName}  is not include special characters `, error: true };
        }

        return { message: '', error: false };
    },

    username(value: string, max = 16): ValidateType {
        if (this.isBlank(value)) return { message: "Username can't be blank ", error: true };

        if (this.isNumber(value)) return { message: 'Username is not numberic ', error: true };

        if (value.length > max)
            return {
                message: `Username must be less than ${max} characters`,
                error: true,
            };

        if (this.isSpecialChars(value))
            return {
                message: 'Username is not include special characters ',
                error: true,
            };

        return { message: '', error: false };
    },

    name(value: string): ValidateType {
        return this.isValidString(value, 'Name');
    },

    title(value: string): ValidateType {
        return this.isValidString(value, 'Name');
    },

    brand(value: string): ValidateType {
        return this.isValidAcceptNunString(value, 'Brand');
    },
    breed(value: string): ValidateType {
        return this.isValidAcceptNunString(value, 'Breed');
    },
    size(value: string): ValidateType {
        return this.isValidAcceptNunString(value, 'Size');
    },
    sex(value: string): ValidateType {
        return this.isValidAcceptNunString(value, 'Sex');
    },
    status(value: string): ValidateType {
        return this.isValidAcceptNunString(value, 'Status');
    },

    link(value: string): ValidateType {
        if (this.isBlank(value)) return { message: '', error: false };

        if (!this.isUrl(value)) return { message: 'Link invalid ', error: true };
        return { message: '', error: false };
    },

    type(value: string): ValidateType {
        return this.isValidString(value, 'Type');
    },

    password(value: string, min = 6): ValidateType {
        const valueTrim = value.trim();

        if (valueTrim.length <= 0) return { message: "Password can't be blank ", error: true };

        if (valueTrim.length < min)
            return {
                message: `Password must be longer than ${min} characters`,
                error: true,
            };

        return { message: '', error: false };
    },

    email(value: string): ValidateType {
        if (this.isBlank(value)) return { message: "Email can't be blank ", error: true };

        if (!this.isEmail(value))
            return {
                message: 'Email is invalid, please try an other email ',
                error: true,
            };

        return { message: '', error: false };
    },

    gender(value: string): ValidateType {
        if (this.isBlank(value)) return { message: "Gender can't be blank ", error: true };

        return { message: '', error: false };
    },
    date(value: string): ValidateType {
        if (this.isBlank(value)) return { message: "Date can't be blank ", error: true };

        const date = new Date(value);

        if (date < new Date()) return { message: 'Date must be greater than or equal to the current date', error: true };

        return { message: '', error: false };
    },

    fullname(value: string): ValidateType {
        if (this.isBlank(value)) return { message: "Fullname can't be blank ", error: true };

        if (this.isSpecialChars(value))
            return {
                message: "Fullname can't include special characters ",
                error: true,
            };

        return { message: '', error: false };
    },
    address(value: string, dataMatch?: any[]): ValidateType {
        if (this.isBlank(value)) return { message: "Address can't be blank ", error: true };

        if (dataMatch) {
            if (dataMatch.length <= 0) return { message: 'Address invalid ', error: true };
        }

        return { message: '', error: false };
    },
    dropdownTippy(value: string, option: { dataMatch?: any[]; name?: string }): ValidateType {
        if (this.isBlank(value)) return { message: `${option?.name || ''} can't be blank `, error: true };

        if (option.dataMatch) {
            if (option.dataMatch.length <= 0) return { message: `${option?.name || ''} invalid `, error: true };
        }

        return { message: '', error: false };
    },
    division<T>(value: string, dataMatch: T[], key: keyof T): ValidateType {
        if (!dataMatch) return { message: 'Address invalid', error: true };

        if (!dataMatch.find((item) => item[key] === value)) return { message: 'Address invalid', error: true };

        return { message: '', error: false };
    },

    birthday(value: string): ValidateType {
        if (this.isBlank(value)) return { message: "Birthday can't be blank ", error: true };
        if (this.isValidBirthday(value)) return { message: 'You are not old enough to use the service ', error: true };

        return { message: '', error: false };
    },

    phone(value: string): ValidateType {
        if (this.isBlank(value)) return { message: "Phone number can't be blank ", error: true };

        if (!this.isPhone(value)) return { message: 'Phone number invalid ', error: true };
        return { message: '', error: false };
    },

    newPassword(value: string, min = 6, curPassword?: string): ValidateType {
        const valueTrim = value.trim();

        if (valueTrim.length <= 0) return { message: "Password can't be blank ", error: true };

        if (valueTrim.length < min)
            return {
                message: `Password must be longer than ${min} characters`,
                error: true,
            };

        if (curPassword && curPassword.length > 0 && curPassword == value) {
            return {
                message: `The new password must not match the old password`,
                error: true,
            };
        }

        return { message: '', error: false };
    },

    confirmPassword(value: string, password?: string): ValidateType {
        if (this.isBlank(value)) return { message: "Password Confirm can't be blank ", error: true };

        const validPass = this.password(value);

        if (validPass.error) return validPass;

        if (password !== value)
            return {
                message: 'Password Confirm is not match with the password',
                error: true,
            };

        return { message: '', error: false };
    },
};

export default Validate;
