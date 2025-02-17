import OpenAI from "openai";
import { AIInterface } from "./base";
import {
  AIInterfaceGenerationSettings,
  APIKeys,
  Message,
  SituationFinishReport,
  SituationSettings,
} from "../defs/types";

export class OpenAIInterface extends AIInterface {
  public models: string[] = ["gpt-4o", "gpt-4o-mini", "o1", "o1-mini", "o3-mini"];

  public primaryModelName = this.models[0];
  public utilityModelName = this.models[0];

  public generationSettings: AIInterfaceGenerationSettings = {
    maxOutputTokens: 1200,
    temperature: 1,
    topP: 1,
    topK: 1,
  };

  private openai = new OpenAI({ apiKey: "", dangerouslyAllowBrowser: true }); // Since this runs on the user machine and they provide their own keys, this is within design.
  private primaryModel: OpenAI.Chat.Completions;
  private utilityModel: OpenAI.Chat.Completions;

  constructor(apiKeys: APIKeys) {
    super();
    if (apiKeys.openai) {
      this.setAPIKey(apiKeys.openai);
    }
    this.primaryModel = this.openai.chat.completions;
    this.utilityModel = this.openai.chat.completions;
  }

  public setAPIKey(key: string) {
    console.log("NEW SET API KEY", key);
    this.openai = new OpenAI({ apiKey: key, dangerouslyAllowBrowser: true });
    this.primaryModel = this.openai.chat.completions;
    this.utilityModel = this.openai.chat.completions;
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

  public getModels(): string[] {
    return this.models;
  }

  public async prompt(messages: Message[], instruction: string, role?: string): Promise<string> {
    try {
      const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = role
        ? parseMessagesForOpenAI(messages, role, instruction)
        : parseMessagesForOpenAI(messages, undefined, instruction);

      const completion = await this.primaryModel.create({
        model: this.primaryModelName,
        messages: openaiMessages,
        max_tokens: Number(this.generationSettings.maxOutputTokens),
        temperature: Number(this.generationSettings.temperature),
        top_p: Number(this.generationSettings.topP),
        // frequency_penalty: 0, // Consider adding these to generationSettings if needed
        // presence_penalty: 0,
      });

      return completion.choices[0].message.content || "";
    } catch (error) {
      return `Error: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  public async multiPrompt(
    messages: Message[],
    settings: SituationSettings,
    instruction: string
  ): Promise<Message[]> {
    try {
      const systemContext = `CONVERSATION CONTEXT: ${JSON.stringify({
        description: settings.scenario,
        objective: settings.objective,
        agents: settings.agentDefs,
      })}`;

      const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: systemContext },
        ...parseMessagesForOpenAI(messages),
        {
          role: "system",
          content: `INSTRUCT: Respond with ONLY a JSON array of messages in the following schema: ${JSON.stringify(messageArraySchema)}. ${instruction}`,
        },
      ];

      const completion = await this.primaryModel.create({
        model: this.primaryModelName,
        messages: openaiMessages,
        max_tokens: Number(this.generationSettings.maxOutputTokens),
        temperature: Number(this.generationSettings.temperature),
        top_p: Number(this.generationSettings.topP),
        response_format: {
          json_schema: { name: "messageArray", schema: messageArraySchema },
          type: "json_schema",
        },
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error("No content returned from OpenAI API");
      }
      return JSON.parse(content).messageArray as Message[];
    } catch (error) {
      throw new Error(
        `multiPrompt failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  public async decide(
    messages: Message[],
    choices: Array<unknown>,
    instruction: string
  ): Promise<number> {
    try {
      const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        ...parseMessagesForOpenAI(messages),
        { role: "user", content: JSON.stringify(choices) },
        {
          role: "system",
          content: `INSTRUCT: Respond with ONLY a JSON integer representing the index of the chosen item in the array. Adhere to the following schema: ${JSON.stringify(integerSchema)}. ${instruction}`,
        },
      ];

      const completion = await this.utilityModel.create({
        model: this.utilityModelName,
        messages: openaiMessages,
        max_tokens: Number(this.generationSettings.maxOutputTokens),
        temperature: Number(this.generationSettings.temperature),
        top_p: Number(this.generationSettings.topP),
        response_format: {
          json_schema: { name: "number", schema: integerSchema },
          type: "json_schema",
        },
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error("No content returned from OpenAI API");
      }

      return JSON.parse(content).value;
    } catch (error) {
      throw new Error(`decide failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public async generateReport(
    messages: Message[],
    settings: SituationSettings,
    instruction: string
  ): Promise<SituationFinishReport> {
    try {
      const systemContext = `CONVERSATION CONTEXT: ${JSON.stringify({
        description: settings.scenario,
        objective: settings.objective,
        agents: settings.agentDefs,
      })}`;

      const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: systemContext },
        ...parseMessagesForOpenAI(messages),
        {
          role: "system",
          content: `INSTRUCT: Analyze the conversation and respond with ONLY a JSON object representing the report in the following schema: ${JSON.stringify(reportSchema)}. ${instruction}`,
        },
      ];

      const completion = await this.primaryModel.create({
        model: this.primaryModelName,
        messages: openaiMessages,
        max_tokens: Number(this.generationSettings.maxOutputTokens),
        temperature: Number(this.generationSettings.temperature),
        top_p: Number(this.generationSettings.topP),
        response_format: {
          json_schema: { name: "report", schema: reportSchema },
          type: "json_schema",
        },
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error("No content returned from OpenAI API");
      }
      return JSON.parse(content) as SituationFinishReport;
    } catch (error) {
      throw new Error(
        `generateReport failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  public async generateScenarios(goal: string, instruction: string): Promise<SituationSettings[]> {
    try {
      const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "user", content: goal },
        {
          role: "system",
          content: instruction,
        },
      ];

      const completion = await this.utilityModel.create({
        model: this.utilityModelName,
        messages: openaiMessages,
        max_tokens: Number(this.generationSettings.maxOutputTokens),
        temperature: Number(this.generationSettings.temperature),
        top_p: Number(this.generationSettings.topP),
        response_format: {
          json_schema: { name: "scenarios", schema: scenarioSchema },
          type: "json_schema",
        },
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error("No content returned from OpenAI API");
      }
      console.log(JSON.parse(content));
      return JSON.parse(content).scenarioArray as SituationSettings[];
    } catch (error) {
      throw new Error(
        `generateScenarios failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

function parseMessagesForOpenAI(
  messages: Message[],
  agentName?: string,
  systemInstruction?: string
): OpenAI.Chat.ChatCompletionMessageParam[] {
  const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

  if (systemInstruction) {
    openaiMessages.push({ role: "system", content: systemInstruction });
  }

  if (agentName) {
    messages.forEach((message) => {
      const role = message.sender === agentName ? "assistant" : "user"; // Assuming 'model' in your interface maps to 'assistant' in OpenAI
      openaiMessages.push({
        role: role,
        content: `${message.sender !== agentName ? `${message.sender}: ` : ""}${message.content}`,
      });
    });
  } else {
    messages.forEach((message) => {
      const role = message.sender === "user" ? "user" : "assistant"; // Mapping 'model' to 'assistant'
      openaiMessages.push({
        role: role,
        content: `${message.sender !== "user" ? `${message.sender}: ` : "USER: "}${message.content}`,
      });
    });
  }
  return openaiMessages;
}

const integerSchema: Record<string, unknown> = {
  type: "object",
  properties: {
    value: {
      type: "integer",
      description: "The chosen index in the JS array.",
    },
  },
};

const scenarioSchema: Record<string, unknown> = {
  type: "object",
  properties: {
    scenarioArray: {
      type: "array",
      description: "An array of multiple chat scenarios",
      items: {
        type: "object",
        description:
          "A scenario object with agentDefs, title, scenario, objective, and discussionDuration",
        properties: {
          title: {
            type: "string",
            description: "A short title for this scenario.",
          },
          scenario: {
            type: "string",
            description: "Two sentences that visually describe the starting scene.`",
          },
          objective: {
            type: "string",
            description: "The user's goal to 'win' or succeed in this situation.`",
          },
          discussionDuration: {
            type: "integer",
            description: "A reasonable duration for the objective to be completed in this chat.",
          },
          agentDefs: {
            type: "array",
            description:
              "An array of the AI bots for this scenario, excluding the user's character",
            items: {
              type: "object",
              description: "An agent.",
              properties: {
                name: {
                  type: "string",
                  description: "A randomly generated name relevant to the language's home country",
                },
                stats: {
                  type: "object",
                  description:
                    "The agent's stats, required to allow for accurate judgement of social context",
                  properties: {
                    age: {
                      type: "integer",
                      description: "The agent's age",
                    },
                    gender: {
                      type: "string",
                      description: "The agent's gender (f/m)",
                    },
                    job: {
                      type: "string",
                      description: "The agent's job",
                    },
                  },
                },
                relationToUser: {
                  type: "string",
                  description:
                    "The relationship the agent has with user for the situation context, eg: Boss, Friend, Stranger, Senior, etc.",
                },
                personality: {
                  type: "string",
                  description: "The agent's personality",
                },
              },
            },
          },
        },
      },
    },
  },
};

const reportSchema: Record<string, unknown> = {
  type: "object",
  description: "A report analyzing the discussion",
  properties: {
    score: {
      type: "object",
      properties: {
        overall: {
          type: "integer",
          description: `A score from 0-1000 rating the user's overall performance.`,
        },
        grammar: {
          type: "integer",
          description: `A score from 0-1000 rating the user's grammar.`,
        },
        fluency: {
          type: "integer",
          description: `A score from 0-1000 rating the user's flow and natural use of expressions given the conversational context.`,
        },
        role: {
          type: "integer",
          description: `A score from 0-1000 rating the user's use of language according to their social role and place in the conversation based on the language's implied societal norms and etiquette.`,
        },
      },
    },
    analysis: {
      type: "string",
      description:
        "An overall analysis that describes your perception of how the user performed in the conversation according to expectations.",
    },
    comments: {
      type: "array",
      description: "An array of comments to be made about specific sentences that the user made.",
      items: {
        type: "object",
        description: "A comment for a specific sentence of note from the user.",
        properties: {
          quote: {
            type: "string",
            description: "The exact quote of what the user typed.",
          },
          analysis: {
            type: "string",
            description:
              "Your short comment or analysis of this sentence and its effect on the score.",
          },
        },
      },
    },
  },
};

const messageSchema: Record<string, unknown> = {
  type: "object",
  description:
    "An individual message, either a system message or dialogue from the relevant non-user agents.",
  properties: {
    sender: {
      type: "string",
      description: "The agent's name. Use SYSTEM if it's a 3rd-person narration element.",
    },
    content: {
      type: "string",
      description: "Dialog of the agent, or narration if the SYSTEM.",
    },
  },
};

const messageArraySchema: Record<string, unknown> = {
  type: "object",
  properties: {
    messageArray: {
      type: "array",
      description:
        "An array of new chronological messages that continue the scene, made of a variable length of messages that continues up until the user is expected to speak again. It should not contain any preexisting messages from the prompt.",
      items: messageSchema,
    },
  },
};
