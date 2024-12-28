import { AIInterfaceGenerationSettings, APIKeys, InitGenerationSettings, Profile, ScopeSettings } from "./defs/types";

export class SettingsSave {
    static saveSettings(settings: ScopeSettings) {
      localStorage.setItem('settings', JSON.stringify(settings));
    }
  
    static loadSettings(): ScopeSettings {
      const settings = localStorage.getItem('settings');
      return settings ? JSON.parse(settings) : null;
    }
  
    static saveProvider(provider: string) {
      localStorage.setItem('provider', JSON.stringify(provider));
    }
  
    static loadProvider(): string {
      const provider = localStorage.getItem('provider');
      return provider ? JSON.parse(provider) : null;
    }

    static saveGenerationSettings(generationSettings: InitGenerationSettings) {
      localStorage.setItem('generationSettings', JSON.stringify(generationSettings));
    }

    static loadGenerationSettings(): { primaryModel: string, utilityModel: string, generationSettings: AIInterfaceGenerationSettings } {
      const generationSettings = localStorage.getItem('generationSettings');
      return generationSettings ? JSON.parse(generationSettings) : null;
    }


    static saveAPIKeys(apiKeys: APIKeys) {
      localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
    }
  
    static loadAPIKeys(): APIKeys {
      const apiKeys = localStorage.getItem('apiKeys');
      return apiKeys ? JSON.parse(apiKeys) : null;
    }
  
    static saveUserProfile(userProfile: Profile) {
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }
  
    static loadUserProfile(): Profile {
      const userProfile = localStorage.getItem('userProfile');
      return userProfile ? JSON.parse(userProfile) : null;
    }
  
    static saveAll(settings: ScopeSettings, provider: string, apiKeys: APIKeys, userProfile: Profile, generationSettings: InitGenerationSettings) {
      this.saveSettings(settings);
      this.saveProvider(provider);
      this.saveAPIKeys(apiKeys);
      this.saveUserProfile(userProfile);
      this.saveGenerationSettings(generationSettings)
    }
  
    static loadAll() {
      return {
        settings: this.loadSettings(),
        provider: this.loadProvider(),
        apiKeys: this.loadAPIKeys(),
        userProfile: this.loadUserProfile(),
        generationSettings: this.loadGenerationSettings()
      };
    }
  }