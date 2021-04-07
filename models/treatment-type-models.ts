export interface ITreatmentTypeProps {
    treatment_type_id?: number,
    treatment_type_libelle?: string
}

export class TreatmentTypeModel implements  ITreatmentTypeProps{
    treatment_type_id?: number
    treatment_type_libelle?: string

    constructor(props: ITreatmentTypeProps) {
        this.treatment_type_id = props.treatment_type_id;
        this.treatment_type_libelle = props.treatment_type_libelle;
    }

}