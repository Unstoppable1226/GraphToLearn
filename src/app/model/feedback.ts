import { Proposition } from '../model/proposition'

export class Feedback {
    propositions: Array<Proposition> = []
    rating : number = 0
    author : string = ""

    setData(props : Array<Proposition>, rating : number, author : string) {
        this.propositions = props
        this.rating = rating,
        this.author = author
    }
}