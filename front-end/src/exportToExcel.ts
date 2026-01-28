// Utility to export JSON data to Excel using SheetJS
import * as XLSX from 'xlsx';

export function exportToExcel(data: any[], fileName: string = 'training_data.xlsx') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Trainings');
  XLSX.writeFile(workbook, fileName);
}
