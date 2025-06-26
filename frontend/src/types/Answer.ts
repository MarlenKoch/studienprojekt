export interface Answer {
  id?: number;
  task: string; // User-Eingabe
  aiModel: string;
  userPrompt: string;
  timestamp: number;
  aiAnswer: string; // AI-Antwort
  userNote: string; // (optional)
  userNoteEnabled: boolean;
  chat_id?: number;
}
