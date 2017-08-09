export class Entry {
    name: string = "";
    type: string = "";
    source: string = "";
    modules: string = "";
    definition: string = "";
    timestampCreation: string = "";
    timestampUpdate: string = "";
    inactive: boolean = false;
    hierarchy: string = "";
    meaning: string = "";
    context: string = "";
    author: {} = { name: "", search: "" };
    searchClick: number = 0;
    count: number = 0;
    position: number = 0;
    lastUpdatedNbDays : number = 0;
    repRule1: number = 0;
    repRule2: number = 0;
    repRule3: number = 0;
    repRule4: number = 0;
    repRule5: number = 0;
    totalReput : number = 0;
    like: number = 0;
    dislike: number = 0;


    setData(obj) {
        this.context = obj.context;
        this.definition = obj.definition;
        this.meaning = obj.meaning;
        this.name = obj.name;
        this.source = obj.source;
        this.type = obj.type;
        this.modules = obj.modules;
    }
}