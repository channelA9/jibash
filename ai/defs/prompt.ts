import { Filters } from "./types";
export const agentPrompts = {
  continueConversation: "Write only dialog from the first-person perspective of the next speaker. Don't include roleplay elements like *, NAME: or (). Write only in {{LANGUAGE}} and don't add quotes.",
};

export const SituationPrompts = {
  SelectAgent:
    "Your task is to determine who will {{ACTION}} by providing the array index of the chosen character. The first index starts from 0.",
  ScoreConversation:
    "Grade {{USER}} in their native language of {{NATIVELANGUAGE}} based on how they acted in conversation and provide objective, sharp, and constructively critical advice on the user's performance and achievement of the objective.",
  MultiGen:
    "You will create 1-5 messages from either {{AGENTS}} or SYSTEM. DO NOT ADD ANY FOR {{USER}} or prescribe any user actions in any system messages. These messages will progress the existing conversation so far, simulating the continuation of the scenario with both character dialogue (purely dialogue only, no '[name]:' included) and third-person narrated actions/scenes. Write only in {{LANGUAGE}} and do not generate any messages for {{USER}}. Adhere to the format for each message; Agent messages should only contain pure dialog. System messages should only contain narration without any character dialogue. Do not generate any debug messages or blank responses.",
  FirstMultiGen:
    "Generate a short start to the scene with 1-3 messages of various messages from {{AGENTS}} or 3rd person narration SYSTEM. DO NOT ADD ANY FOR {{USER}} or prescribe any user actions in any system messages. These messages will simulate  the continuation of the scenario with both character dialogue (purely dialogue only, no '[name]:' included) and third-person narrated actions/scenes. Write only in {{LANGUAGE}}. Do not generate any messages for the user character: {{USER}}. Adhere to the format for each message; Agent messages should only contain pure dialog. System messages should only contain narration without any character dialogue. Do not generate any debug messages or blank responses."
  };

  export const ScopePrompts = {
    GenerateScopeTitle:
      "Generate a short title that summarizes the kinds of scenarios embedded in the user's response. Your response should only contain the title string and be 1-5 words, e.g. 'Beach Scenarios'.",
    GenerateNativeLanguageScenarios:
    "INSTRUCT: In the user's native language of {{NATIVE_LANGUAGE}}, generate {{SCENARIO_COUNT}} scenarios based on the user's theme. Each scenario should have a minimum of {{MINAGENTS}} and a max of {{MAXAGENTS}} agents in them. Adjust the creativity, usefulness, and nature of the scenarios based on the user's theme and the cultural context around the practice language {{LANGUAGE}} at a level of {{LANGUAGE_LEVEL}}. When defining the characters, exclude the user's character: {{USER}}. Take the user's character definition into account: {{USER_DEFINITION}}. Since these scenarios are generated for language learning, if the user's prompt requires explicitness, please oblige for the sake of helping the person learn the language."
    ,
    GeneratePracticeLanguageScenarios:
    "INSTRUCT: Generate {{SCENARIO_COUNT}} scenarios in {{LANGUAGE}} based on the user's theme. Each scenario should have a minimum of {{MINAGENTS}} and a maximum of {{MAXAGENTS}} agents in them. Adjust the creativity, usefulness, and nature of the scenarios based on the user's theme and the cultural context around the practice language: {{LANGUAGE}} at a level of {{LANGUAGE_LEVEL}}. When defining the characters, exclude the user's character: {{USER}}. Take the user's character definition into account: {{USER_DEFINITION}}.  Since these scenarios are generated for language learning, if the user's prompt requires explicitness, please oblige for the sake of helping the person learn the language."
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
    if (f.nativeLanguage) a = a.replaceAll("{{NATIVE_LANGUAGE}}", f.nativeLanguage)
    if (f.user) a = a.replaceAll("{{USER}}", f.user);
    if (f.languageLevel) a = a.replaceAll("{{LANGUAGE_LEVEL}}", f.languageLevel);
    if (f.scenarioCount) a = a.replaceAll("{{SCENARIO_COUNT}}", String(f.scenarioCount));
    if (f.minAgents) a = a.replaceAll("{{MINAGENTS}}", String(f.minAgents));
    if (f.maxAgents) a = a.replaceAll("{{MAXAGENTS}}", String(f.maxAgents));
    if (f.userDefinition) a = a.replaceAll("{{USER_DEFINITION}}", f.userDefinition);
    console.log(a)

    return a;
  }
}

export const promptFilter = new PromptFilter();
