import { Scope } from "./Scope";
import { scopeSave } from "./ScopeSave";
import { SettingsSave } from "./SettingsSave";
import { Situation } from "./Situation";
import {
  APIKeys,
  ScopeSettings,
  Profile,
  InitSettings,
  InitGenerationSettings,
} from "./defs/types";

export class ScopeManager {
  public scopes: Map<string, Scope> = new Map();
  private currentScopeName: string | null = null;
  private settings: ScopeSettings;
  private provider: string;
  private apiKeys: APIKeys;
  private userProfile: Profile;
  private initGenerationSettings: InitGenerationSettings;

  constructor() {
    window.addEventListener("beforeunload", () => this.saveCurrentScope());

    // Load settings, provider, API keys, and user profile
    this.settings = SettingsSave.loadSettings() ?? this.getDefaultSettings();
    this.provider = SettingsSave.loadProvider() ?? "google";
    this.apiKeys = SettingsSave.loadAPIKeys() ?? {};
    this.userProfile =
      SettingsSave.loadUserProfile() || this.getDefaultUserProfile();
    console.log(this.settings, this.provider, this.apiKeys, this.userProfile);
    this.initGenerationSettings =
      SettingsSave.loadGenerationSettings() ||
      this.getDefaultGenerationSettings();
  }

  private getDefaultSettings(): ScopeSettings {
    return {
      language: "japanese",
      nativeLanguage: "english",
      scenarioCount: 1,
      minAgents: 1,
      maxAgents: 3,
      languageLevel: "N3",
      timerEnabled: false,
      multiMessageGenerationEnabled: true,
      descriptionsInNativeLanguage: true,
    };
  }

  private getDefaultGenerationSettings(): InitGenerationSettings {
    return {
      primaryModel: "gemini-2.0-flash-exp",
      utilityModel: "gemini-2.0-flash-exp",
      generationSettings: {
        maxOutputTokens: 4096,
        temperature: 0.7,
        topP: 1,
        topK: 40,
      },
    };
  }

  private getDefaultUserProfile(): Profile {
    return {
      name: "USER",
      stats: {},
      personality: "",
    };
  }

  newScope(scope: Scope, name: string) {
    if (this.scopes.has(name)) {
      throw new Error(`Scope with name ${name} already exists`);
    }
    scope.name = name
    this.scopes.set(name, scope);
    this.currentScopeName = name;
    return scope;
  }

  getScope(name: string): Scope | undefined {
    return this.scopes.get(name);
  }

  deleteScope(name: string) {
    console.log(name)
    this.scopes.forEach((scope) => {console.log(scope)})
    if (this.scopes.has(name)) {
      this.scopes.delete(name);
    }
    console.log(scopeSave.deleteScope(name))
  }


  setCurrentScope(name: string) {
    if (this.scopes.has(name)) {
      this.currentScopeName = name;
    } else {
      throw new Error(`Scope with name ${name} does not exist`);
    }
  }

  saveCurrentScope() {
    if (this.currentScopeName) {
      const scope = this.scopes.get(this.currentScopeName);
      if (scope) {
        if (scope.situations.length > 0) {
          scopeSave.saveScope({
            name: scope.name,
            situations: scope.situations,
          });
        }

        SettingsSave.saveAll(
          scope.getSettings(),
          scope.getProvider(),
          scope.getAPIKeys(),
          scope.userProfile,
          scope.getGenerationSettings()
        );
      }
    }

    // Save settings, provider, API keys, and user profile
  }

  loadScopes() {
    return scopeSave.loadScopeViews();
  }

  loadSavedSettings(): InitSettings {
    return {
      settings: this.settings,
      provider: this.provider,
      apiKeys: this.apiKeys,
      userProfile: this.userProfile,
      initGenerationSettings: this.initGenerationSettings,
    };
  }
}
