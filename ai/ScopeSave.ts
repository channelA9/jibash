import { ScopeView } from "./defs/types";
import { Situation } from "./Situation";

class ScopeSave {
  private dbName: string = "ScopeDB";

  constructor() {
    // No need to initialize a database
  }

  saveScope(scope: { name: string; situations: Situation[] }) {
    const adjustedSituations = scope.situations.map((situation) => {
      return {
        settings: situation.getSettings(),
        messages: [...situation.getMessages()],
        situationFinishReport: situation.getReport(),
        agentProfiles: Object.values(situation.getAgents()).map((agent) => {
          return agent.getProfile()
        }),
      };
    });

    const adjustedScope: ScopeView = {
      name: scope.name,
      situationViews: adjustedSituations,
    };
    
    const scopes = this.loadScopeViews();
    const existingScopeIndex = scopes.findIndex((s) => s.name === scope.name);
    if (existingScopeIndex !== -1) {
      scopes[existingScopeIndex] = adjustedScope;
    } else {
      scopes.push(adjustedScope);
    }
    localStorage.setItem(this.dbName, JSON.stringify(scopes));
  }

  deleteScope(scopeName: string) {
    const scopes = this.loadScopeViews();
    const updatedScopes = scopes.filter((scope) => scope.name !== scopeName);
    if (scopes.length === updatedScopes.length) {
      return false;
    }
    localStorage.setItem(this.dbName, JSON.stringify(updatedScopes));
    return true;
  }

  loadScopeViews(): ScopeView[] {
    const scopes = localStorage.getItem(this.dbName);
    return scopes ? JSON.parse(scopes) : [];
  }
}

export const scopeSave = new ScopeSave();
