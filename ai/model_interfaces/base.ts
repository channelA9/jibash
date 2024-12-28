import { Agent } from "../Agent";
import {
  SituationSettings,
  Message,
  SituationFinishReport,
  AIInterfaceGenerationSettings,
} from "../defs/types";

export class AIInterface {
  public providers = ['DEBUG']
  public models: string[] = ["DEBUG_NO_MODEL"];
  public primaryModelName = this.models[0];
  public utilityModelName = this.models[0];

  public generationSettings: AIInterfaceGenerationSettings = {
    maxOutputTokens: 1200,
    temperature: 1,
    topP: 1,
    topK: 1,
  };

  public setAPIKey(key: string) {}

  public getModels(): string[] {
    return this.models;
  }

  public setModel(model: string, role: "primary" | "utility") {
    if (this.models.includes(model)) {
      if (role == "primary") {
        this.primaryModelName = model;
      } else {
        this.utilityModelName = model;
      }
    } else {
      console.log(`${model} does not exist in the current provider.`);
    }
  }

  public async prompt(
    _message: Message[],
    _instruction: string,
    _role?: string
  ): Promise<string> {
    return "";
  }

  public async multiPrompt(
    _message: Message[],
    _settings: SituationSettings,
    _instruction: string
  ): Promise<Message[]> {
    return [];
  }

  public async decide(
    _messages: Message[],
    _choices: Array<unknown>,
    _instruction: string
  ): Promise<number> {
    return 0;
  }

  public async generateScenarios(_goal: string): Promise<SituationSettings[]> {
    return await [
      {
        title: "",
        agentDefs: [],
        scenario: "",
        objective: "",
        discussionDuration: 60,
      },
    ];
  }

  public async generateReport(
    _message: Message[],
    _settings: SituationSettings,
    _instruction: string
  ): Promise<SituationFinishReport> {
    return {
      score: {
        overall: 0,
        grammar: 0,
        fluency: 0,
        role: 0,
      },
      analysis: "",
      comments: [],
    };
  }
}
