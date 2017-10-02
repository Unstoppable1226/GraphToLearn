import { Update } from '../model/update'
import { Comment } from '../model/comment'

/* This class is used for the communication between the API Cowaboo and GraphToLearn */
export class EntryCowaboo {
    name : string = "" // The name of the entry
    type : string = "" // The type of the entry
    source : string = "" // the source of the entry
    modules : string = "" // List of the modules on one string separated with commas
    definition: string = "" // The definition of the entry if his type is an 'Acronyme'
    meaning : string = "" // The meaning of the entry (Most important for users)
    context : string = "" // The context of the entry
    review : string = ""
    keywords : string = "" // The keywords of the entry separated by comma
    parent : string = ""
    timestampCreation : string = ""
    updates : Array<Update> = []
    comments : Array<Comment> = []
    inactive : boolean = false
    commentary : string = ""

    constructor(name : string, type: string, source : string, modules: string, definition: string, meaning : string, context: string, review : string, keywords: string,  parent: string, timestampCreation : string, updates : Array<Update>, comments : Array<Comment>, inactive : boolean, commentary : string) {
        this.name = name;
        this.type = type;
        this.source = source;
        this.modules = modules;
        this.definition = definition;
        this.meaning = meaning;
        this.context = context;
        this.review = review;
        this.keywords = keywords;
        this.parent = parent;
        this.timestampCreation = timestampCreation;
        this.updates = updates;
        this.comments = comments;
        this.inactive = inactive;
        this.commentary = commentary;
    }
}