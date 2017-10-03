import { Update } from '../model/update'
import { Comment } from '../model/comment'

export class Entry {
    name: string = "";
    type: string = "";
    source: string = "";
    modules: {id: Array<string>, name: string} = {id: [], name: ""};
    definition: string = "";
    timestamp: string = "";
    timestampCreation: string = "";
    timestampUpdate: string = "";
    inactive: boolean = false;
    hierarchy: string = "";
    meaning: string = "";
    context: string = "";
    author: {name: string, search : string} = { name: "", search: "" };
    searchClick: number = 0;
    count: number = 0;
    position: number = 0;
    lastUpdatedNbDays : number = 0;
    lastUpdated : string = "";
    lastUpdatedAuthor : string ="" ;
    repRule1: number = 0;
    repRule2: number = 0;
    repRule3: number = 0;
    repRule4: number = 0;
    repRule5: number = 0;
    repRule6: number = 0;
    totalReput : number = 0;
    canLike : boolean = false;
    canDislike : boolean = false;
    like: {number: number, author: string} = {number: 0, author: ""};
    dislike:  {number: number, author: string} = {number: 0, author: ""};
    likes: Array<any> = [];
    dislikes: Array<any> = [];
    parent: string = "";
    commentary : string = "";
    review : string = "";
    ict : string = "";
    cpte : string = "";
    modulesReputation: Array<any> = []
    animationLeft : string = "";
    animationRight : string = "";
    keywords : Array<string> = [];
    updates : Array<Update> = [];
    comments : Array<Comment> = [];

    setData(obj) {
        this.context = obj.context.trim();
        this.definition = obj.definition.trim();
        this.meaning = obj.meaning
        this.name = obj.name;
        this.source = obj.source.trim();
        this.type = (obj.type.trim() == "name" ? "Terme" : obj.type.trim());
        let modules = obj.modules.replace(/\.0/g, "");
        try {
            this.updates = obj.updates == undefined ? [] : JSON.parse(obj.updates);
        } catch (error) {
            this.updates = obj.updates == undefined ? [] : obj.updates;
        }
       
        this.modules = {id:modules.split(/,|-/),name: modules};
        this.keywords = ((obj.keywords == undefined || obj.keywords == "") ? new Array() : obj.keywords.split(', '))
        this.commentary = obj.commentary == undefined ? "" : obj.commentary.trim()
        if (this.commentary != "" && obj.comments == undefined) {
            this.comments = []
            this.comments.push(new Comment(this.commentary, this.source, obj.timestampCreation, []))
        } else {
            try {
                this.comments = JSON.parse(obj.comments);
            } catch (error) {
                this.comments = obj.comments == undefined ? [] : obj.comments;
            }
        }
        if (this.updates.length > 0) {
            this.lastUpdated = this.updates[this.updates.length-1].timestamp
            this.lastUpdatedAuthor = this.updates[this.updates.length-1].author
        } else {
            this.lastUpdatedAuthor = ""
        }
        
        this.parent = obj.parent == undefined ? "": obj.parent;
        this.inactive = obj.inactive == undefined ? "": obj.inactive;
    }
}