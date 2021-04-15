export class DateUtils {
    public static getCurrentTimeStamp(): string {
        return this.getCurrentDate().toISOString();
    }
    public static getCurrentDate(): Date {
        var date = new Date();
        return new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    }

    public static convertDateToISOString(date: Date): string {
        return ((date.toISOString().replace("T", " ")).split("."))[0];
    }
}