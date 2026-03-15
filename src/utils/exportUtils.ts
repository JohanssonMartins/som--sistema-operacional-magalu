import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Utilitários para exportação de dados em Excel e PDF.
 */
export const exportUtils = {
  /**
   * Exporta a Matriz de Aderência Consolidada para Excel.
   */
  exportMatrixToExcel: (matrixData: any, flatUnits: string[], allPilars: string[], mesAno: string) => {
    const data: any[] = [];
    
    // Cabeçalho
    const headerRow = ['Pilar', ...flatUnits];
    data.push(headerRow);
    
    // Dados por Pilar
    allPilars.forEach(pilar => {
      const row = [pilar];
      flatUnits.forEach(unit => {
        const val = matrixData[unit]?.[pilar] || '0';
        row.push(`${val}%`);
      });
      data.push(row);
    });
    
    // Linha de Total
    const totalRow = ['ADERÊNCIA TOTAL'];
    flatUnits.forEach(unit => {
      const val = matrixData[unit]?.['Total'] || '0';
      totalRow.push(`${val}%`);
    });
    data.push(totalRow);

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Matriz de Aderência");
    XLSX.writeFile(wb, `SOM_Matriz_Aderencia_${mesAno}.xlsx`);
  },

  /**
   * Exporta o Ranking de Unidades para Excel.
   */
  exportRankToExcel: (sortedUnits: any[], mesAno: string) => {
    const data = sortedUnits.map((u, idx) => ({
      'Posição': `${idx + 1}º`,
      'Unidade': `CD ${u.unidade}`,
      'Aderência Geral (%)': u.aderenciaGeral.toFixed(1),
      'Itens Totais': u.totalGeral,
      'Itens Respondidos': u.respondidosGeral
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ranking");
    XLSX.writeFile(wb, `SOM_Ranking_Performance_${mesAno}.xlsx`);
  },

  /**
   * Exporta o Dashboard (Resumo por Pilar) para PDF.
   */
  exportDashboardToPDF: (resumoPorPilar: any[], aderenciaMedia: number, mesAno: string, unidade: string) => {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    }) as any;
    
    // Título
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text(`Relatório de Performance - CD ${unidade}`, 14, 20);
    
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Período: ${mesAno} | Aderência Média Geral: ${aderenciaMedia.toFixed(1)}%`, 14, 28);
    
    doc.setLineWidth(0.5);
    doc.line(14, 32, 196, 32);

    // Tabela de Pilares
    const tableData = resumoPorPilar.map(p => [
      p.pilar,
      `${p.aderencia.toFixed(1)}%`,
      p.total,
      p.conforme,
      p.naoConforme,
      p.status
    ]);

    doc.autoTable({
      startY: 40,
      head: [['Pilar', 'Aderência', 'Total Itens', 'Conf.', 'Não Conf.', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillStyle: 'dark', fillColor: [30, 41, 59], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      styles: { fontSize: 9, cellPadding: 3 }
    });

    const finalY = doc.lastAutoTable.finalY || 150;
    
    // Rodapé
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('© 2026 SOM - Sistema Operacional Magalog', 14, finalY + 20);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, finalY + 26);

    doc.save(`Relatorio_Performance_${unidade}_${mesAno}.pdf`);
  }
};
