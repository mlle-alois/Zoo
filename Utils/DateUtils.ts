export class DateUtils {
    public static getCurrentTimeStamp():string{
        // Prends la date à la valeur actuelle, dans la bonne timezone
        let date = new Date();
        return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
    }

    public static convertDateToISOString(date: Date): string {
        return ((date.toISOString().replace("T", " ")).split("."))[0];
    }

    /**
     * Ajoute x heures à la date entrée en paramètre
     * @param date
     * @param hours
     */
    public static addXHoursToDate(date: Date,hours: number){
        date.setHours(date.getHours() + hours);
        return date;
    }

}
