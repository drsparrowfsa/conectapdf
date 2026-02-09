import * as pdfjsLib from 'pdfjs-dist';

// Configure worker
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

export const setupPdfWorker = () => {
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
    }
};
