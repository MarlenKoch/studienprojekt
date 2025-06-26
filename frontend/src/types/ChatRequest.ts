import { ContextInputs } from "./ContextInputs";
import { UserPromptInputs } from "./UserPromptInputs";

export interface ChatRequest {
  userPrompt: UserPromptInputs;
  aiModel: string;
  context: ContextInputs;
}
