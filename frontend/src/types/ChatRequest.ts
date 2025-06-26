import { ContextInputs } from "./ContextInputs";
import { UserPromptInputs } from "./UserPromptInputs";

export interface ChatRequest {
  user_prompt: UserPromptInputs;
  context_inputs: ContextInputs;
  ai_model: string;
}
