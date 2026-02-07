
import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Hub from './pages/Hub';
import PdfToJpg from './pages/tools/PdfToJpg';
import ImageConverter from './pages/tools/ImageConverter';
import PhotoToTable from './pages/tools/PhotoToTable';
import CurrencyConverter from './pages/tools/CurrencyConverter';
import MergePDF from './pages/tools/MergePDF';
import SplitPDF from './pages/tools/SplitPDF';
import CompressPDF from './pages/tools/CompressPDF';
import OcrPDF from './pages/tools/OcrPDF';
import SummarizePDF from './pages/tools/SummarizePDF';
import DataExtraction from './pages/tools/DataExtraction';
import TranslatePDF from './pages/tools/TranslatePDF';
import ClassifyPDF from './pages/tools/ClassifyPDF';
import ContractGenerator from './pages/tools/ContractGenerator';
import ToolPlaceholder from './pages/ToolPlaceholder';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    // Only scroll to top if there's no hash (anchor link)
    if (!window.location.hash.includes('#/')) {
      // Wait, under HashRouter, location.pathname is after the #/.
      // But window.location.hash is the full #/...
    }
    // Simple fix: if navigating to a new path, scroll up.
    // If the click already handled the scroll, this might conflict.
    // Let's check if the URL has an additional hash.
    const isAnchor = window.location.hash.split('/').length > 2 || window.location.hash.includes('#como-funciona');

    if (!isAnchor) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <ScrollToTop />
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ferramentas" element={<Hub />} />
            <Route path="/pdf-to-jpg" element={<PdfToJpg />} />
            <Route path="/image-converter" element={<ImageConverter />} />
            <Route path="/photo-to-table" element={<PhotoToTable />} />
            <Route path="/currency-converter" element={<CurrencyConverter />} />

            {/* New Tool Placeholders */}
            <Route path="/merge-pdf" element={<MergePDF />} />
            <Route path="/split-pdf" element={<SplitPDF />} />
            <Route path="/compress-pdf" element={<CompressPDF />} />
            <Route path="/ocr-pdf" element={<OcrPDF />} />
            <Route path="/ai-summary" element={<SummarizePDF />} />
            <Route path="/ai-extraction" element={<DataExtraction />} />
            <Route path="/ai-translate" element={<TranslatePDF />} />
            <Route path="/ai-classify" element={<ClassifyPDF />} />
            <Route path="/ai-contract" element={<ContractGenerator />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
