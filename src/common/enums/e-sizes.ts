export enum ESize {
    S = 'S',
    M = 'M',
    L = 'L',
    XL = 'XL',
    '2XL' = '2XL',
}

export const valuesSize = () => {
    const prevValues = Object.values(ESize);

    return prevValues;
};
