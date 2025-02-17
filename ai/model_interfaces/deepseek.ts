import OpenAI from "openai";
import { AIInterface } from "./base";
import {
  AIInterfaceGenerationSettings,
  APIKeys,
  Message,
  SituationFinishReport,
  SituationSettings,
} from "../defs/types";

export class DeepSeekInterface extends AIInterface {
  public models: string[] = ["deepseek-chat", "deepseek-reasoner"];

  public primaryModelName = this.models[0];
  public utilityModelName = this.models[0];

  public generationSettings: AIInterfaceGenerationSettings = {
    maxOutputTokens: 1200, // Adjust as needed for DeepSeek's token limits
    temperature: 1,
    topP: 1,
    topK: 1,
  };

  private deepseek: OpenAI = new OpenAI({
    apiKey: "",
    baseURL: "https://api.deepseek.com/v1",
    dangerouslyAllowBrowser: true,
  });
  private primaryModel: OpenAI.ChatCompletionCreateParams; // Correct type?
  private utilityModel: OpenAI.ChatCompletionCreateParams; // Correct type?

  constructor(apiKeys: APIKeys) {
    super();
    if (apiKeys.deepseek) {
      this.setAPIKey(apiKeys.deepseek);
    } // Initialize models with default model names - API key must be set first in setAPIKey or constructor with apiKeys.deepseek
    this.primaryModel = {
      model: this.primaryModelName,
      messages: [], // messages will be added in each function call
    };
    this.utilityModel = {
      model: this.utilityModelName,
      messages: [], // messages will be added in each function call
    };
  }

  public setAPIKey(key: string) {
    console.log("NEW SET API KEY", key);
    this.deepseek = new OpenAI({
      apiKey: key,
      baseURL: "https://api.deepseek.com/v1",
      dangerouslyAllowBrowser: true,
    });
    this.primaryModel = {
      ...this.primaryModel, // Keep other settings if any
      model: this.primaryModelName,
    };
    this.utilityModel = {
      ...this.utilityModel, // Keep other settings if any
      model: this.utilityModelName,
    };
  }

