export class AppSettings {

	/* General Informations */
	public static TITLE = "GraphToLearn";

	/* Informations about API and how is constructed the URL */
	public static API_ENDPOINT='http://groups.cowaboo.net/group-graphToLearn/public/api/';
	public static API_OBSERVATORY = AppSettings.API_ENDPOINT + "observatory";
	public static API_ENTRY = AppSettings.API_ENDPOINT + "entry";
	public static API_USERS = AppSettings.API_ENDPOINT + "user";

	public static API_OBSERVATORYMETADATA = AppSettings.API_OBSERVATORY + "/conf?";
	public static API_ENTRYMETADATA = AppSettings.API_ENTRY + "/conf?";
	public static API_TRANSFER = AppSettings.API_USERS + "/transfer?";

	public static API_TAGS = AppSettings.API_ENDPOINT + "tags";
	
	public static API_WORDS = "Words";
	public static API_MODULES = "Modules";
	public static API_HISTORY = "History";
	public static API_TYPES = "Types";
	public static API_MEMBERS = "Members";
	public static API_FEEDBACK= "Feedback";
	public static API_SETTINGS= "Settings";
	public static API_CONTEXT= "Context";
	
	public static API_METASEARCHCLICK= "searchClick";
	public static API_METALIKE= "like";
	public static API_METADISLIKE= "dislike";
	public static API_METAHISTORYSEARCH= "historySearch";
	public static API_METAREVISIONS= "REVIEW_";
	public static API_METAFEEDBACKPROP= "feedback";


	public static RULELAMBDA= "Lambda";
	public static RULEEDITOR= "Editor";
	public static RULEADMINISTRATOR= "Administrator";


	public static TAGMEMBERS = "members"
	public static TAGSETTINGS = "settings"

	/* URL */
	public static URL_SEARCH = 'http://localhost:4200/search/'
	public static FORWARD_SLACH = "ForwardSlash"
	public static OPEN_PARENTHESIS = "OpenParenthesis"
	public static CLOSE_PARENTHESIS = "CloseParenthesis"

	/* API Wikipedia */
	//https://fr.wikipedia.org/w/api.php?action=query&list=search&srsearch=Albert%20Einstein&utf8
	//https://fr.wikipedia.org/w/api.php?action=query&prop=extracts&titles=Adresse%20IP&format=json&exintro=1

	public static API_WIKI = "http://fr.wikipedia.org/w/api.php?"
	public static API_STELLAR_FRIENDBOT = "https://horizon-testnet.stellar.org/friendbot?addr="

	public static API_KEY = "SCD3L76IHDAZRVAY3MH2G3T2UAUMVFIR3I26RLLWEYIJ3EWHLD5G6QP4"

	/* Colors */
	public static GREY = "#333";
	public static WHITEMOREDARK = "#EEE";
	public static BLACK = "#000";
	public static WHITE = "#FFF";

	public static COL_SEARCH_TERM = "#0D47A1";
	public static COL_KEY_WORDS = "#95A5A6";
	public static COL_MODULE = "#D35400";
	public static COL_OTHER_TERMS = "#21BA45";

	/* Alert */
	public static MSGSUCCESS = "Les informations ont été inséré avec succès";
	public static MSGERROR = "Un problème est survenu lors de l'insertion des données, Veuillez réessayer svp !";
	public static MSGINCOMPLETED = "Vous n'avez pas renseigner tous les champs requis pour l'insertion des données !";
	public static MSGWELCOME = "Vous êtes connecté sur GraphToLearn, Bienvenue ";
	public static MSGMAILSUCCESS = "Votre compte a été créé, vous allez recevoir sous peu vos informations par mail et dès que votre demande d'adhésion est accepté par un membre de la communauté, vous pourrez utiliser l'outil";
	public static MSG_ERROR_MAIL_EMPTY = "Veuillez renseigner votre email ! ";
	public static MSG_ERROR_MAIL_INVALID = "L'email saisi est invalide, veuillez insérer un email valide !"
	public static MSG_ERROR_SECRETKEY_EMPTY = "Veuillez renseigner le champ Secret Key ! ";
	public static MSG_ERROR_MAIL_TAKEN = "Attention, un utilisateur avec cet email existe déjà !";
	public static MSG_ERROR_CREATE_USER = "Attention, un problème est survenu lors de la création du compte, veuillez réessayer !";
	public static MSG_ERROR_LOG_IN = "La secret key saisie est incorrecte !";
	public static MSG_SUCCESS_MODIFICATION = "Les modifications ont été enregistrées avec succès !";

	public static MSG_ERROR_INFO_MODULE_EMPTY = "Veuillez compléter tous les champs requis : N° du module, Nom du module et Objectifs du module"
	public static MSG_ERROR_NO_MODULE_TAKEN = "Veuillez choisir un autre n° pour l'identifiant du module, car ce dernier a déjà été utilisé !"

	public static MSG_MODULE_INSERT_SUCCESS = "Le module a été inséré avec succès, il se trouve désormais avec les existants !"
	public static MSG_MODULE_INSERT_ERROR = "Une erreur est survenue et le module n'a pas pu être inséré !"

	/* 3D variables */
	public static MINX : number = 40;
	
