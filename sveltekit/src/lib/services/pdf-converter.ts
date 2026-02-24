import { jsPDF } from 'jspdf';

export interface AuditEntry {
    status: string;
    changedAt: string;
    changedBy: string;
    remark?: string;
}

export interface SubmissionData {
    id: string;
    companyName: string;
    companyDescription: string;
    submittedAt: string;
    status: string;
    procurementTitle: string;
    budget: string;
    vendorName: string;
    vendorEmail: string;
    history?: AuditEntry[];
}

/**
 * Service to handle professional PDF generation for submission audits.
 * Follows enterprise design patterns with clean separation of layout and data.
 */
export class PdfConverterService {
    private doc: jsPDF;
    private margin = 20;
    private pageHeight: number;
    private pageWidth: number;
    private currentY = 0;
    private brandColor: [number, number, number] = [79, 70, 229]; // Indigo 600
    private slate900: [number, number, number] = [15, 23, 42];
    private slate600: [number, number, number] = [71, 85, 105];
    private slate400: [number, number, number] = [148, 163, 184];

    constructor() {
        this.doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });
        this.pageHeight = this.doc.internal.pageSize.height;
        this.pageWidth = this.doc.internal.pageSize.width;
    }

    public async generateAuditPdf(data: SubmissionData): Promise<void> {
        this.drawHeader();
        this.currentY = 55;

        // 1. Summary Information in a Two-Column Layout
        this.drawSectionHeader('SUBMISSION OVERVIEW');

        const leftCol = this.margin;
        const rightCol = this.pageWidth / 2 + 5;

        // Left Column
        this.drawMetadataItem('Submission ID', data.id, leftCol);
        this.drawMetadataItem('Submitted Date', data.submittedAt, leftCol);
        this.drawMetadataItem('Current Status', data.status, leftCol, true);

        const tempY = this.currentY;
        this.currentY = 65; // Reset Y for right column

        // Right Column
        this.drawMetadataItem('Tender Title', data.procurementTitle, rightCol);
        this.drawMetadataItem('Budget Allocation', data.budget, rightCol);
        this.drawMetadataItem('Entity Name', data.companyName, rightCol);

        this.currentY = Math.max(tempY, this.currentY) + 10;

        // 2. Vendor Details
        this.drawSectionHeader('VERIFIED VENDOR DETAILS');
        this.drawMetadataItem('Primary Contact', data.vendorName, leftCol);
        this.drawMetadataItem('Official Email', data.vendorEmail, leftCol);
        this.currentY += 10;

        // 3. Proposal Description
        this.drawSectionHeader('EXECUTIVE SUMMARY');
        this.addWrappedText(data.companyDescription || 'No description provided.', 10, this.slate600);
        this.currentY += 15;

        // 4. Audit Trail (Timeline style)
        if (data.history && data.history.length > 0) {
            this.drawSectionHeader('CHRONOLOGICAL AUDIT TRAIL');
            this.currentY += 5;

            for (let i = 0; i < data.history.length; i++) {
                const entry = data.history[i];
                const isLast = i === data.history.length - 1;
                this.drawTimelineEntry(entry, isLast);
            }
        }

        this.drawFooter();

        this.doc.save(`Audit_${data.companyName.replace(/\s+/g, '_')}_${data.id.substring(0, 8)}.pdf`);
    }

    private drawHeader() {
        // Branding Header
        this.doc.setFillColor(...this.brandColor);
        this.doc.rect(0, 0, this.pageWidth, 40, 'F');

        // Logo / Title
        this.doc.setFontSize(24);
        this.doc.setTextColor(255, 255, 255);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('PROCURIFY-BM', this.margin, 25);

        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text('ENTERPRISE AUDIT & COMPLIANCE REPORT', this.margin, 32);

        // Meta Info (Right aligned)
        this.doc.setFontSize(8);
        this.doc.setTextColor(215, 215, 215);
        const dateStr = `Report Generated: ${new Date().toLocaleString('en-GB')}`;
        this.doc.text(dateStr, this.pageWidth - this.margin - this.doc.getTextWidth(dateStr), 25);
    }

    private drawSectionHeader(title: string) {
        this.checkPageOverflow(15);
        this.doc.setFontSize(12);
        this.doc.setTextColor(...this.brandColor);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(title, this.margin, this.currentY);
        this.currentY += 2;

        this.doc.setDrawColor(241, 245, 249);
        this.doc.setLineWidth(0.5);
        this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
        this.currentY += 10;
    }

    private drawMetadataItem(label: string, value: string, x: number, highlight = false) {
        this.checkPageOverflow(10);
        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...this.slate400);
        this.doc.text(label.toUpperCase(), x, this.currentY);

        this.currentY += 5;
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', highlight ? 'bold' : 'normal');
        this.doc.setTextColor(...(highlight ? this.brandColor : this.slate900));

        const maxWidth = (this.pageWidth / 2) - this.margin - 5;
        const text = this.doc.splitTextToSize(value || '-', maxWidth);
        this.doc.text(text, x, this.currentY);

        this.currentY += (text.length * 5) + 2;
    }

    private addWrappedText(text: string, fontSize: number, color: [number, number, number]) {
        this.doc.setFontSize(fontSize);
        this.doc.setTextColor(...color);
        this.doc.setFont('helvetica', 'normal');
        const lines = this.doc.splitTextToSize(text, this.pageWidth - (this.margin * 2));

        for (const line of lines) {
            this.checkPageOverflow(6);
            this.doc.text(line, this.margin, this.currentY);
            this.currentY += 6;
        }
    }

    private drawTimelineEntry(entry: AuditEntry, isLast: boolean) {
        this.checkPageOverflow(25);

        const timelineX = this.margin + 5;
        const contentX = timelineX + 15;

        // Vertical Line
        if (!isLast) {
            this.doc.setDrawColor(...this.slate400);
            this.doc.setLineWidth(0.2);
            this.doc.line(timelineX, this.currentY + 2, timelineX, this.currentY + 20);
        }

        // Dot
        this.doc.setFillColor(...this.brandColor);
        this.doc.circle(timelineX, this.currentY, 1.5, 'F');

        // Content
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...this.slate900);
        this.doc.text(entry.status, contentX, this.currentY);

        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(...this.slate400);
        this.doc.text(entry.changedAt, this.pageWidth - this.margin - 35, this.currentY);

        this.currentY += 5;
        this.doc.setFontSize(9);
        this.doc.setTextColor(...this.slate600);
        this.doc.text(`Action by: ${entry.changedBy}`, contentX, this.currentY);

        if (entry.remark) {
            this.currentY += 5;
            this.doc.setFontSize(8);
            this.doc.setFont('helvetica', 'italic');
            this.doc.text(`"${entry.remark}"`, contentX, this.currentY);
        }

        this.currentY += 12;
    }

    private drawFooter() {
        const pageCount = (this.doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            this.doc.setPage(i);
            this.doc.setFontSize(8);
            this.doc.setTextColor(...this.slate400);

            // Divider
            this.doc.setDrawColor(241, 245, 249);
            this.doc.line(this.margin, this.pageHeight - 15, this.pageWidth - this.margin, this.pageHeight - 15);

            // Text
            this.doc.text(`© 2026 Procurify-BM Indonesia. All rights reserved.`, this.margin, this.pageHeight - 10);
            const pageStr = `Page ${i} of ${pageCount}`;
            this.doc.text(pageStr, this.pageWidth - this.margin - this.doc.getTextWidth(pageStr), this.pageHeight - 10);
        }
    }

    private checkPageOverflow(estimatedHeight: number) {
        if (this.currentY + estimatedHeight > this.pageHeight - 25) {
            this.doc.addPage();
            this.currentY = this.margin + 10;

            // Subtle page header continuation
            this.doc.setFontSize(7);
            this.doc.setTextColor(...this.slate400);
            this.doc.text('AUDIT REPORT CONTINUATION', this.margin, this.margin);
            this.doc.setDrawColor(241, 245, 249);
            this.doc.line(this.margin, this.margin + 2, this.pageWidth - this.margin, this.margin + 2);
            this.currentY += 10;
        }
    }
}

