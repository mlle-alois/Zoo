import {LogError, MaintenanceBookModel} from "../models"
import {Connection} from "mysql2/promise";
import {StatsController} from "./stats-controller";

export class MaintenanceBookController {

    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    /**
     * Tableau de fréquentation par mois d'un espace
     * @param spaceId
     */
    async getAffluenceArray(spaceId: number): Promise<MaintenanceBookModel | LogError> {
        //récupération des options;
        const monthlyStats = new StatsController(this.connection);
        const year = new Date();
        const array: number[] = [];
        year.setFullYear(year.getFullYear() - 1, 0, 1);
        year.setHours(0, 0, 0);

        for (let i = 0; i < 12; i++) {
            const res = await monthlyStats.getStatsByMonth(spaceId, year);
            if (!(res instanceof LogError)) {
                array[i] = res.affluenceMonth as number;
                year.setMonth(year.getMonth() + 1);
            } else {
                return new LogError({numError: 400, text: ""});
            }
        }
        return new MaintenanceBookModel(array);
    }
}
