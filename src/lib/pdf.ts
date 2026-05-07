import PDFDocument from 'pdfkit';

export async function createInvoicePDF(sale: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A5' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fillColor('#ff6b00').fontSize(20).text('LAÇIN SATIŞ', { align: 'center' });
    doc.fillColor('#444444').fontSize(10).text('Rəsmi Satış Fakturası', { align: 'center' });
    doc.moveDown();

    // Sale Info
    doc.fillColor('#000000').fontSize(12).text(`Faktura No: #${sale.id}`, { align: 'right' });
    doc.fontSize(10).text(`Tarix: ${new Date(sale.created_at).toLocaleString()}`, { align: 'right' });
    doc.moveDown();

    // Customer Info
    doc.fontSize(12).font('Helvetica-Bold').text('Müştəri Məlumatı:');
    doc.fontSize(10).font('Helvetica').text(`Ad: ${sale.customer_name || 'Naməlum'}`);
    doc.text(`Telefon: ${sale.customer_phone || 'Naməlum'}`);
    doc.moveDown();

    // Table Header
    const tableTop = 200;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Məhsul', 50, tableTop);
    doc.text('Say', 200, tableTop);
    doc.text('Qiymət', 250, tableTop);
    doc.text('Cəmi', 300, tableTop);
    doc.moveTo(50, tableTop + 15).lineTo(350, tableTop + 15).stroke();

    // Items
    let y = tableTop + 25;
    doc.font('Helvetica');
    const items = Array.isArray(sale.items) ? sale.items : [];
    items.forEach((item: any) => {
      doc.text(item.name || 'Məhsul', 50, y);
      doc.text((item.quantity || 0).toString(), 200, y);
      doc.text(`${(item.price || 0).toFixed(2)}`, 250, y);
      doc.text(`${((item.price || 0) * (item.quantity || 0)).toFixed(2)}`, 300, y);
      y += 20;
    });

    if (sale.gift_quantity > 0) {
      doc.fillColor('green').text(`Hədiyyə: ${sale.gift_quantity} ədəd`, 50, y);
      y += 20;
    }

    // Total
    doc.moveTo(50, y + 10).lineTo(350, y + 10).stroke();
    y += 20;
    doc.fillColor('#ff6b00').fontSize(14).font('Helvetica-Bold');
    doc.text('YEKUN MƏBLƏĞ:', 50, y);
    doc.text(`${sale.total_amount.toFixed(2)} AZN`, 250, y);

    // Footer
    doc.fillColor('#aaaaaa').fontSize(8).font('Helvetica-Oblique').text('Bu sənəd sistem tərəfindən avtomatik yaradılmışdır.', 50, 530, { align: 'center' });

    doc.end();
  });
}
