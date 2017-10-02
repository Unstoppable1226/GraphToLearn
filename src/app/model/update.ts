export class Update {
    version: string = ""
    timestamp: string = ""
	author: string = "";
	isApproved: boolean = true;
    
    constructor(version, timestamp, author, isApproved){
        this.version = version;
        this.timestamp = timestamp;
        this.author = author;
        this.isApproved = isApproved;
    }
}