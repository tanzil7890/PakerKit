declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: {
      type?: string;
      quality?: number;
    };
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
      letterRendering?: boolean;
      width?: number;
      windowWidth?: number;
    };
    jsPDF?: {
      unit?: string;
      format?: string;
      orientation?: 'portrait' | 'landscape' | string;
      hotfixes?: string[];
    };
    pagebreak?: {
      mode?: string[];
      before?: string;
      avoid?: string[];
    };
  }

  interface Html2Pdf {
    set: (options: Html2PdfOptions) => Html2Pdf;
    from: (element: HTMLElement) => Html2Pdf;
    save: () => Promise<void>;
    output: (type: string) => Promise<Blob>;
  }

  function html2pdf(): Html2Pdf;
  export = html2pdf;
} 