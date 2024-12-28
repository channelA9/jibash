import { GeminiInterface } from "./model_interfaces/gemini";
import {
  Message,
  SituationFinishReport,
  SituationSettings,
} from "./defs/types";
import { Agent } from "./Agent";
import { AIInterface } from "./model_interfaces/base";
import { promptFilter, SituationPrompts } from "./defs/prompt";
import { Scope } from "./Scope";

export class Situation {
  private settings: SituationSettings = {
    title: "Grad",
    agentDefs: [],
    scenario: "Speaking at a formal graduate conference",
    objective: "Make a successful speech",
    discussionDuration: 60,
  };
  private messages: Message[] = [];
  private scope: Scope;
  private agents: Record<string, Agent> = {};
  private situationFinishReport: SituationFinishReport | undefined;
  private disableUserInput = true;
  public getModelInterface: () => AIInterface;

  private abortController: AbortController | null = null;

  constructor(
    settings: SituationSettings,
    scope: Scope,
    modelInterfaceGetter: () => AIInterface,
    messageLog: Message[] = []
  ) {

    this.scope = scope;
    this.settings = settings;
    this.getModelInterface = modelInterfaceGetter;

    settings.agentDefs.forEach((agent) => {
      this.agents[agent.name] = new Agent(
        this,
        agent,
        this.getModelInterface.bind(this)
      );
    });
    this.messages = [...messageLog];
    console.log(messageLog)
    console.log(this.messages)
  }

  private async getNextSpeaker() {
    if (Object.keys(this.agents).length == 1)
      return Object.values(this.agents)[0];
    else
      try {
        const agentNamesList = Object.keys(this.agents);

        const prompt = promptFilter.filter(SituationPrompts.SelectAgent, {
          ...this.scope.promptFilters,
          agents: JSON.stringify(agentNamesList),
          action: "Speak Next",
        });

        const choice = await this.getModelInterface().decide(
          this.messages,
          agentNamesList,
          prompt
        );
        console.log(`${choice} will speak next.`);

        const nextSpeaker = this.agents[agentNamesList[choice]];
        return nextSpeaker;
      } catch (error) {
        this.scope.pushErrorLog(error);
      }
  }

  private createContext(nextSpeaker: Agent) {
    let promptMessages: Message[] = [];

    // scenario
    promptMessages.push({
      sender: "SYSTEM",
      content: `The conversation context is: ${this.settings.scenario}`,
    });

    // userdef
    promptMessages.push({
      sender: "SYSTEM",
      content: `The user's definition: ${JSON.stringify(this.scope.userProfile)}`,
    });

    // agents
    for (const agentName in this.agents) {
      const agent = this.agents[agentName];
      promptMessages.push({
        sender: agent.getName(),
        content: `${JSON.stringify(agent.getProfile())}`,
        // agent.getProfile().relations.forEach((relation) => {
        //   return JSON.stringify(relation);
        // }),
      });
    }

    // messages
    promptMessages = [...promptMessages, ...this.messages];

    // final
    promptMessages.push({
      sender: "SYSTEM",
      content: `The next speaker will be ${nextSpeaker.getName()}`,
    });

    return promptMessages;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, ms);
      if (this.abortController) {
        this.abortController.signal.addEventListener("abort", () => {
          clearTimeout(timeout);
          reject(new Error("Stream cancelled"));
        });
      }
    });
  }

  private async streamMessages(newConversationMessages: Message[]) {
    this.abortController = new AbortController();
    console.log(newConversationMessages);
    const delay = 25;
    try {
      for (const newMessage of newConversationMessages) {
        const streamedMessage: Message = {
          sender: newMessage.sender,
          content: "",
        };
        if (newMessage.content) {
          this.addMessage({ ...streamedMessage });

          for (let i = 0; i < newMessage.content.length; i++) {
            if (this.abortController.signal.aborted) {
              throw new Error("Stream cancelled");
            }
            this.messages[this.messages.length - 1].content +=
              newMessage.content[i];
            await this.sleep(delay);
          }
        } else {
          console.log(`${newMessage.sender} has no content.`);
        }
      }
    } finally {
      this.abortController = null;
    }
  }

  private async startCycle() {
    console.log("ACTIVE")
    this.disableUserInput = true;
    if (this.scope.getSettings().multiMessageGenerationEnabled) {
      const agentNamesList = Object.keys(this.agents);

      const promptMessages: Message[] = [];

      // userdef
      promptMessages.push({
        sender: "SYSTEM",
        content: `The user is ${this.scope.userProfile.name}. ${this.scope.userProfile.name}'s definition: ${JSON.stringify(this.scope.userProfile)}`,
      });

      promptMessages.push(...this.messages);

      // no cloning clause

      promptMessages.push({
        sender: "SYSTEM",
        content: `Continuing the conversation...`,
      });

      const newConversationMessages =
        await this.getModelInterface().multiPrompt(
          promptMessages,
          this.settings,
          promptFilter.filter(
            this.messages.length == 0
              ? SituationPrompts.FirstMultiGen
              : SituationPrompts.MultiGen,
            {
              ...this.scope.promptFilters,
              agents: JSON.stringify(agentNamesList),
            }
          )
        );

      if (this.messages.length == 0)
        newConversationMessages.forEach((message) =>
          this.messages.push(message)
        );
      else await this.streamMessages(newConversationMessages);
    } else {
      try {
        const nextSpeaker = await this.getNextSpeaker();
        if (nextSpeaker) {
          const nextSpeakerReply = await nextSpeaker.getResponse(
            this.createContext(nextSpeaker)
          );
          if (nextSpeakerReply)
            this.addMessage({
              sender: nextSpeaker.getName(),
              content: nextSpeakerReply,
            });
          else throw "Unable to generate response";
        } else throw "Unable to determine next speaker";
      } catch (error) {
        this.scope.pushErrorLog(error);
      }
    }
    console.log(`Finished dialogue generation for '${this.settings.title}' `);
    this.disableUserInput = false;
  }

  private addMessage(message: Message) {
    console.log(this.messages);
    this.messages.push(message);
  }

  public setFinishReport(situationFinishReport: SituationFinishReport) {
    this.situationFinishReport = situationFinishReport;
  }

  public send(message: Message) {
    console.log(message);
    this.addMessage(message);
    this.startCycle();
  }

  public getTitle() {
    return this.settings.title;
  }

  public getDescription() {
    return this.settings.scenario;
  }
  public setDescription(description: string) {
    this.settings.scenario = description;
  }

  public getObjective() {
    return this.settings.objective;
  }
  public setObjective(objective: string) {
    this.settings.objective = objective;
  }

  public getAgents() {
    return Object.values(this.agents);
  }

  public getMessages() {
    return this.messages;
  }

  public getSettings() {
    return this.settings;
  }

  public getReport() {
    return this.situationFinishReport;
  }

  public inputDisabled() {
    return this.disableUserInput;
  }

  public startSituation() {
    this.startCycle();
  }

  public async refresh() {
    await this.sleep(100);
    this.disableUserInput = false;
    this.messages = [ ...this.messages ];
  }

  public getScope() {
    return this.scope;
  }

  public deleteMessage(index: number) {
    console.log(this.messages);
    this.messages = this.messages.slice(0, index);
  }

  public cancelStream() {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.disableUserInput = false;
  }
}
