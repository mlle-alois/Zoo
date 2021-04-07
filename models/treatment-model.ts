export interface ITreatmentProps {
    treatment_id: number
    treatment_date?: Date
    treatment_observation?: string
    animal_id?: number
    treatment_type_id?: number
    veterinary_id?: number

}

export class TreatmentModel implements ITreatmentProps {
    treatment_id: number
    treatment_date?: Date
    treatment_observation?: string
    animal_id?: number
    treatment_type_id?: number
    veterinary_id?: number

    constructor(props: ITreatmentProps) {
        this.treatment_id = props.treatment_id;
        this.treatment_date = props.treatment_date;
        this.treatment_observation = props.treatment_observation;
        this.animal_id = props.animal_id;
        this.treatment_type_id = props.treatment_type_id;
        this.veterinary_id = props.veterinary_id;

    }

}