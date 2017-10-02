export class Comment {
    info : string = ""
    author : string = "";
    timestamp : string = "";
    likes : Array<string> = [];

    constructor(info : string, author: string, timestamp : string, likes : Array<string>) {
        this.info = info;
        this.author = author;
        this.timestamp = timestamp;
        this.likes = likes;
    }
}