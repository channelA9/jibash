import { Filters } from "./types";
export const agentPrompts = {
  continueConversation: "Write only dialog from the first-person perspective of the next speaker. Don't include roleplay elements like * or (). Write only in {{LANGUAGE}} and don't add quotes.",
};

export const SituationPrompts = {
  SelectAgent:
    "Your task is to determine who will {{ACTION}} by providing the array index of the chosen character. The first index starts from 0.",
  ScoreConversation:
    "Grade {{USER}} in {{NATIVELANGUAGE}} based on how they acted in conversation and provide objective, sharp, and constructively critical advice on the user's performance and achievement of the objective.",
  MultiGen:
    "You will always create NEW messages based on what has already occurred that simulate the continuation of the scenario with conversation and third-person narrated actions/scenes. Write only in {{LANGUAGE}}. Do not generate any messages for the user's character, {{USER}}. Adhere to the format for each message; Agent messages should only contain pure dialog and system messages should only contain narration.",
  FirstMultiGen:
    "Generate a short start to the scene with 1-2 messages that simulates the start of the scenario with conversation and third-person narrated actions/scenes up until the point before {{USER}} is expected to speak. Write only in {{LANGUAGE}}. Do not generate any messages for the user's character, {{USER}}. Adhere to the format for each message; agent messages should only contain dialog and system messages should only contain narration."
  };

  export const ScopePrompts = {
    GenerateScopeTitle:
      "Generate a short title that summarizes the kinds of scenarios embedded in the user's response. Your response should only contain the title string, e.g. 'Beach Scenarios'.",
  }
class PromptFilter {
  private static instance: PromptFilter;

  constructor() {
    if (PromptFilter.instance) {
      return PromptFilter.instance;
    }
    PromptFilter.instance = this;
  }

  public filter(str: string, f: Filters) {
    let a = str;

    console.log(f);
    if (f.agents) a = a.replaceAll("{{AGENTS}}", f.agents);
    if (f.action) a = a.replaceAll("{{ACTION}}", f.action);
    if (f.language) a = a.replaceAll("{{LANGUAGE}}", f.language);
    if (f.nativeLanguage) a = a.replaceAll("{{NATIVELANGUAGE}}", f.nativeLanguage)
    if (f.user) a = a.replaceAll("{{USER}}", f.user);
    if (f.languageLevel) a = a.replaceAll("{{LANGUAGELEVEL}}", f.languageLevel);
    if (f.scenarioCount) a = a.replaceAll("{{SCENARIOCOUNT}}", f.scenarioCount);
    if (f.minAgents) a = a.replaceAll("{{MINAGENTS}}", f.minAgents);
    if (f.maxAgents) a = a.replaceAll("{{MAXAGENTS}}", f.maxAgents);
    console.log(a)

    return a;
  }
}

export const promptFilter = new PromptFilter();
