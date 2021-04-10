export interface IMediaProps {
    media_id: number
    media_path?: string

}
export class MediaModel implements IMediaProps {
    media_id: number
    media_path?: string | undefined

    constructor(props: IMediaProps) {
        this.media_id = props.media_id;
        this.media_path = props.media_path;
    }
}