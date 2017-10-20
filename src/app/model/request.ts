import { RequestType } from '../model/request-type'
export class Request {
    public type : RequestType
    public user : string
    public timestamp : string
    public content : any
    public textType : string
    public text : string
    public result : boolean
    public validatedBy : string
    public publicKeySender : string
    public reputationGained : number

    constructor(type: string) {
        this.type = RequestType[type]
        this.user = ""
        this.timestamp = ""
        this.content = {}
        this.textType = ""
        this.text = ""
        this.result = null
        this.validatedBy = ""
        this.publicKeySender = ""
        this.reputationGained = 0
    }
}