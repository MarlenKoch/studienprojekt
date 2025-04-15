import { ContextInputs } from "./ContextInputs";
import { UserPromptInputs } from "./UserPromptInputs";

export interface ChatRequest {
    user_prompt: UserPromptInputs;
    ai_model: string;
    context_inputs: ContextInputs;
}