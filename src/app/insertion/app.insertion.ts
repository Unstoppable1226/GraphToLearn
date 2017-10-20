/* Core */
import { Component, AfterViewInit } from '@angular/core';
import { OnInit } from '@angular/core';

/* Alerts */
import { AlertsService, AlertType } from '@jaspero/ng2-alerts';

/* Services */
import { HttpAPIService } from '../api/app.http-service';
import { HistorySearchService } from '../model/history-search';
import { UserService } from '../model/user-service';

/* Constants */ 
import { AppSettings } from '../settings/app.settings';

/* Models  */
import { Entry } from '../model/entry'
import { EntryCowaboo } from '../model/entrycowaboo'
import { Request } from '../model/request'
import { RequestType } from '../model/request-type'

/* Tools  */
import { Formatter } from '../tools/app.formatter';

declare var $:any; // This is necessary if you want to use jQuery in the app

@Component({
	selector: 'app-insertion',
	templateUrl: './app.insertion.html',
	styleUrls: ['./app.insertion.css'],
})

export class AppInsertion implements OnInit{

	public loading : boolean = false

	public newModule = false;
	public nameTaken = false;
	public nameTakenModule = false;

	public nameChosen = false;
	public nameChosenModule = false;
	public showDefinition = false;
	public loadingAddModule = false;
	public newModuleObj : any= {id: "", name:"", goals: ""}

	public errorAddModule = false;
	public errorTextAddModule = "";
	
	public msgIdModuleTaken = "Ce N° est disponible"
	public msgNameTaken = "Ce nom est disponible";

	public styleModuleNew = AppSettings.WHITEMOREDARK;
	public styleModuleNewCol = AppSettings.BLACK;
	public styleModuleEx = AppSettings.GREY;
	public styleModuleExCol = AppSettings.WHITE;

	public data = {};
	public types = [];
	
	public modules : Array<any> = [];
	public valuesModules : Array<any> = []

	public contexts = [];
	public word : string = '';
	public newModules : string = '';
	public source : string = ""; // Separate with the comma
	public definition : string = ""; 
	public meaning : string = "";

	public items = [];

	constructor(private _httpService : HttpAPIService, private _format : Formatter, private _alert: AlertsService, private _userservice : UserService, private _historysearch : HistorySearchService) {}

	ngOnInit() {
		this._format.deleteAllModals()
		this._userservice.getCurrentUser()
		console.log(this._historysearch.getLastSearches())
		
		this.types.splice(0,this.types.length);
		this.contexts.splice(0,this.contexts.length);
		this.modules.splice(0,this.contexts.length);
		this.types.push({ name: 'Aucun', value: 'Aucun', selected: true })
		this.getData(AppSettings.API_TYPES, this.types); // Get the data of types
		this.getData(AppSettings.API_CONTEXT, this.contexts); // Get the data of contexts
		this.getData(AppSettings.API_MODULES, this.modules); // Get the data of contexts
	}

	ngAfterViewInit(){
		let instance = this;
		console.log(this.types)
		$('.ui.dropdown.context').dropdown();
		$('.ui.dropdown.multiple').dropdown({allowAdditions: true,});
		this.isUnique(0, '#wordInfo', 'name');
	}

	isModuleValid() {
		return (this.newModuleObj.id != "" && this.newModuleObj.name != "" && this.newModuleObj.goals != "")
	}
	
	afterModuleInserted(data) {
		console.log(data);
		this.loadingAddModule = false;
		let element: any = {}
		element.selected = true;
		element.text = this.newModuleObj.id;
		element.name = this.newModuleObj.id + " - " + this.newModuleObj.name
		element.value = this.newModuleObj.id;
		this.valuesModules.push(element)
		this.switchExistsOrAddModule(false, 'A')
		$('.ui.dropdown.multiple').dropdown({values : this.valuesModules})

		this.newModuleObj = {id: "", name:"", goals: ""}
		this._alert.create('success', AppSettings.MSG_MODULE_INSERT_SUCCESS);
	}

