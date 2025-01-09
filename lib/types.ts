import type { Delta } from 'quill';
export interface Dataset {
  id: string;
  name: string;
  records: number;
  columns: {
    name: string;
    type: string;
    sample?: string;
  }[];
  uploadedAt: Date;
  type: string;
  data: any[];
  preview?: any[];
  statistics: {
    columnCount: number;
    rowCount: number;
    dataType: 'tabular' | 'time-series' | 'categorical' | 'numerical';
    format: string;
  };
}

export interface FileWithPreview extends File {
  preview?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  paperSize: 'letter' | 'a4' | 'legal';
  content?: Delta;
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
  documentsGenerated?: number;
} 