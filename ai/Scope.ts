import {
  APIKeys,
  Filters,
  InitGenerationSettings,
  InitSettings,
  Profile,
  ScopeSettings,
  ScopeView,
  SituationSettings,
  SituationView,
} from "./defs/types";
import { Situation } from "./Situation";
import { AIInterface } from "./model_interfaces/base";
import { GeminiInterface } from "./model_interfaces/gemini";
import { promptFilter, ScopePrompts, SituationPrompts } from "./defs/prompt";
import { ScopeTimer } from "./lib/ScopeTimer";

export class Scope {
  public name: string = "New Session";
  public providers = ["google", "none"];
  private provider = "google";
  private settings: ScopeSettings = {
    language: "japanese",
    nativeLanguage: "english",
    scenarioCount: 2,
    minAgents: 2,
    maxAgents: 4,
    languageLevel: "N3",
    timerEnabled: false,
    multiMessageGenerationEnabled: true,
    descriptionsInNativeLanguage: true,
  };

  private apiKeys: APIKeys = {};

  private modelInterface: AIInterface = new GeminiInterface(this.apiKeys);

  public promptFilters: Filters = {};
  public userProfile: Profile = {
    name: "USER",
    stats: {},
    personality: "",
  };

  constructor(initSettings?: InitSettings) {
    if (initSettings) {
      this.updateSettings(initSettings.settings);
      this.setProvider(initSettings.provider);
      this.apiKeys = initSettings.apiKeys;
      this.updateUserProfile(initSettings.userProfile);
    }
  }

  public initialize(initSettings: InitSettings) {
    console.log(initSettings);
    this.updateSettings(initSettings.settings);
    this.setProvider(initSettings.provider);
    this.apiKeys = initSettings.apiKeys;
    this.updateUserProfile(initSettings.userProfile);
    this.modelInterface.setAPIKey(this.apiKeys[this.provider] ?? "");

    this.modelInterface.setModel(
      initSettings.initGenerationSettings.primaryModel,
      "primary"
    );
    this.modelInterface.setModel(
      initSettings.initGenerationSettings.utilityModel,
      "utility"
    );
    this.modelInterface.generationSettings =
      initSettings.initGenerationSettings.generationSettings;
  }

  public errorLog: string[] = [];

  public situations: Situation[] = [];
  private stage: string = "generate";

  private activeSituation: Situation | undefined;
  private activeSituationIndex: number = 0;

  private scopeTimer: ScopeTimer | undefined;
  private scopeCompleted: number = 0;

  private async generateReportForSituation() {
    try {
      if (this.activeSituation && !this.activeSituation.getReport()) {
        const finishReport = await this.modelInterface.generateReport(
          this.activeSituation.getMessages(),
          this.activeSituation.getSettings(),
          promptFilter.filter(
            SituationPrompts.ScoreConversation,
            this.promptFilters
          )
        );
        this.activeSituation.setFinishReport(finishReport);
        console.log(finishReport);
      }
    } catch (error) {
      this.pushErrorLog(error);
    }
  }

  public setActiveSituation(i: number) {
    this.activeSituationIndex = i;
    this.activeSituation = this.situations[i];
    this.activeSituation = this.situations[this.activeSituationIndex];

    if (this.activeSituation) {
      if (this.activeSituation.getReport()) this.setStage("report");
      else {
        this.setStage("situations");
        if (this.activeSituation.getMessages().length == 0) {
          this.activeSituation.startSituation()
        } else {
          this.activeSituation.refresh()
        }
      }

      if (this.settings.timerEnabled) {
        this.scopeTimer = new ScopeTimer(() => {
          this.finishSituation();
        });
        this.scopeTimer.start(
          this.activeSituation.getSettings().discussionDuration * 100
        );
      }
    }
  }

  private cycleSituations(i: number) {
    const to = this.activeSituationIndex + i;
    if (to < 0) {
      this.setActiveSituation(this.situations.length - 1);
    } else if (to > this.situations.length - 1) {
      this.setActiveSituation(0);
    } else {
      this.setActiveSituation(to);
    }
  }