  public setModel(model: string, role: "primary" | "utility") {
    if (this.models.includes(model)) {
      if (role == "primary") {
        this.primaryModelName = model;
        this.primaryModel = {
          ...this.primaryModel, // Keep other settings
          model: model,
        };
      } else {
        this.utilityModelName = model;
        this.utilityModel = {
          ...this.utilityModel, // Keep other settings
          model: model,
        };
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
      const deepseekMessages = interweave(role
        ? parseMessagesForDeepSeek(messages, role, instruction)
        : parseMessagesForDeepSeek(messages, undefined, instruction));

      const completion = await this.deepseek.chat.completions.create({
        model: this.primaryModelName, // Model name from primaryModelName
        messages: deepseekMessages,
        max_tokens: Number(this.generationSettings.maxOutputTokens),
        temperature: Number(this.generationSettings.temperature),
        top_p: Number(this.generationSettings.topP),
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

      const deepseekMessages: OpenAI.ChatCompletionMessageParam[] = interweave([
        { role: "system", content: systemContext },
        ...parseMessagesForDeepSeek(messages),
        {
          role: "user",
          content: `INSTRUCT: Respond with ONLY a JSON array of messages in the following schema: ${JSON.stringify(messageArraySchema)}. ${instruction}`,
        },
      ]);

      const completion = await this.deepseek.chat.completions.create({
        model: this.primaryModelName, // Model name from primaryModelName
        messages: deepseekMessages,
        max_tokens: Number(this.generationSettings.maxOutputTokens),
        temperature: Number(this.generationSettings.temperature),
        top_p: Number(this.generationSettings.topP), // DeepSeek might not have response_format like OpenAI. Handle JSON parsing manually.
        response_format: {type: 'json_object'}
    });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error("No content returned from DeepSeek API");
      }

      return JSON.parse(content).messageArray as Message[]; // Adjust parsing based on actual DeepSeek response structure if needed.
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
      const deepseekMessages: OpenAI.ChatCompletionMessageParam[] = [
        ...parseMessagesForDeepSeek(messages),
        { role: "user", content: JSON.stringify(choices) },
        {
          role: "system",
          content: `INSTRUCT: Respond with ONLY a JSON integer representing the index of the chosen item in the array. Adhere to the following schema: ${JSON.stringify(integerSchema)}. ${instruction}`,
        },
      ];

      const completion = await this.deepseek.chat.completions.create({
        model: this.utilityModelName, // Model name from utilityModelName
        messages: deepseekMessages,
        max_tokens: Number(this.generationSettings.maxOutputTokens),
        temperature: Number(this.generationSettings.temperature),
        top_p: Number(this.generationSettings.topP), // DeepSeek might not have response_format like OpenAI. Handle JSON parsing manually.
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error("No content returned from DeepSeek API");
      }

      return JSON.parse(content).value; // Adjust parsing based on actual DeepSeek response structure if needed.
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

      const deepseekMessages: OpenAI.ChatCompletionMessageParam[] = [
        { role: "system", content: systemContext },
        ...parseMessagesForDeepSeek(messages),
        {
          role: "system",
          content: `INSTRUCT: Analyze the conversation and respond with ONLY a JSON object representing the report in the following schema: ${JSON.stringify(reportSchema)}. ${instruction}`,
        },
      ];

      const completion = await this.deepseek.chat.completions.create({
        model: this.primaryModelName, // Model name from primaryModelName
        messages: deepseekMessages,
        max_tokens: Number(this.generationSettings.maxOutputTokens),
        temperature: Number(this.generationSettings.temperature),
        top_p: Number(this.generationSettings.topP), // DeepSeek might not have response_format like OpenAI. Handle JSON parsing manually.
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error("No content returned from DeepSeek API");
      }
      return JSON.parse(content) as SituationFinishReport; // Adjust parsing based on actual DeepSeek response structure if needed.
    } catch (error) {
      throw new Error(
        `generateReport failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  public async generateScenarios(goal: string, instruction: string): Promise<SituationSettings[]> {
    try {
      const deepseekMessages: OpenAI.ChatCompletionMessageParam[] = [
        { role: "user", content: goal },
        { role: "system", content: instruction },
        { role: "user", content: `json: ${JSON.stringify(scenarioSchema)}` },
      ];

      const completion = await this.deepseek.chat.completions.create({
        model: this.utilityModelName, // Model name from utilityModelName
        messages: deepseekMessages,
        max_tokens: Number(this.generationSettings.maxOutputTokens),
        temperature: Number(this.generationSettings.temperature),
        top_p: Number(this.generationSettings.topP), // DeepSeek might not have response_format like OpenAI. Handle JSON parsing manually.
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error("No content returned from DeepSeek API");
      }
      console.log(JSON.parse(content));
      return JSON.parse(content).scenarioArray as SituationSettings[]; // Adjust parsing based on actual DeepSeek response structure if needed.
    } catch (error) {
      throw new Error(
        `generateScenarios failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

function parseMessagesForDeepSeek(
  messages: Message[],
  agentName?: string,
  systemInstruction?: string
): OpenAI.ChatCompletionMessageParam[] {
  const deepseekMessages: OpenAI.ChatCompletionMessageParam[] = [];

  if (systemInstruction) {
    deepseekMessages.push({ role: "system", content: systemInstruction });
  }

  if (agentName) {
    messages.forEach((message) => {
      const role = message.sender === agentName ? "assistant" : "user";
      deepseekMessages.push({
        role: role,
        content: `${message.sender !== agentName ? `${message.sender}: ` : ""}${message.content}`,
      });
    });
  } else {
    messages.forEach((message) => {
      const role = message.sender === "user" ? "user" : "assistant";
      deepseekMessages.push({
        role: role,
        content: `${message.sender !== "user" ? `${message.sender}: ` : "USER: "}${message.content}`,
      });
    });
  }

  return adjustFirstLastMessageToUser(deepseekMessages);
}

function adjustFirstLastMessageToUser(deepseekMessages: OpenAI.ChatCompletionMessageParam[]) {
  const messages = deepseekMessages;

  messages[messages.length - 1].role = "user";
  return messages;
}

function interweave(deepseekMessages: OpenAI.ChatCompletionMessageParam[]) {
    const messages = deepseekMessages;

    let bounce: "user" | "assistant" = "user"

    messages.forEach((msg) => {
      msg.role = bounce
      bounce = bounce == 'user' ? 'assistant' : 'user'
    })

    return messages
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
