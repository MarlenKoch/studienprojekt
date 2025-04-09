import { ContextInputs } from "./ContextInputs";

export interface ChatRequest {
    user_prompt: string;
    ai_model: string;
    context_inputs: ContextInputs;
}