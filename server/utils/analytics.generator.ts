import { Document, Model } from "mongoose";

interface MonthData {
    month: string,
    count: number
}

// this fxn will generate the last 12 months analytics data
export async function generateLast12MonthsData<T extends Document>(model: Model<T>): Promise<{ last12Months: MonthData[] }> {
    const last12Months: MonthData[] = []; // array to store the last 12 months data
    const currentDate = new Date(); // get the current date
    currentDate.setDate(currentDate.getDate() + 1); // add 1 to the current date to get the next day

    // loop through the last 12 months
    for (let i = 11; i >= 0; i--) {
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - i * 28); // get the end date of the month
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), endDate.getDate() - 28); // get the start date of the month

        const monthYear = endDate.toLocaleString('default', { day: 'numeric', month: 'short', year: 'numeric' }); // get the month and year
        // get the count of the documents created between the start and end date
        const count = await model.countDocuments({
            createdAt: {
                $gte: startDate,
                $lte: endDate
            }
        });
        // push the month and count to the last12Months array
        last12Months.push({
            month: monthYear,
            count
        });
    }
    // return the last12Months array
    return { last12Months };


}