import { ContextInputs } from "./ContextInputs";
import { UserPromptInputs } from "./UserPromptInputs";

export interface AiRequest {
  userPrompt: UserPromptInputs;
  aiModel: string;
  context: ContextInputs;
}
