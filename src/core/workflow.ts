import { AgentAPI } from "../core/agentAPI";

export type WorkflowConstructor<T extends Workflow = Workflow> = {
  new (agentApi: AgentAPI): T;
  ENABLED: boolean;
};

export class Workflow {
  static readonly ENABLED: boolean = true;
  protected readonly agentApi: AgentAPI;

  constructor(agentApi: AgentAPI) {
    this.agentApi = agentApi;
  }

  run() {}
}
