import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Utilitários para exportação de dados do SOM.
 */
export const exportUtils = {
  /**
   * Exporta a Matrix de Aderência para Excel.
   */
  exportMatrixToExcel: (matrixData: any, flatUnits: string[], allPilars: string[], mesAno: string) => {
    const data: any[] = [];
    
    // Header das unidades
    const headerRow = ['Pilar', ...flatUnits];
    data.push(headerRow);

    // Linhas de dados por pilar
    allPilars.forEach(pilar => {
      const row = [pilar];
      flatUnits.forEach(unit => {
        const val = matrixData[unit]?.[pilar] || '0%';
        row.push(val);
      });
      data.push(row);
    });

    const totalRow = ['ADERÊNCIA TOTAL'];
    flatUnits.forEach(unit => {
      const val = matrixData[unit]?.['Total'] || '0%';
      totalRow.push(val);
    });
    data.push(totalRow);

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Matrix de Aderência");

    // Estilização básica (opcional se a lib suportar, mas aqui focamos nos dados)
    XLSX.writeFile(wb, `SOM_Matrix_Aderencia_${mesAno}.xlsx`);
  },

  /**
   * Exporta o Rank para Excel.
   */
  exportRankToExcel: (rankData: any[], mesAno: string) => {
    const data = rankData.map(item => ({
      'Unidade': item.unidade,
      'Aderência Geral': `${item.aderenciaGeral.toFixed(1).replace('.', ',')}%`,
      'Status': item.aderenciaGeral >= 70 ? 'Certificado' : (item.aderenciaGeral >= 50 ? 'Qualificado' : 'Não Aderente')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ranking");
    XLSX.writeFile(wb, `SOM_Ranking_${mesAno}.xlsx`);
  },

  /**
   * Exporta o Dashboard (Resumo por Pilar) para PDF.
   */
  exportDashboardToPDF: (resumoPorPilar: any[], aderenciaMedia: number, mesAno: string, unidade: string) => {
    const doc = new jsPDF() as any;
    
    // Título
    doc.setFontSize(18);
    doc.text(`Relatório de Performance SOM - ${unidade}`, 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Mês/Ano: ${mesAno}`, 14, 30);
    doc.text(`Aderência Média: ${aderenciaMedia.toFixed(1).replace('.', ',')}%`, 14, 35);

    // Tabela
    const tableColumn = ["Pilar", "Total", "Conforme", "N. Conforme", "Aderência", "Status"];
    const tableRows = resumoPorPilar.map(p => [
      p.pilar,
      p.total,
      p.conforme,
      p.naoConforme,
      `${p.aderencia.toFixed(1).replace('.', ',')}%`,
      p.status
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59] }, // Cor do cabeçalho (#1e293b)
    });

    doc.save(`SOM_Relatorio_${unidade}_${mesAno}.pdf`);
  }
};
