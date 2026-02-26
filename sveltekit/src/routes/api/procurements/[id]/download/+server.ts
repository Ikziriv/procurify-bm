import { jsPDF } from 'jspdf';
import { generateBarcode } from '$lib/server/utils/barcode-utils';
import { ActivityService } from '$lib/server/services/activity-service';
import { procurements } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals, request }) => {
    const { id } = params;
    const user = locals.user;
    const db = locals.db;

    if (!user) {
        throw error(401, 'Unauthorized');
    }

    // Fetch procurement details
    const procurement = await db.query.procurements.findFirst({
        where: eq(procurements.id, id),
        with: {
            items: true,
            rules: true
        }
    });

    if (!procurement) {
        throw error(404, 'Procurement not found');
    }

    try {
        // Generate Barcode
        const barcodeBase64 = await generateBarcode(procurement.id);

        // Create PDF
        const doc = new jsPDF();

        // Header Styling
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('PROCURIFY-BM', 20, 25);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('OFFICIAL PROCUREMENT TRACKING DOCUMENT', 20, 32);

        // Barcode Section
        doc.setTextColor(0, 0, 0);
        doc.setFillColor(248, 250, 252); // slate-50
        doc.roundedRect(140, 45, 60, 35, 3, 3, 'F');

        try {
            // addImage(imageData, format, x, y, width, height, alias, compression, rotation)
            doc.addImage(barcodeBase64, 'PNG', 145, 50, 50, 15);
        } catch (e) {
            console.error('Failed to add barcode to PDF:', e);
        }

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(procurement.id, 170, 70, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.text('TRACKING ID', 170, 74, { align: 'center' });

        // Content
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(procurement.title, 20, 60);

        // Metadata Table-like structure
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.line(20, 85, 190, 85);

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text('STATUS', 20, 95);
        doc.text('BUDGET', 70, 95);
        doc.text('DEADLINE', 130, 95);

        doc.setTextColor(15, 23, 42); // slate-900
        doc.setFont('helvetica', 'bold');
        doc.text(procurement.status, 20, 102);
        doc.text(procurement.budget || 'N/A', 70, 102);
        doc.text(new Date(procurement.deadline).toLocaleDateString(), 130, 102);

        doc.line(20, 110, 190, 110);

        // Description
        doc.setFont('helvetica', 'bold');
        doc.text('PROJECT OVERVIEW', 20, 125);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const splitDescription = doc.splitTextToSize(procurement.description || 'No description provided.', 170);
        doc.text(splitDescription, 20, 132);

        // Items Table
        let currentY = 132 + (splitDescription.length * 5) + 15;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('LINE ITEM DETAILS', 20, currentY);
        currentY += 8;

        // Table Header
        doc.setFillColor(241, 245, 249); // slate-100
        doc.rect(20, currentY, 170, 8, 'F');
        doc.setFontSize(8);
        doc.text('ITEM NAME', 25, currentY + 5);
        doc.text('QTY', 120, currentY + 5);
        doc.text('UNIT', 140, currentY + 5);
        doc.text('ESTIMATED PRICE', 160, currentY + 5);
        currentY += 12;

        doc.setFont('helvetica', 'normal');
        procurement.items.forEach((item) => {
            if (currentY > 270) {
                doc.addPage();
                currentY = 20;
            }
            doc.text(item.name.substring(0, 50), 25, currentY);
            doc.text(item.quantity.toString(), 120, currentY);
            doc.text(item.unit, 140, currentY);
            doc.text(item.estimatedPrice || 'N/A', 160, currentY);
            currentY += 6;
        });

        // Footer with Timestamp
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text(`Generated on ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
        }

        // Output PDF as Buffer
        const pdfBuffer = doc.output('arraybuffer');

        // Log Download Activity
        await ActivityService.logRequest(request, {
            userId: user.id,
            action: 'PROCUREMENT_DOWNLOAD',
            entityType: 'PROCUREMENT',
            entityId: procurement.id,
            metadata: { title: procurement.title }
        });

        return new Response(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="procurement_${procurement.id}.pdf"`
            }
        });
    } catch (err: any) {
        console.error('PDF Generation Error:', err);
        throw error(500, `Failed to generate PDF: ${err.message}`);
    }
};
