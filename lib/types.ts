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
  size: string;
  lastUpdated: string;
  content: string;
  variables: Variable[];
  description: string;
  paperSize: 'letter' | 'a4' | 'legal';
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
  documentsGenerated: number;
}

export interface Variable {
  name: string;
  type: 'custom' | 'csv';
  value?: string;
}
