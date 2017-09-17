export class Entry {
    name: string = "";
    type: string = "";
    source: string = "";
    modules: {id: string, name: string} = {id: "", name: ""};
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


    setData(obj) {
        this.context = obj.context;
        this.definition = obj.definition;
        this.meaning = obj.meaning;
        this.name = obj.name;
        this.source = obj.source;
        this.type = obj.type;
        this.modules = {id:obj.modules,name: ""};
    }
}