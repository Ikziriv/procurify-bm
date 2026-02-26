import bwipjs from 'bwip-js';

/**
 * Generates a barcode as a Base64 encoded PNG string.
 * @param text The text to encode in the barcode (e.g., Procurement ID)
 * @param opts Options for barcode generation
 * @returns Promise<string> Base64 encoded PNG
 */
export async function generateBarcode(text: string, opts: { bcid?: string; height?: number; scale?: number } = {}): Promise<string> {
    const { bcid = 'code128', height = 10, scale = 3 } = opts;

    return new Promise((resolve, reject) => {
        bwipjs.toBuffer(
            {
                bcid, // Barcode type
                text, // Text to encode
                scale, // 3x scaling factor
                height, // Bar height, in millimeters
                includetext: true, // Show human-readable text
                textxalign: 'center' // Always good for readability
            },
            (err, png) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(`data:image/png;base64,${png.toString('base64')}`);
                }
            }
        );
    });
}

/**
 * Generates a QR code as a Base64 encoded PNG string.
 * @param text The text to encode in the QR code
 * @returns Promise<string> Base64 encoded PNG
 */
export async function generateQRCode(text: string): Promise<string> {
    return generateBarcode(text, { bcid: 'qrcode', height: 20, scale: 5 });
}
