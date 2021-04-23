
export class MaintenanceBookModel{
    months: string[];
    data: number[];

    constructor(array: number[]) {
        this.data = array;
        this.months = [
            "Janvier",
            "Février",
            "Mars",
            "Avril",
            "Mai",
            "Juin",
            "Juillet",
            "Aout",
            "Septembre",
            "Octobre",
            "Novembre",
            "Décembre"
        ]
    }

    public displayArrays()  {
        const res = [""];
        let lowest = 1;
        for (let i = 1; i < 13; i++) {
            res[i] = this.months[i - 1] + " : " + this.data[i - 1];
        }
        for (let i = 2; i < 13; i++) {
            if (this.data[i] < this.data[lowest]) {
                lowest = i;
            }
        }
        res[res.length] = "Le mois le plus propice pour une maintenance est le mois de " + this.months[lowest - 1].toLocaleLowerCase();
        return res;
    }
}