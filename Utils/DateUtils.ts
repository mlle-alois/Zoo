export class DateUtils {
    public static getCurrentTimeStamp():string{
        // Prends la date à la valeur actuelle, dans la bonne timezone
        let date = new Date();
        return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
    }

    public static getCurrentTimeStampDate():Date {
        // Prends la date à la valeur actuelle, dans la bonne timezone
        let date = new Date();
        return new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    }
    public static convertDateToISOString(date: Date): string {
        return ((date.toISOString().replace("T", " ")).split("."))[0];
    }
    public static addXHoursToTimeStamp(date : string,hours:number):string{
        let new_date = new Date(date);
        this.addXHoursToDate(new_date,hours);
        return new_date.toISOString();
    }

    public static addXHoursToDate(date: Date,hours: number){
        date.setHours(date.getHours() + hours);
        return date;
    }

}