import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Download, ExternalLink, FileText } from 'lucide-react';

export const Manual: React.FC = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header com Gradiente e Logo/Título */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-10 blur-xl">
          <BookOpen className="w-80 h-80" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                <BookOpen className="w-8 h-8 text-blue-200" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Manual do S.O.M</h1>
                <p className="text-blue-100 text-sm">
                  Visualize o Manual SOM Book v8 completo e atualizado (Versão Agosto/26).
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="/manual.pdf"
              download="Manual_SOM_Book_v8.pdf"
              className="flex items-center gap-2 px-5 py-3 bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold rounded-2xl transition-all border border-white/20 shadow-md backdrop-blur-sm"
            >
              <Download className="w-5 h-5" />
              <span>Baixar PDF</span>
            </a>
            <a
              href="/manual.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 bg-white text-blue-900 hover:bg-blue-5 font-bold rounded-2xl transition-all shadow-md"
            >
              <ExternalLink className="w-5 h-5" />
              <span>Abrir em Nova Aba</span>
            </a>
          </div>
        </div>
      </div>

      {/* Leitor de PDF Embutido */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-lg flex flex-col h-[75vh]"
      >
        <div className="px-6 py-4 border-b border-gray-150 dark:border-zinc-800/80 bg-gray-50 dark:bg-zinc-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            <span className="font-bold text-sm text-gray-700 dark:text-zinc-300">
              Visualização Direta (PDF)
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full">
            Manual_SOM_Book_v8_Versãoagosto26.pdf
          </span>
        </div>

        <div className="flex-1 bg-gray-100 dark:bg-zinc-950 relative">
          <iframe
            src="/manual.pdf#toolbar=0"
            className="w-full h-full border-none"
            title="Manual SOM"
          />
        </div>
      </motion.div>
    </div>
  );
};
