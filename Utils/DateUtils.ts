export class DateUtils {
    public static getCurrentTimeStamp() {
        // Prends la date à la valeur actuelle, dans la bonne tiemzone
        var date = new Date();
        return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
    }
}