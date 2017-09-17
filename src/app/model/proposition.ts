export class Proposition {
    proposition: string = ""
    timestamp : string = ""
    author : string = ""

    constructor(proposition: string, timestamp: string, author : string) {
        this.proposition = proposition
        this.timestamp = timestamp
        this.author = author
    }
}