export interface TableData {
  id: string;
  aiModel: string;
  task: string;
  prompt: string;
  timestamp: string;
}

export interface ParagraphString {
  content: string;
}

export interface PromptVerzeichnisContent {
  chats: TableData[];
}

export interface ParagraphsContent {
  paragraphs: ParagraphString[];
}
