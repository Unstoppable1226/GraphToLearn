import { SettingsReputation } from '../model/settings-reputation'
export class User {
	mail: string
	reputation: number
	publicKey: string
	secretKey: string
	observatories : Array<Object>
	validated : boolean
	group : string
	settingsReputation

	constructor() {
		this.mail = ""
		this.reputation = 0
		this.publicKey = ""
		this.secretKey = ""
		this.observatories = []
		this.validated = false
		this.group = ""
		this.settingsReputation = new SettingsReputation()
	}
}