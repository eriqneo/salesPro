import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { Sale, InventoryItem, DailyReport } from '@/types';

export const exportToPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
  });
  
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(`${filename}.pdf`);
};

export const exportSalesToCSV = (sales: Sale[], filename: string) => {
  const headers = ['Date', 'Agent ID', 'Shop ID', 'Route', 'Total Ksh', 'Status'];
  const rows = sales.map(s => [
    new Date(s.timestamp).toLocaleDateString(),
    s.agentId,
    s.shopId,
    s.routeName,
    s.totalKsh,
    s.syncStatus
  ]);

  const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportInventoryToExcel = (inventory: InventoryItem[], filename: string) => {
  const data = inventory.map(item => ({
    'Agent ID': item.agentId,
    'Product': item.productName,
    'SKU': item.productSku,
    'Cartons': item.quantityCartons,
    'Packets': item.quantityPackets,
    'Unit Cost': item.unitCostKsh,
    'Added At': new Date(item.addedAt).toLocaleDateString(),
    'Distributor ID': item.distributorId
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const shareToWhatsApp = (report: DailyReport) => {
  const text = `*FS Daily Evening Report*
Date: ${report.date}
Agent: ${report.agentName}
Region: ${report.region}

*Coverage*
Target Calls: ${report.targetCalls}
Achieved: ${report.achievedCalls}
Success: ${report.successfulCalls}

*Sales (Cartons)*
Target: ${report.targetCartons}
Achieved: ${report.achievedCartons}
% Achieved: ${report.percentageAchieved}%

*Sales (Value)*
Target: ${report.targetSalesKsh}
Actual: ${report.actualSalesKsh}

*Insights*
${report.marketInsights.join(", ")}

*Challenges*
${report.challenges.join(", ")}

*Plan for Tomorrow*
${report.planForTomorrow.join(", ")}`;

  const encodedText = encodeURIComponent(text);
  window.open(`https://wa.me/?text=${encodedText}`, '_blank');
};
