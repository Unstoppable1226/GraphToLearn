export class AppSettings {

        /* General Informations */
        public static TITLE = "GraphToLearn";

	/* Informations about API and how is constructed the URL */
   	public static API_ENDPOINT='http://groups.cowaboo.net/group-graphToLearn/public/api/';
   	public static API_OBSERVATORY = AppSettings.API_ENDPOINT + "observatory";
   	public static API_ENTRY = AppSettings.API_ENDPOINT + "entry";
   	public static API_TAGS = AppSettings.API_ENDPOINT + "tags";
   	
   	public static API_WORDS = "Words";
   	public static API_MODULES = "Modules";
        public static API_TYPES = "Types";
   	public static API_CONTEXT= "Context";

   	/* Colors */
   	public static GREY = "#333";
   	public static WHITEMOREDARK = "#EEE";
   	public static BLACK = "#000";
   	public static WHITE = "#FFF";

   	/* Alert */
   	public static MSGSUCCESS = "Les informations ont été inséré avec succès";
   	public static MSGERROR = "Un problème est survenu lors de l'insertion des données, Veuillez réessayer svp !";

}