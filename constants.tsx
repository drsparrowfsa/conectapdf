
import React from 'react';
import { ShieldCheck, Zap, Globe } from 'lucide-react';
import { Tool, ToolCategory } from './types';

export const COLORS = {
  primary: '#6A5ACD',
  secondary: '#7B68EE',
  accent: '#EE82EE',
  background: '#F8FAFC',
  text: '#1E293B',
};

export const TOOLS: Tool[] = [
  // PDF Tools
  {
    id: 'merge-pdf',
    name: 'Juntar PDFs',
    description: 'Combine múltiplos arquivos PDF em um único documento organizado.',
    icon: 'Merge', // Lucide icon name
    category: ToolCategory.PDF,
    path: '/merge-pdf',
  },
  {
    id: 'split-pdf',
    name: 'Dividir PDF',
    description: 'Separe páginas de um PDF ou extraia intervalos específicos.',
    icon: 'Scissors',
    category: ToolCategory.PDF,
    path: '/split-pdf',
  },
  {
    id: 'compress-pdf',
    name: 'Comprimir PDF',
    description: 'Reduza o tamanho do arquivo PDF mantendo a qualidade visual.',
    icon: 'Minimize2',
    category: ToolCategory.PDF,
    path: '/compress-pdf',
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF para JPG',
    description: 'Transforme cada página do seu PDF em imagens JPG de alta qualidade.',
    icon: 'FileImage',
    category: ToolCategory.CONVERTER,
    path: '/pdf-to-jpg',
  },
  {
    id: 'ocr-pdf',
    name: 'OCR PDF',
    description: 'Torne textos em imagens e PDFs digitalizados selecionáveis e pesquisáveis.',
    icon: 'ScanText',
    category: ToolCategory.PDF,
    path: '/ocr-pdf',
  },

  // AI Tools
  {
    id: 'ai-summary',
    name: 'Resumo Automático',
    description: 'Obtenha resumos inteligentes e concisos de documentos longos com IA.',
    icon: 'FileText',
    category: ToolCategory.AI,
    path: '/ai-summary',
  },
  {
    id: 'ai-extraction',
    name: 'Extração de Dados',
    description: 'Extraia informações específicas (nomes, datas, valores) automaticamente.',
    icon: 'Database',
    category: ToolCategory.AI, // Keeping relevant existing tool logic if needed
    path: '/ai-extraction',
  },
  {
    id: 'ai-translate',
    name: 'Tradução de PDF',
    description: 'Traduza documentos inteiros mantendo a formatação original.',
    icon: 'Languages',
    category: ToolCategory.AI,
    path: '/ai-translate',
  },
  {
    id: 'ai-classify',
    name: 'Classificação de Docs',
    description: 'Categorize e organize documentos automaticamente por conteúdo.',
    icon: 'Tags',
    category: ToolCategory.AI,
    path: '/ai-classify',
  },
  {
    id: 'ai-contract',
    name: 'Geração de Contrato',
    description: 'Crie minutas de contratos personalizados com base em parâmetros simples.',
    icon: 'FileSignature',
    category: ToolCategory.AI,
    path: '/ai-contract',
  },

  // Preserving existing useful tools unless user explicitly demanded removal
  {
    id: 'image-converter',
    name: 'Conversor de Imagens',
    description: 'Transforme formatos JPG, PNG e WEBP instantaneamente.',
    icon: 'Image',
    category: ToolCategory.CONVERTER,
    path: '/image-converter',
  },
  {
    id: 'currency-converter',
    name: 'Conversor de Moedas',
    description: 'Cotações em tempo real e conversão rápida de moedas.',
    icon: 'RefreshCw',
    category: ToolCategory.CONVERTER,
    path: '/currency-converter',
  },
  {
    id: 'photo-to-table',
    name: 'Foto → Tabela (IA)',
    description: 'Extraia tabelas estruturadas de fotos usando Inteligência Artificial avançada.',
    icon: 'Table',
    category: ToolCategory.CONVERTER,
    path: '/photo-to-table',
  },
];

export const FEATURES = [
  {
    title: 'Privacidade Total',
    description: 'Seus arquivos são processados localmente ou via conexões seguras, sem armazenamento desnecessário.',
    icon: <ShieldCheck className="w-8 h-8 text-indigo-500" />
  },
  {
    title: 'Velocidade Extrema',
    description: 'Otimizado para ser 100% no navegador, garantindo agilidade no seu fluxo de trabalho.',
    icon: <Zap className="w-8 h-8 text-yellow-500" />
  },
  {
    title: 'IA Integrada',
    description: 'Utilizamos o que há de mais moderno em IA para extração de dados e automação.',
    icon: <Globe className="w-8 h-8 text-blue-500" />
  }
];