  public async generateSituations(goal: string) {
    try {
      const scenarios = await this.modelInterface.generateScenarios(
        `The user's definition: {{${JSON.stringify(this.userProfile)}}}. The user would like scenarios based on the following: {{${goal}}}. Generate ${this.settings.scenarioCount} short, simple, creative, and simple scenario object${this.settings.scenarioCount > 1 && "s"} ${!this.settings.descriptionsInNativeLanguage ? `in ${this.settings.language} at a level of ${this.settings.languageLevel}` : `Generate all the info in ${this.settings.nativeLanguage} but with the context of creating realistic and everyday scenarios from countries that speak ${this.settings.language} in mind.`} based on this scope. Each scenario should have ${this.settings.minAgents == this.settings.maxAgents ? `${this.settings.minAgents}` : `between ${this.settings.minAgents}-${this.settings.maxAgents}`} agent${this.settings.maxAgents > 1 && "s"}. The scenarios should be realistic and open, but clear enough such that a goal is apparent for the user to utilize proficiency in the language. All agents should be set up in such a way that it makes sense they'd converse with the user, ie there should be no 'random passerby' agents who are strangers in the situation. If a user definition is provided, make sure the scenarios take into account. Ensure all objects have all required details.`
      );

      scenarios.forEach((scenario: SituationSettings) => {
        const newScenario = new Situation(
          scenario,
          this,
          this.getModelInterface.bind(this)
        );
        this.situations.push(newScenario);
      });

      try {
        const title = await this.modelInterface.prompt(
          [
            {
              sender: "SYSTEM",
              content: JSON.stringify(
                scenarios.map((scenario) => {
                  return {
                    scenarioTitle: scenario.title,
                    scenario: scenario.scenario,
                  };
                })
              ),
            },
          ],
          promptFilter.filter(
            ScopePrompts.GenerateScopeTitle,
            this.promptFilters
          )
        );
        console.log("New Scope Title: ", title);
        this.name = title;
      } catch (error) {
        this.pushErrorLog(error);
      }
    } catch (error) {
      this.pushErrorLog(error);
    }
  }

  public pushErrorLog(error: string | Error | unknown) {
    if (error) console.error(error);
    this.errorLog.push(
      `${error instanceof Error ? error.message : String(error)}`
    );
  }

  public updateSettings(settings: Partial<ScopeSettings>) {
    this.settings = { ...this.settings, ...settings };
    this.promptFilters = {
      ...this.promptFilters,
      language: this.settings.language,
      nativeLanguage: this.settings.nativeLanguage,
    };
  }

  public updateAPIKey(newKey: string, provider: string) {
    this.apiKeys[provider] = newKey;
    if (this.provider == provider) {
      this.modelInterface.setAPIKey(newKey);
    }
  }

  public updateUserProfile(userProfile: Partial<Profile>) {
    this.userProfile = { ...this.userProfile, ...userProfile };
    this.promptFilters = {
      ...this.promptFilters,
      user: this.userProfile.name,
    };
    console.log(this.promptFilters);
  }

  public getModelInterface(): AIInterface {
    return this.modelInterface;
  }

  public getProvider() {
    return this.provider;
  }

  public setProvider(provider: string) {
    if (this.provider != provider) {
      this.provider = provider;

      switch (provider) {
        case "google":
          this.modelInterface = new GeminiInterface(this.apiKeys);
          break;
        case "none":
          this.modelInterface = new AIInterface();
      }
    }
  }

  public setStage(stage: string) {
    this.stage = stage;
  }

  public getStage() {
    return this.stage;
  }

  public getSituations() {
    return this.situations;
  }

  public getActiveSituation() {
    return this.activeSituation;
  }

  public getSituationIndex() {
    return this.activeSituationIndex;
  }

  public getTimer() {
    return this.scopeTimer;
  }

  public getSettings() {
    return this.settings;
  }

  public getAPIKeys() {
    return this.apiKeys;
  }

  public getGenerationSettings(): InitGenerationSettings {
    return {
      primaryModel: this.modelInterface.primaryModelName,
      utilityModel: this.modelInterface.utilityModelName,
      generationSettings: this.modelInterface.generationSettings,
    };
  }

  public start() {
    this.setActiveSituation(0);
  }

  public next() {
    this.cycleSituations(1);
  }

  public previous() {
    this.cycleSituations(-1);
  }

  public restart() {
    if (this.scopeTimer) this.scopeTimer.stop();
    this.scopeTimer = undefined;
    this.activeSituation = undefined;
    this.activeSituationIndex = 0;

    this.situations = [];
    this.setStage("generate");
  }

  public finishSituation() {
    this.generateReportForSituation();
    this.setStage("report");
    this.scopeCompleted += 1;
  }

  public loadScope(scopeView: ScopeView) {
    this.name = scopeView.name;
    this.situations = scopeView.situationViews.map(
      (situationView: SituationView) =>
        new Situation(
          situationView.settings,
          this,
          this.getModelInterface.bind(this),
          situationView.messages
        )
    );
    this.setStage("overview");
  }

  public allCompleted() {
    if (
      this.situations.length > 0 &&
      this.scopeCompleted >= this.situations.length
    )
      return true;
    return false;
  }
}
