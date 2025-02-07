declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[];  // Can be a single number or array [top, left, bottom, right]
    filename?: string;
    image?: { type: string; quality: number };
    html2canvas?: { 
      scale: number;
      useCORS?: boolean;
      logging?: boolean;
    };
    jsPDF?: { unit: string; format: string; orientation: string };
  }

  interface Html2PdfInstance {
    set(options: Html2PdfOptions): Html2PdfInstance;
    from(element: HTMLElement): Html2PdfInstance;
    save(): Promise<void>;
  }

  function html2pdf(): Html2PdfInstance;
  export default html2pdf;
} 