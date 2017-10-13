import { SettingsReputation } from '../model/settings-reputation'
import { SettingsGeneral } from '../model/settings-general'

export class User {
	mail : string
	reputation : number
	publicKey : string
	secretKey : string
	group : string
	validated : boolean
	observatories : Array<Object>
	settingsReputation : SettingsReputation
	settingsGeneral : SettingsGeneral
	
	constructor() {
		this.mail = ""
		this.reputation = 0
		this.publicKey = ""
		this.secretKey = ""
		this.observatories = []
		this.validated = false
		this.group = ""
		this.settingsReputation = new SettingsReputation()
		this.settingsGeneral = new SettingsGeneral()
	}
}