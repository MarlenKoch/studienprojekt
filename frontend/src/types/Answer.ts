export interface Answer {
  id?: number;
  task: number; // User-Eingabe
  aiModel: string;
  userPrompt: string;
  timestamp: number;
  aiAnswer: string; // AI-Antwort
  userNote: string; // (optional)
  userNoteEnabled: boolean;
  chat_id?: number;
}