	addModule() {
		this.errorAddModule = (!this.isModuleValid() || this.nameTakenModule)
		if (this.errorAddModule) { // Module invalid
			this.errorTextAddModule = this.nameTakenModule ? AppSettings.MSG_ERROR_NO_MODULE_TAKEN : AppSettings.MSG_ERROR_INFO_MODULE_EMPTY
		} else {
			this.loadingAddModule = true;
			
			this._httpService.postEntryJSON(this.newModuleObj, AppSettings.API_MODULES, this.newModuleObj.id, this._userservice.currentUser.secretKey)
			.subscribe(
				data => {
					this.afterModuleInserted(data)
				},
				error => {
					this._alert.create('error', AppSettings.MSG_MODULE_INSERT_ERROR);
				}
				
			)

		}
	}

	addRemoveClass(el, classesRemove, classesAdd) {
		$(el).removeClass(classesRemove).addClass(classesAdd);
	}

	isUnique(idChoice, idSelectTagHtml, property) {
		let instance = this;
		let test = idChoice == 0
		let word = (test ? instance.word : instance.newModuleObj.id)
		let apiObservatory = (test ? AppSettings.API_WORDS : AppSettings.API_MODULES)
		if (word != "") {
			instance.addRemoveClass(idSelectTagHtml, 'info', 'circle notched loading')
			test ? instance.nameChosen = test : instance.nameChosenModule = !test
			instance._httpService.getEntryJSON(apiObservatory)
			.subscribe(
				function(response) {
					let obj = response.dictionary.entries, data, props = Object.keys(obj), count = 0, i = 0
					while(i <= props.length - 1 && count < 1) {
						data = JSON.parse(obj[props[i]].value);
						count = count + (word.toLowerCase() == data[property].toLowerCase() ? 1 : 0);
						i++
					}
					setTimeout(function(){
						instance.addRemoveClass(idSelectTagHtml, 'circle notched loading', 'info')
					}, 200);
					
					test ? (instance.nameTaken = count >= 1) :  (instance.nameTakenModule = count >= 1)
					test ? (instance.msgNameTaken = instance.nameTaken ? "Ce nom existe déjà !":  "Ce nom est disponible") : (instance.msgIdModuleTaken = instance.nameTakenModule ? "Ce n° a déjà été choisi !":  "Ce n° est disponible")
				}
			)
		} else {
			test ? instance.nameChosen = !test : instance.nameChosenModule = test
		}
	}

	getModulesValues() {
		this.valuesModules.splice(0, this.valuesModules.length)
		this.valuesModules.push(...this.modules)
		for (var index = 0; index < this.valuesModules.length; index++) {
			var element = this.valuesModules[index];
			element.selected = false;
			element.text = element.id;
			element.name = element.id + " - " + element.name
			element.value = element.id;
		}
		$('.ui.dropdown.multiple').dropdown({values : this.valuesModules})
	}

	getData(observatory, table : Array<any>) {
		let instance = this
		let isModules = table == instance.modules
		this._httpService.getEntryJSON(observatory).subscribe(
			response => {
				let obj = response.dictionary.entries;
				
				for (let prop in obj){ table.push(isModules ? JSON.parse(obj[prop].value) : obj[prop]);}
				if (isModules) {instance.getModulesValues()}
				if (table == instance.types) {
					for (var index = 0; index < instance.types.length; index++) {
						var element = instance.types[index];
						element.name = element.value
						element.selected = false;
					}
					$('#select-types').dropdown({ values: instance.types })
					$('#select-types').dropdown('set selected', 'Aucun')
					$('#select-types').dropdown({action : function(text, value, element){
						$('#select-types').dropdown('set selected', value)
						$('#select-types').dropdown('hide')
						instance.showDefinition = (text == 'Acronyme')
					}});
				}
			},
			error => { console.log(error) }
		)
	}

	validated() { // Function who validates if everything is ok before the insert
		return this.word != "" && this.source != "" && this.meaning != ""; // Value required to insert
	}

