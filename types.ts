
export enum ToolCategory {
  PDF = 'PDF',
  // IMAGE category removed
  AI = 'Inteligência Artificial',
  CONVERTER = 'Conversores',
  ALL = 'Todos'
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: ToolCategory;
  path: string;
}
