export interface Answer {
  id?: number;
  task: number;
  aiModel: string;
  userPrompt: string;
  timestamp: number;
  aiAnswer: string;
  userNote: string;
  userNoteEnabled: boolean;
  chat_id?: number;
  project_id?: number;
}
