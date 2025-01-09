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