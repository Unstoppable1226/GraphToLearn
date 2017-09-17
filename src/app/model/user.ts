import { SettingsReputation } from '../model/settings-reputation'
export class User {
	mail: string = "";
	reputation: number = 0;
	publicKey: string = "";
	secretKey: string = "";
	observatories : Array<Object> = [];
	validated : boolean = false
	group : string = ""
	settingsReputation : SettingsReputation = new SettingsReputation()
}