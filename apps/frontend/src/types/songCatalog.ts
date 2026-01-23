export type ViewMode = 'list' | 'edit';
export type EditorTab = 'content' | 'metadata';
export type MobileContentTab = 'text' | 'preview';

export interface EditedMeta {
  title: string;
  description: string;
  categories: string[];
  domain: string;
}

export interface NewSongData {
  title: string;
  domain: string;
}