	reinit() {
		this.word = ""; this.source = ""; this.definition = ""; this.meaning = ""; this.newModules = "";
		this.items.splice(0, this.items.length)
		this.ngOnInit();
	}

	saveInsertion() {
		if (this.validated()) {
			let tags = "";
			for (var index = 0; index < this.items.length; index++) {
				var element = this.items[index];
				tags = tags + element.display + (index == this.items.length -1 ? "": ", ")
			}
			
			let instance = this;
			this.loading = true;
			
			let modules = this.newModules.split(',');
			let modulesNotNew = $('.ui.dropdown.multiple').dropdown('get value');
			let type = $('#select-types').dropdown('get value') == "Aucun" ? "" :  $('#select-types').dropdown('get value')
			let context = $('#select-context').text() == "Aucun" ? "" : $('#select-context').text()
			
			let dataInfo = new EntryCowaboo(this.word, type, this.source, modulesNotNew, this.definition, this.meaning, context, "", tags, "", this._format.getTodayTimestamp(), [], [], false, "", this._userservice.currentUser.mail)
			
			if (this._userservice.currentUser.group == AppSettings.RULEADMINISTRATOR) {
				instance._httpService.postEntryJSON(dataInfo, AppSettings.API_WORDS, dataInfo.name, instance._userservice.currentUser.secretKey)
				.subscribe(
					response => { // The communication with the API has matched
						console.log(response)
						instance._httpService.postEntryMetadata(AppSettings.API_METASEARCHCLICK, 0, response, instance._userservice.currentUser.secretKey) // Put searchClick to 0
						.subscribe(
							resp =>  {
								instance._httpService.postBalance(AppSettings.API_PUBKEY, AppSettings.API_KEY, instance._userservice.currentUser.publicKey, Number(instance._userservice.currentUser.settingsReputation.repNew))
								.subscribe(
									transferResponse => {
										console.log(transferResponse)
										if (transferResponse) {
											instance.loading = false;
											instance._alert.create('success', AppSettings.MSGSUCCESS)
											this._userservice.currentUser.reputation += instance._userservice.currentUser.settingsReputation.repNew
											data => instance.data = data
											instance.reinit();
										}
									}
								)
								
							}	
						)
					},
					// The communication with the API has not matched
					error => {instance.loading = false; instance._alert.create('error', AppSettings.MSGERROR); },
				)
			} else {
				this.sendRequest(dataInfo)
			}
		} else {
			 this._alert.create('warning', AppSettings.MSGINCOMPLETED);
		}
	}

	sendRequest(dataInfo : EntryCowaboo) {
		let request : Request = new Request(AppSettings.TYPEREQUESTNEW)
		request.user = this._userservice.currentUser.mail
		request.timestamp = this._format.getTodayTimestamp()
		request.textType = AppSettings.TEXTREQUESTNEW
		request.content = dataInfo
		request.publicKeySender = this._userservice.currentUser.publicKey
		this._httpService.postEntryJSON(request, AppSettings.API_REQUESTS, AppSettings.TYPEREQUESTNEW + "-" + dataInfo.name, this._userservice.currentUser.secretKey)
		.subscribe(
			res => {
				this.loading = false;
				this.reinit();
				this._alert.create('success', "La communauté vous remercie pour votre proposition d'insertion de l'entrée : " + dataInfo.name + ", sur GraphTolearn. Votre demande sera accepter ou refuser par des membres éditeurs ou administrateurs et vous serez notifier dès qu'elle sera traitée", {duration:30000})
			}
		)
	}

	switchExistsOrAddModule(val, choice) {
		let choiceA = choice == 'A'
		let choiceB = choice == 'B'
		this.newModule = val;
		this.styleModuleNew = (choiceA ? AppSettings.WHITEMOREDARK : AppSettings.GREY);
		this.styleModuleNewCol = (choiceA ? AppSettings.BLACK : AppSettings.WHITE);
		this.styleModuleEx = (choiceB ? AppSettings.WHITEMOREDARK : AppSettings.GREY);
		this.styleModuleExCol = (choiceB ? AppSettings.BLACK : AppSettings.WHITE);
	}
}