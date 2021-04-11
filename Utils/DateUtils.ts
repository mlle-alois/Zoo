export class DateUtils {
    public static getCurrentTimeStamp() {
        // Prends la date à la valeur actuelle, dans la bonne timezone
        var date = new Date();
        return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
    }

    public static convertDateToISOString(date: Date): string {
        return ((date.toISOString().replace("T", " ")).split("."))[0];
    }
}