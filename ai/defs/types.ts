import { Agent } from "../Agent";
import { Situation } from "../Situation";

// settings
export interface ScopeSettings {
  language: string;
  nativeLanguage: string;
  scenarioCount: number;
  minAgents: number;
  maxAgents: number;
  languageLevel: string;
  timerEnabled: boolean;
  multiMessageGenerationEnabled: boolean;
  descriptionsInNativeLanguage: boolean;
}
export interface SituationSettings {
  title: string;
  agentDefs: Profile[];
  scenario: string;
  objective: string;
  discussionDuration: number;
}

// report related
export interface SituationFinishReport {
  score: SituationFinishScores;
  analysis: string;
  comments: SituationFinishComment[];
}

export interface SituationFinishScores {
  overall: number;
  grammar: number;
  fluency: number;
  role: number;
}

export interface SituationFinishComment {
  quote: string;
  analysis: string;
}

// profile related
export interface Profile {
  name: string;
  stats: Stats;
  relationToUser?: string;
  personality: string;
  relations?: Relation[];
}

export interface Stats {
  age?: number;
  gender?: string;
  job?: string;
}

export interface Relation {
  name: string;
  shortOpinion: string;
  memories: Memory[];
}
export interface Memory {
  weight: number;
  summary: string;
}
export interface Message {
  sender: string;
  content: string;
}

// prompt related
export interface Filters {
  agents?: string;
  action?: string;
  language?: string;
  nativeLanguage?: string;
  user?: string;
  languageLevel?: string;
  scenarioCount?: number;
  minAgents?: number;
  maxAgents?: number;
}

export interface AIInterfaceGenerationSettings {
  maxOutputTokens: number;
  temperature: number;
  topP: number;
  topK: number;
}

export interface APIKeys extends Record<string, string | undefined> {
  'google'?: string;
}

export interface InitSettings {
  settings: ScopeSettings,
  provider: string,
  apiKeys: APIKeys,
  userProfile: Profile,
  initGenerationSettings: InitGenerationSettings
}

export interface InitGenerationSettings {
  primaryModel: string,
  utilityModel: string,
  generationSettings: AIInterfaceGenerationSettings,
}

export interface ScopeView {
  name: string,
  situationViews: SituationView[],
}

export interface SituationView {
  settings: SituationSettings,
  messages: Message[],
  situationFinishReport?: SituationFinishReport,
}