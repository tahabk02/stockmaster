import PDFDocument from "pdfkit";
import QRCode from "qrcode";

export class PDFGenerator {
  static async generateOrderInvoice(order: any, tenant: any): Promise<Buffer> {
    const qrData = JSON.stringify({
      ref: order.receiptNumber,
      tenant: tenant.name,
      total: order.totalPrice,
      date: order.createdAt,
      hash: order._id.toString()
    });
    const qrBuffer = await QRCode.toBuffer(qrData, { margin: 1, scale: 2 });

    let logoBuffer: Buffer | null = null;
    if (tenant.logo) {
      try {
        const response = await fetch(tenant.logo);
        const arrayBuffer = await response.arrayBuffer();
        logoBuffer = Buffer.from(arrayBuffer);
      } catch (err) {
        console.error("Failed to fetch tenant logo for PDF:", err);
      }
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4',
        info: {
          Title: `Invoice-${order.receiptNumber}`,
          Author: 'StockMaster Global Protocol',
        }
      });
      
      let buffers: Buffer[] = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      // --- 1. CORPORATE HEADER NODES ---
      // Background Accent (Glassmorphism Simulation)
      doc.rect(0, 0, 600, 160).fill("#0f172a");
      
      if (logoBuffer) {
        try {
          doc.image(logoBuffer, 50, 40, { height: 40 });
          doc.fillColor("#ffffff")
             .font("Helvetica-Bold")
             .fontSize(22)
             .text(tenant.name.toUpperCase(), 100, 45);
        } catch (e) {
          doc.fillColor("#ffffff")
             .font("Helvetica-Bold")
             .fontSize(26)
             .text(tenant.name.toUpperCase(), 50, 45);
        }
      } else {
        doc.fillColor("#ffffff")
           .font("Helvetica-Bold")
           .fontSize(26)
           .text(tenant.name.toUpperCase(), 50, 45);
      }

      doc.fontSize(8)
         .font("Helvetica")
         .fillColor("#6366f1")
         .text("OPERATIONAL FINANCIAL PROTOCOL v5.0 // ULTRA-PRO", 50, 85, { characterSpacing: 2.5 });

      // Pulsing Node Indicator (Simulated)
      doc.circle(52, 95, 3).fill("#10b981");
      doc.fillColor("#94a3b8").fontSize(7).text("SIGNAL: ACTIVE", 60, 93);

      doc.fillColor("#94a3b8")
         .fontSize(9)
         .text(tenant.email || "", 350, 45, { align: "right" })
         .text(tenant.phone || "", 350, 60, { align: "right" })
         .text(tenant.address?.street || "", 350, 75, { align: "right" })
         .text(`${tenant.address?.city || ""}, ${tenant.address?.country || ""}`, 350, 90, { align: "right" });

      // --- 2. DOCUMENT METADATA HUD ---
      doc.fillColor("#0f172a")
         .font("Helvetica-Bold")
         .fontSize(40)
         .text("INVOICE.", 50, 190, { characterSpacing: -1.5 });

      // Status Stamp
      const isPaid = order.status === 'COMPLETED' || order.status === 'CONFIRMED';
      doc.save();
      doc.rotate(-15, { origin: [500, 200] });
      doc.rect(450, 180, 100, 30).fill(isPaid ? "#10b981" : "#f59e0b");
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(12).text(isPaid ? "PAID" : "UNPAID", 450, 190, { align: "center", width: 100 });
      doc.restore();

      const metadataTop = 260;
      this.generateMetadataNode(doc, 50, metadataTop, "REFERENCE ID", order.receiptNumber);
      this.generateMetadataNode(doc, 170, metadataTop, "TEMPORAL SIGNAL", new Date(order.createdAt).toLocaleDateString());
      this.generateMetadataNode(doc, 290, metadataTop, "PAYMENT LOGIC", order.paymentMethod);
      
      // Verification QR Code
      doc.image(qrBuffer, 460, 240, { width: 70 });
      doc.fillColor("#94a3b8").fontSize(6).text("FORENSIC AUTH", 460, 315, { width: 70, align: "center" });
      
      // Billing Entity Node
      doc.rect(50, 320, 500, 60).fill("#f8fafc");
      doc.fillColor("#64748b").fontSize(7).font("Helvetica-Bold").text("BILL TO ENTITY", 65, 335);
      doc.fillColor("#0f172a").fontSize(11).text(order.clientId?.name || "WALK-IN TERMINAL", 65, 350);
      doc.fillColor("#64748b").fontSize(8).font("Helvetica").text(`${order.clientId?.phone || "N/A"} | ${order.clientId?.address || "Universal Location"}`, 250, 352, { width: 280, align: "right" });

      // --- 3. ASSET LEDGER (TABLE) ---
      const tableTop = 410;
      doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(8);
      