	//public static COLORSSPHERES : Array<string> = ['#0D47A1', '#64B5F6', '#BBDEFB', '#E3F2FD', '#FFFFFF'];
	public static COLORSSPHERES : Array<string> = [AppSettings.COL_OTHER_TERMS, AppSettings.COL_OTHER_TERMS, AppSettings.COL_OTHER_TERMS, AppSettings.COL_OTHER_TERMS, AppSettings.COL_OTHER_TERMS];
	public static COLORSKEYWORDS : Array<string> = [AppSettings.COL_KEY_WORDS, AppSettings.COL_KEY_WORDS, AppSettings.COL_KEY_WORDS, AppSettings.COL_KEY_WORDS, AppSettings.COL_KEY_WORDS];
	/* Reputation Rules */
	public static COEFRULES : Array<number> = [3, 2.5, 1.5, 1, 0.5, 2]
	public static TIMESTAMPRULE : Array<number[]> = [[0,10],[3,8],[7,6],[30,4],[90,2],[360,0]]

	/* Table that contains words that must be deleted by the algorithm when he will create the world for the response*/
	public static articles = [ "un", "une", "le", "la", "les", "l'", "d'","de", "du", "des", "à", "au", "aux"]

	public static connectors = [
		"prenant",
		"peuvent",
		"nom",
		"entre",
		"plus",
		"moins",
		"exemple",
		"seule",
		"permet",
		"dont",
		"tous",
		"quelles",
		"vont",
		"va",
		"sont",
		"est",
		"a",
		"avons",
		"aura",
		"répondre",
		"ne",
		"a condition que",
		"a défaut de",
		"a moins que",
		"a savoir",
		"a supposer que",
		"afin",
		"afin que",
		"ainsi que",
		"ainsi",
		"alors que",
		"alors",
		"apparemment",
		"après que",
		"après",
		"attendu que",
		"au cas où",
		"au contraire",
		"au lieu de",
		"au moment où",
		"aussi que", 
		"aussi",
		"autant que",
		"avant que",
		"bien que",
		"bien sûr",
		"bref",
		"but",
		"car",
		"c'est-à-dire",
		"ce n’est pas que",
		"cependant",
		"certes",
		"comme si",
		"comme",
		"conséquemment",
		"c’est ainsi que",
		"c’est le cas de",
		"c’est pourquoi",
		"c’est-à-dire",
		"dans la mesure où",
		"dans le cas où",
		"dans l’hypothèse où",
		"de façon que",
		"de façon à ce que",
		"de la même façon que",
		"de l’autre",
		"de manière que",
		"de même que",
		"de même",
		"de peur que",
		"de plus",
		"de plus",	
		"de sorte que",
		"de surcroît",
		"depuis que",
		"deuxièmement",
		"donc",
		"du fait de",
		"du fait que",
		"dès lors que",
		"d’abord",
		"d’ailleurs",
		"d’où",
		"d’un autre côté",
		"d’un côté", 
		"effectivement",
		"en admettant que",
		"en conclusion",
		"en conséquence",
		"en dehors de",
		"en dernier lieu",
		"en deuxième lieu",
		"en définitive",
		"en dépit de",
		"en effet",
		"en fait",
		"en guise de conclusion",
		"en même temps que",
		"en outre",
		"en particulier",
		"en premier lieu",
		"en raison de",
		"en revanche",
		"en résumé",
		"en somme",
		"en sorte que",
		"en supposant que",
		"en troisième lieu",
		"en un mot",
		"en vue de",
		"encore",
		"enfin",
		"ensuite",
		"entre autre",
		"etant donné que",
		"eu égard à",
		"excepté",
		"finalement",
		"grâce à",
		"hormis",
		"il est vrai que",
		"lorsque",
		"l’autre",
		"l’un", 
		"mais encore",
		"mais",
		"mais", 
		"malgré",
		"mis à part que",
		"moins que",
		"même si",
		"non moins que",
		"non seulement" ,
		"non seulement",
		"notamment",
		"néanmoins",
		"or",
		"ou bien",	
		"ou",
		"par conséquent",
		"par contre",
		"par exemple",
		"par suite de",
		"par suite",
		"par",
		"parce que",
		"parce que",	
		"partant",
		"pendant que",
		"plus que",
		"pour conclure",
		"pour peu que",
		"pour que",	
		"pour sa part",
		"pourtant",
		"pourvu que",
		"premièrement ",
		"probablement",
		"puis",
		"puis", 
		"puisque",
		"quand",
		"quant à",	
		"quel que soit",
		"quoique",
		"sans doute",
		"sauf",
		"selon que",
		"semblablement",
		"seulement", 
		"si bien que",
		"si que",
		"si",
		"simplement",
		"soit",
		"sous prétexte que",
		"suivant que",
		"tandis que",
		"tant et",
		"tantôt",
		"tout d’abord",
		"toutefois",
		"uniquement",
		"vu que",
		"également",
		"évidemment",
		"que",
		"qu'",
		"qui",
		"quoi",
		"et",
		"à qui",
		"pour",
		"je" , "tu", "il", "elle", "nous", "vous", "ils", "elles", "on",
		"me", "te", "le", "les", "nous","vous", "leur",
		"lui", "en", "y", "moi", "toi",
		"ce", "c'", "ça", "cela", "ceci", "celui", "celle", "celui-ci", "celle-là", "ceux", "celles", "ceux-ci", "ceux-là", "celles-ci", "celles-là",
		"qu'elle", "qu'il", "lequel", "laquelle", "lesquels",
		"le mien", "la mienne", "le tien", "la tienne", "le sien", "la sienne", "le nôtre", "la nôtre", "le vôtre", "la vôtre", "le leur", "la leur", "les miens", "les miennes", "les tiens", "les tiennes",  "les siens", "les siennes", "les nôtres", "les vôtres", "les leurs",
		"son", "sa", "ses", "sur", "au fur et à mesure", "se",
		"d'un", "d'une", "plusieurs", "dans", "comment",
	]

}