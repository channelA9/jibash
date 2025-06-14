import {
  GenerateContentRequest,
  GoogleGenerativeAI,
  SchemaType,
  Schema,
  SafetySetting,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { AIInterface } from "./base";
import {
  AIInterfaceGenerationSettings,
  APIKeys,
  Message,
  SituationFinishReport,
  SituationSettings,
} from "../defs/types";


const safetySettings: SafetySetting[]  = [
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
]

export class GeminiInterface extends AIInterface {
  public models: string[] = [
    "gemini-2.5-flash-preview-05-20",
    "gemini-2.5-pro-preview-06-05",
    "gemini-2.0-flash",
  ];

  public primaryModelName = this.models[0];
  public utilityModelName = this.models[0];

  public generationSettings: AIInterfaceGenerationSettings = {
    maxOutputTokens: 1200,
    temperature: 1,
    topP: 1,
    topK: 1,
  };

  private genAI = new GoogleGenerativeAI("");



  private primaryModel = this.genAI.getGenerativeModel({
    model: this.primaryModelName,
  });
  private utilityModel = this.genAI.getGenerativeModel({
    model: this.utilityModelName,
  });

  constructor(apiKeys: APIKeys) {
    super();
    if (apiKeys.google) {
      this.setAPIKey(apiKeys.google);
    }
  }

  public setAPIKey(key: string) {
    console.log("NEW SET API KEY", key);
    this.genAI = new GoogleGenerativeAI(key);
    this.primaryModel = this.genAI.getGenerativeModel({
      model: this.primaryModelName,
    });
    this.utilityModel = this.genAI.getGenerativeModel({
      model: this.utilityModelName,
    });
  }

  public setModel(model: string, role: "primary" | "utility") {
    if (this.models.includes(model)) {
      if (role == "primary") {
        this.primaryModelName = model;
        this.primaryModel = this.genAI.getGenerativeModel({ model: model });
      } else {
        this.utilityModelName = model;
        this.utilityModel = this.genAI.getGenerativeModel({ model: model });
      }
    } else {
      console.log(`${model} does not exist in the current provider.`);
    }
  }

  public getModels(): string[] {
    return this.models;
  }

  public async prompt(
    messages: Message[],
    instruction: string,
    role?: string
  ): Promise<string> {
    try {
      const contents = role
        ? parseMessages(messages, role)
        : parseMessages(messages);

      const request: GenerateContentRequest = {
        contents: contents,
        systemInstruction: instruction,
        generationConfig: this.generationSettings,
        safetySettings: safetySettings
      };

      const response = await this.primaryModel.generateContent(request);
      return response.response.text();
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
      const contents = [
        {
          role: "model",
          parts: [
            {
              text: `CONVERSATION CONTEXT: ${JSON.stringify({
                description: settings.scenario,
                objective: settings.objective,
                agents: settings.agentDefs,
              })}`,
            },
          ],
        },
        ...parseMessages(messages),
      ];

      const request: GenerateContentRequest = {
        contents: contents,
        systemInstruction: instruction,
        generationConfig: {
          ...this.generationSettings,
          responseMimeType: "application/json",
          responseSchema: messageArraySchema,
        },
        safetySettings: safetySettings
      };

      const response = (await this.primaryModel.generateContent(request))
        .response;
      return JSON.parse(response.text()) as Message[];
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
      const contents = [
        ...parseMessages(messages),
        {
          role: "user",
          parts: [{ text: JSON.stringify(choices) }],
        },
      ];

      const request: GenerateContentRequest = {
        contents: contents,
        systemInstruction: instruction,
        generationConfig: {
          ...this.generationSettings,
          responseMimeType: "application/json",
          responseSchema: integerSchema,
        },
        safetySettings: safetySettings
      };

      const response = (await this.utilityModel.generateContent(request))
        .response;
      return Number(response.text());
    } catch (error) {
      throw new Error(
        `decide failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  public async generateReport(
    messages: Message[],
    settings: SituationSettings,
    instruction: string
  ): Promise<SituationFinishReport> {
    try {
      const contents = [
        {
          role: "model",
          parts: [
            {
              text: `CONVERSATION CONTEXT: ${JSON.stringify({
                description: settings.scenario,
                objective: settings.objective,
                agents: settings.agentDefs,
              })}`,
            },
          ],
        },
        ...parseMessages(messages),
      ];

      const request: GenerateContentRequest = {
        contents: contents,
        systemInstruction: instruction,
        generationConfig: {
          ...this.generationSettings,
          responseMimeType: "application/json",
          responseSchema: reportSchema,
        },
        safetySettings: safetySettings
      };

      const response = (await this.primaryModel.generateContent(request))
        .response;
      return JSON.parse(response.text()) as SituationFinishReport;
    } catch (error) {
      throw new Error(
        `generateReport failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  public async generateScenarios(goal: string, instruction: string) {
    console.log(instruction)
    try {
      const request: GenerateContentRequest = {
        contents: [{ role: "user", parts: [{ text: goal }] }],
        systemInstruction: instruction,
        generationConfig: {
          ...this.generationSettings,
          responseMimeType: "application/json",
          responseSchema: scenarioSchema,
        },
        safetySettings: safetySettings,
      };

      const response = (await this.utilityModel.generateContent(request))
        .response;
      return JSON.parse(response.text()) as SituationSettings[];
    } catch (error) {
      throw new Error(
        `generateScenarios failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

function parseMessages(messages: Message[], agentName?: string) {
  if (agentName) {
    return messages.map((message) => {
      return {
        role: message.sender != agentName ? "user" : "model",
        parts: [
          {
            text: `${message.sender != agentName ? `${message.sender}: ` : ""}${message.content}`,
          },
        ],
      };
    });
  } else {
    return messages.map((message) => {
      return {
        role: message.sender == "user" ? "user" : "model",
        parts: [
          {
            text: `${message.sender != "user" ? `${message.sender}: ` : "USER: "}${message.content}`,
          },
        ],
      };
    });
  }
}

const integerSchema: Schema = {
  type: SchemaType.INTEGER,
  description: "The chosen index in the JS array.",
};

const scenarioSchema: Schema = {
  type: SchemaType.ARRAY,
  description: "An array of multiple chat scenarios",
  items: {
    type: SchemaType.OBJECT,
    description:
      "A scenario object with agentDefs, title, scenario, objective, and discussionDuration",
    properties: {
      title: {
        type: SchemaType.STRING,
        description: "A short title for this scenario.",
        nullable: false,
      },
      scenario: {
        type: SchemaType.STRING,
        description:
          "Two sentences that visually describe the starting scene.`",
        nullable: false,
      },
      objective: {
        type: SchemaType.STRING,
        description: "The user's goal to 'win' or succeed in this situation.`",
        nullable: false,
      },
      discussionDuration: {
        type: SchemaType.INTEGER,
        description:
          "A reasonable duration for the objective to be completed in this chat.",
        nullable: false,
      },
      agentDefs: {
        type: SchemaType.ARRAY,
        description:
          "An array of the AI bots for this scenario, excluding the user's character",
        nullable: false,
        items: {
          type: SchemaType.OBJECT,
          description: "An agent.",
          nullable: false,
          properties: {
            name: {
              type: SchemaType.STRING,
              description:
                "A randomly generated name relevant to the language's home country",
              nullable: false,
            },
            stats: {
              type: SchemaType.OBJECT,
              description:
                "The agent's stats, required to allow for accurate judgement of social context",
              nullable: false,
              properties: {
                age: {
                  type: SchemaType.NUMBER,
                  description: "The agent's age",
                  nullable: false,
                },
                gender: {
                  type: SchemaType.STRING,
                  description: "The agent's gender (f/m)",
                  nullable: false,
                },
                job: {
                  type: SchemaType.STRING,
                  description: "The agent's job",
                  nullable: false,
                },
              },
            },
            relationToUser: {
              type: SchemaType.STRING,
              description:
                "The relationship the agent has with user for the situation context, eg: Boss, Friend, Stranger, Senior, etc.",
            },
            personality: {
              type: SchemaType.STRING,
              description: "The agent's personality",
              nullable: false,
            },
          },
        },
      },
    },
  },
};

const reportSchema: Schema = {
  type: SchemaType.OBJECT,
  description: "A report analyzing the discussion",
  properties: {
    score: {
      type: SchemaType.OBJECT,
      properties: {
        overall: {
          type: SchemaType.INTEGER,
          description: `A score from 0-1000 rating the user's overall performance.`,
        },
        grammar: {
          type: SchemaType.INTEGER,
          description: `A score from 0-1000 rating the user's grammar.`,
        },
        fluency: {
          type: SchemaType.INTEGER,
          description: `A score from 0-1000 rating the user's flow and natural use of expressions given the conversational context.`,
        },
        role: {
          type: SchemaType.INTEGER,
          description: `A score from 0-1000 rating the user's use of language according to their social role and place in the conversation based on the language's implied societal norms and etiquette.`,
        },
      },
    },
    analysis: {
      type: SchemaType.STRING,
      description:
        "An overall analysis that describes your perception of how the user performed in the conversation according to expectations.",
    },
    comments: {
      type: SchemaType.ARRAY,
      description:
        "An array of comments to be made about specific sentences that the user made.",
      items: {
        type: SchemaType.OBJECT,
        description: "A comment for a specific sentence of note from the user.",
        properties: {
          quote: {
            type: SchemaType.STRING,
            description: "The exact quote of what the user typed.",
          },
          analysis: {
            type: SchemaType.STRING,
            description:
              "Your short comment or analysis of this sentence and its effect on the score.",
          },
        },
      },
    },
  },
};

const messageSchema: Schema = {
  type: SchemaType.OBJECT,
  description:
    "An individual message, either a system message or dialogue from the relevant non-user agents.",
  properties: {
    sender: {
      type: SchemaType.STRING,
      description:
        "The agent's name. Use SYSTEM if it's a 3rd-person narration element.",
      nullable: false,
    },
    content: {
      type: SchemaType.STRING,
      description: "Dialog of the agent, or narration if the SYSTEM.",
      nullable: false,
    },
  },
  nullable: false,
};

const messageArraySchema: Schema = {
  type: SchemaType.ARRAY,
  description:
    "An array of new chronological messages that continue the scene, made of a variable length of messages that continues up until the user is expected to speak again. It should not contain any preexisting messages from the prompt.",
  items: messageSchema,
  nullable: false,
};
