import { RequestType } from '../model/request-type'
export class Request {
    public type : RequestType
    public user : string
    public timestamp : string
    public content : any

    constructor(type: string) {
        this.type = RequestType[type]
        this.user = ""
        this.timestamp = ""
        this.content = {}
    }
}