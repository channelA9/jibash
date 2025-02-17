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
import { OpenAIInterface } from "./model_interfaces/openai";
import { promptFilter, ScopePrompts, SituationPrompts } from "./defs/prompt";
import { ScopeTimer } from "./lib/ScopeTimer";
import { DeepSeekInterface } from "./model_interfaces/deepseek";

export class Scope {
  public name: string = "New Session";
  public providers = ["google", "openai", "deepseek", "none"];
  private provider = "google";
  private settings: ScopeSettings = {
    language: "japanese",
    nativeLanguage: "english",
    scenarioCount: 2,
    minAgents: 2,
    maxAgents: 4,
    languageLevel: "native",
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

    this.modelInterface.setModel(initSettings.initGenerationSettings.primaryModel, "primary");
    this.modelInterface.setModel(initSettings.initGenerationSettings.utilityModel, "utility");
    this.modelInterface.generationSettings = initSettings.initGenerationSettings.generationSettings;
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
          promptFilter.filter(SituationPrompts.ScoreConversation, this.promptFilters)
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
          this.activeSituation.startSituation();
        } else {
          this.activeSituation.refresh();
        }
      }

      if (this.settings.timerEnabled) {
        this.scopeTimer = new ScopeTimer(() => {
          this.finishSituation();
        });
        this.scopeTimer.start(this.activeSituation.getSettings().discussionDuration * 100);
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
        goal,
        promptFilter.filter(
          this.settings.descriptionsInNativeLanguage
            ? ScopePrompts.GenerateNativeLanguageScenarios
            : ScopePrompts.GeneratePracticeLanguageScenarios,
          {
            ...this.settings,
            user: this.userProfile.name,
            userDefinition: JSON.stringify(this.userProfile),
          }
        )
      );

      scenarios.forEach((scenario: SituationSettings) => {
        const newScenario = new Situation(scenario, this, this.getModelInterface.bind(this));
        this.situations.push(newScenario);
      });

      // try {
      //   const title = await this.modelInterface.prompt(
      //     [
      //       {
      //         sender: "SYSTEM",
      //         content: JSON.stringify(
      //           scenarios.map((scenario) => {
      //             return {
      //               scenarioTitle: scenario.title,
      //               scenario: scenario.scenario,
      //             };
      //           })
      //         ),
      //       },
      //     ],
      //     promptFilter.filter(
      //       ScopePrompts.GenerateScopeTitle,
      //       this.promptFilters
      //     )
      //   );
      //   console.log("New Scope Title: ", title);
      //   this.name = title;
      // } catch (error) {
      //   this.pushErrorLog(error);
      // }
    } catch (error) {
      this.pushErrorLog(error);
    }
  }

  public pushErrorLog(error: string | Error | unknown) {
    if (error) console.error(error);
    this.errorLog.push(`${error instanceof Error ? error.message : String(error)}`);
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
        case "openai":
          this.modelInterface = new OpenAIInterface(this.apiKeys);
          break;
        case "deepseek":
          this.modelInterface = new DeepSeekInterface(this.apiKeys);
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
    this.scopeCompleted = 0;
    
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
    if (this.situations.length > 0 && this.scopeCompleted >= this.situations.length) return true;
    return false;
  }
}
