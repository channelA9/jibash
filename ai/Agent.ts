import { AIInterface } from "./model_interfaces/base";
import { GeminiInterface } from "./model_interfaces/gemini";
import { Message, Profile } from "./defs/types";

import { agentPrompts, promptFilter } from "./defs/prompt";
import { Situation } from "./Situation";

export class Agent {
  private profile: Profile;
  private situation: Situation;
  private getModelInterface: () => AIInterface;

  constructor(
    situation: Situation,
    profile: Profile,
    modelInterfaceGetter: () => AIInterface
  ) {
    this.situation = situation;
    this.profile = profile;
    this.getModelInterface = modelInterfaceGetter;
  }

  public async getResponse(messages: Message[]) {
    try {
      return this.getModelInterface().prompt(
        messages,
        promptFilter.filter(
          agentPrompts.continueConversation,
          this.situation.getScope().promptFilters
        ),
        this.getName()
      );
    } catch (error) {
      this.situation.getScope().pushErrorLog(error);
    }
  }

  public getSituation() {
    return this.situation;
  }
  public getProfile() {
    return this.profile;
  }
  public getStats() {
    return this.profile.stats;
  }
  public getRelationToUser() {
    return this.profile.relationToUser;
  }
  public getName() {
    return this.profile.name;
  }

  public setProfile(profile: Partial<Profile>) {
    this.profile = { ...this.profile, ...profile };
  }
}
