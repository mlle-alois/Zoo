export interface ISessionProps {
    sessionId?: number;
    token?: string;
    createdAt?: any;
    updatedAt?: any;
    deletedAt?: any;
    userId?: number;
}

export class SessionModel implements ISessionProps {
    sessionId?: number;
    token?: string;
    createdAt?: any;
    updatedAt?: any;
    deletedAt?: any;
    userId?: number;

    constructor(properties: ISessionProps) {
        this.sessionId = properties.sessionId;
        this.token = properties.token;
        this.createdAt = properties.createdAt;
        this.updatedAt = properties.updatedAt;
        this.deletedAt = properties.deletedAt;
        this.userId = properties.userId;
    }
}