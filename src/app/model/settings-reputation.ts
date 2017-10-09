export class SettingsReputation {
    repIntegrationEditor : number // Default value
    repContribution : number // Default value
    repNew : number // Default value
    repModify : number// Default value
    repRevision : number // Default value

    constructor() {
        this.repIntegrationEditor = 3;
        this.repContribution = 1;
        this.repNew = 1;
        this.repModify = 1;
        this.repRevision = 1;
    }
}