export function formatDateToDDMMYYYY(date: Date) {
    if (!(date instanceof Date)) {
        throw new TypeError('The provided argument is not a Date object.');
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
}

export const asyncFor = async <T>(array: T[], asyncCallback: (item: T) => Promise<T>) => {
    for (let item of array) {
        await asyncCallback(item);
    }
};

export const generateUuid = () => {
    return Math.random().toString() + Math.random().toString() + Math.random().toString();
}