export class AppSettings {

	/* General Informations */
	public static TITLE = "GraphToLearn";

	/* Informations about API and how is constructed the URL */
	public static API_ENDPOINT='http://groups.cowaboo.net/group-graphToLearn/public/api/';
	public static API_OBSERVATORY = AppSettings.API_ENDPOINT + "observatory";
	public static API_ENTRY = AppSettings.API_ENDPOINT + "entry";
	public static API_ENTRYMETADATA = AppSettings.API_ENTRY + "/conf?";
	public static API_USERS = AppSettings.API_ENDPOINT + "user";
	public static API_TRANSFER = AppSettings.API_USERS + "/transfer?";

	public static API_TAGS = AppSettings.API_ENDPOINT + "tags";
	
	public static API_WORDS = "Words";
	public static API_MODULES = "Modules";
	public static API_TYPES = "Types";
	public static API_CONTEXT= "Context";
	public static API_METASEARCHCLICK= "searchClick";
	public static API_METALIKE= "like";
	public static API_METADISLIKE= "dislike";

	/* URL */
	public static URL_SEARCH = 'http://localhost:4200/search/'
	public static FORWARD_SLACH = "ForwardSlash"
	public static OPEN_PARENTHESIS = "OpenParenthesis"
	public static CLOSE_PARENTHESIS = "CloseParenthesis"

	/* API Wikipedia */
	//https://fr.wikipedia.org/w/api.php?action=query&list=search&srsearch=Albert%20Einstein&utf8
	//https://fr.wikipedia.org/w/api.php?action=query&prop=extracts&titles=Adresse%20IP&format=json&exintro=1

	public static API_WIKI = "http://fr.wikipedia.org/w/api.php?"

	/* Colors */
	public static GREY = "#333";
	public static WHITEMOREDARK = "#EEE";
	public static BLACK = "#000";
	public static WHITE = "#FFF";

	/* Alert */
	public static MSGSUCCESS = "Les informations ont été inséré avec succès";
	public static MSGERROR = "Un problème est survenu lors de l'insertion des données, Veuillez réessayer svp !";
	public static MSGINCOMPLETED = "Vous n'avez pas renseigner tous les champs requis pour l'insertion des données !";
	public static MSGWELCOME = "Vous êtes connecté sur GraphToLearn, Bienvenue ";

	/* 3D variables */
	public static MINX : number = 40;
	public static COLORSSPHERES : Array<string> = ['#0D47A1', '#64B5F6', '#BBDEFB', '#E3F2FD', '#FFFFFF'];

	/* Reputation Rules */
	public static COEFRULES : Array<number> = [2.5, 2, 1.5, 1, 0.5]
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