      // Header Ribbon
      doc.rect(50, tableTop, 500, 25).fill("#f1f5f9");
      doc.fillColor("#475569");
      doc.text("ASSET DESCRIPTION", 65, tableTop + 9);
      doc.text("QTY", 300, tableTop + 9, { width: 50, align: "center" });
      doc.text("UNIT RATE", 360, tableTop + 9, { width: 80, align: "right" });
      doc.text("PAYLOAD", 450, tableTop + 9, { width: 85, align: "right" });

      let currentY = tableTop + 35;
      doc.font("Helvetica").fontSize(9).fillColor("#1e293b");

      order.items.forEach((item: any, idx: number) => {
        const itemTotal = item.quantity * item.price;
        doc.text(item.productId?.name || "Neural Asset", 65, currentY);
        doc.text(item.quantity.toString(), 300, currentY, { width: 50, align: "center" });
        doc.text(`${item.price.toLocaleString()} MAD`, 360, currentY, { width: 80, align: "right" });
        doc.text(`${itemTotal.toLocaleString()} MAD`, 450, currentY, { width: 85, align: "right" });
        
        doc.strokeColor("#f1f5f9").lineWidth(0.5).moveTo(50, currentY + 15).lineTo(550, currentY + 15).stroke();
        currentY += 25;
      });

      // --- 4. FINANCIAL SUMMARY GRID ---
      const summaryTop = Math.max(currentY + 20, 600);
      
      doc.rect(350, summaryTop, 200, 110).fill("#0f172a");
      doc.fillColor("#94a3b8").fontSize(8).text("SUBTOTAL REGISTRY", 370, summaryTop + 20);
      doc.fillColor("#ffffff").fontSize(10).text(`${order.subTotal.toLocaleString()} MAD`, 370, summaryTop + 20, { align: "right", width: 160 });
      
      doc.fillColor("#94a3b8").text("TAX PROTOCOL (2%)", 370, summaryTop + 45);
      doc.fillColor("#ffffff").text(`${order.taxAmount.toLocaleString()} MAD`, 370, summaryTop + 45, { align: "right", width: 160 });

      doc.rect(350, summaryTop + 75, 200, 35).fill("#6366f1");
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(10).text("TOTAL PAYLOAD", 370, summaryTop + 87);
      doc.fontSize(14).text(`${order.totalPrice.toLocaleString()} MAD`, 370, summaryTop + 85, { align: "right", width: 160 });

      // --- 5. LEGAL SIGNAL & FOOTER ---
      doc.fillColor("#94a3b8").font("Helvetica").fontSize(7);
      doc.text("VALIDATED BY STOCKMASTER NEURAL ENGINE", 50, 750);
      doc.text(`FORENSIC HASH: ${order._id}`, 50, 760);
      
      doc.fontSize(8).fillColor("#64748b").text("This document is a certified financial signal generated by the StockMaster Global Protocol. All asset transfers are logged in the immutable operational registry.", 50, 780, { align: "center", width: 500 });

      doc.end();
    });
  }

  static async generateExpenseReceipt(expense: any, tenant: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      let buffers: Buffer[] = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      doc.rect(0, 0, 600, 150).fill("#0f172a");
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(20).text(tenant.name.toUpperCase(), 50, 45);
      doc.fontSize(8).fillColor("#6366f1").text("FISCAL EXPENDITURE RECEIPT", 50, 75, { characterSpacing: 2 });

      doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(30).text("VOUCHER.", 50, 180);
      
      const top = 240;
      this.generateMetadataNode(doc, 50, top, "SIGNAL ID", expense._id.toString().slice(-8).toUpperCase());
      this.generateMetadataNode(doc, 180, top, "TEMPORAL DATE", new Date(expense.date).toLocaleDateString());
      this.generateMetadataNode(doc, 310, top, "CATEGORY NODE", expense.category);

      doc.rect(50, 320, 500, 100).fill("#f8fafc");
      doc.fillColor("#64748b").fontSize(8).text("TACTICAL DESCRIPTION", 65, 335);
      doc.fillColor("#0f172a").fontSize(12).text(expense.description, 65, 355, { width: 470 });

      doc.rect(350, 450, 200, 60).fill("#0f172a");
      doc.fillColor("#94a3b8").fontSize(8).text("TOTAL BURN", 370, 465);
      doc.fillColor("#ffffff").fontSize(18).text(`${expense.amount.toLocaleString()} MAD`, 370, 480, { align: "right", width: 160 });

      doc.fillColor("#94a3b8").fontSize(7).text("VALIDATED BY NEURAL ENGINE", 50, 750);
      doc.end();
    });
  }

  private static generateMetadataNode(doc: PDFKit.PDFDocument, x: number, y: number, label: string, val: string) {
    doc.fillColor("#64748b").fontSize(7).font("Helvetica-Bold").text(label, x, y);
    doc.fillColor("#0f172a").fontSize(9).font("Helvetica-Bold").text(val, x, y + 12);
  }
}
