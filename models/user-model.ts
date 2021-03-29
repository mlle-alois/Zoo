export interface IUserProps {
    userId?: number;
    mail?: string;
    password?: string;
    name?: string;
    firstname?: string;
    phoneNumber?: string;
    typeId?: number;
}

export class UserModel implements IUserProps {
    userId?: number;
    mail?: string;
    password?: string;
    name?: string;
    firstname?: string;
    phoneNumber?: string;
    typeId?: number;

    constructor(properties: IUserProps) {
        this.userId = properties?.userId;
        this.mail = properties?.mail;
        this.password = properties?.password;
        this.name = properties?.name;
        this.firstname = properties?.firstname;
        this.phoneNumber = properties?.phoneNumber;
        this.typeId = properties?.typeId;
    }
}