import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

export type ReportColumn = {
  key: string;
  label: string;
};

export type ReportOptions = {
  title?: string;
  subtitle?: string;
  filename?: string;
  brandName?: string;
};

const formatDate = () => new Date().toISOString().slice(0, 10);

const safeFileName = (value: string