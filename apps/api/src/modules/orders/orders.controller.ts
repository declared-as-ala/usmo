import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus, Req, Res, Res as ResDecor } from '@nestjs/common';
import { Response } from 'express';
import ExcelJS from 'exceljs';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Public: Create a new order (from checkout). Linked to the logged-in fan if a session is present.
  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  async create(@Body() dto: any, @Req() req: any) {
    return this.ordersService.create({ ...dto, userId: req.user?.sub });
  }

  // Public: Track an order by its order number
  @Get('track/:orderNumber')
  async track(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findOneByOrderNumber(orderNumber);
  }

  // Fan: List my own orders
  @UseGuards(JwtAuthGuard)
  @Get('my')
  async findMine(@Req() req: any) {
    return this.ordersService.findMine(req.user.sub);
  }

  // Admin only: List all orders with optional filters
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin', 'GESTIONNAIRE_COMMANDES')
  @Get()
  async findAll(@Query() query: any) {
    return this.ordersService.findAll(query);
  }

  // Admin only: Export orders to Excel
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin', 'GESTIONNAIRE_COMMANDES')
  @Get('export/excel')
  async exportExcel(@Query() query: any, @Res() res: Response) {
    const ExcelJS = require('exceljs');
    const orders = await this.ordersService.findAllForExport(query);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'US Monastir';
    workbook.created = new Date();

    // ── Sheet 1: Commandes ──
    const cmdSheet = workbook.addWorksheet('Commandes', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    cmdSheet.columns = [
      { header: 'Référence', key: 'orderNumber', width: 20 },
      { header: 'Date', key: 'date', width: 16 },
      { header: 'Nom client', key: 'customerName', width: 25 },
      { header: 'Téléphone', key: 'phone', width: 18 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Mode livraison', key: 'deliveryMethod', width: 16 },
      { header: 'Adresse / Point retrait', key: 'address', width: 35 },
      { header: 'Sous-total', key: 'subtotal', width: 14 },
      { header: 'Livraison', key: 'shipping', width: 12 },
      { header: 'Réduction', key: 'discount', width: 12 },
      { header: 'Total', key: 'total', width: 14 },
      { header: 'Statut', key: 'status', width: 16 },
      { header: 'Notes', key: 'notes', width: 30 },
    ];

    // Style headers
    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D63FF' } },
      alignment: { vertical: 'middle', horizontal: 'center' },
    };
    cmdSheet.getRow(1).eachCell((cell: any) => {
      cell.font = headerStyle.font;
      cell.fill = headerStyle.fill;
      cell.alignment = headerStyle.alignment;
    });
    cmdSheet.getRow(1).height = 24;
    cmdSheet.autoFilter = { from: 'A1', to: 'M1' };

    const STATUS_MAP: Record<string, string> = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      prepared: 'En préparation',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
      tentative: 'Tentative',
    };

    const DELIVERY_MAP: Record<string, string> = {
      delivery: 'Livraison',
      pickup: 'Retrait',
    };

    for (const order of orders) {
      cmdSheet.addRow({
        orderNumber: order.orderNumber,
        date: new Date(order.createdAt).toLocaleDateString('fr-TN'),
        customerName: order.customer?.name || '',
        phone: order.customer?.phone || '',
        email: order.customer?.email || '',
        deliveryMethod: DELIVERY_MAP[order.deliveryMethod] || order.deliveryMethod,
        address: order.customer?.address || '',
        subtotal: (order.subtotal / 1000).toFixed(3) + ' DT',
        shipping: (order.shippingCost / 1000).toFixed(3) + ' DT',
        discount: (order.discount / 1000).toFixed(3) + ' DT',
        total: (order.total / 1000).toFixed(3) + ' DT',
        status: STATUS_MAP[order.status] || order.status,
        notes: order.notes || '',
      });
    }

    // ── Sheet 2: Articles ──
    const artSheet = workbook.addWorksheet('Articles', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    artSheet.columns = [
      { header: 'Référence commande', key: 'orderNumber', width: 20 },
      { header: 'Date', key: 'date', width: 16 },
      { header: 'Nom client', key: 'customerName', width: 25 },
      { header: 'Produit', key: 'productName', width: 30 },
      { header: 'Taille', key: 'size', width: 10 },
      { header: 'Quantité', key: 'quantity', width: 10 },
      { header: 'Prix unitaire', key: 'unitPrice', width: 14 },
      { header: 'Total ligne', key: 'lineTotal', width: 14 },
      { header: 'Statut commande', key: 'status', width: 16 },
    ];

    artSheet.getRow(1).eachCell((cell: any) => {
      cell.font = headerStyle.font;
      cell.fill = headerStyle.fill;
      cell.alignment = headerStyle.alignment;
    });
    artSheet.getRow(1).height = 24;
    artSheet.autoFilter = { from: 'A1', to: 'I1' };

    for (const order of orders) {
      for (const item of order.items || []) {
        artSheet.addRow({
          orderNumber: order.orderNumber,
          date: new Date(order.createdAt).toLocaleDateString('fr-TN'),
          customerName: order.customer?.name || '',
          productName: item.name || '',
          size: item.size || '',
          quantity: item.quantity,
          unitPrice: ((item.price || 0) / 1000).toFixed(3) + ' DT',
          lineTotal: ((item.subtotal || 0) / 1000).toFixed(3) + ' DT',
          status: STATUS_MAP[order.status] || order.status,
        });
      }
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=commandes-usm-${new Date().toISOString().slice(0, 10)}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  }

  // Admin only: Export orders to PDF
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin', 'GESTIONNAIRE_COMMANDES')
  @Get('export/pdf')
  async exportPdf(@Query() query: any, @Res() res: Response) {
    const PDFDocument = require('pdfkit');
    const orders = await this.ordersService.findAllForExport(query);

    const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=commandes-usm-${new Date().toISOString().slice(0, 10)}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('US MONASTIR', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('BOUTIQUE OFFICIELLE', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(14).font('Helvetica-Bold').text('Rapport des commandes', { align: 'center' });
    doc.moveDown(0.5);

    // Period
    const fromDate = query.from || '—';
    const toDate = query.to || new Date().toISOString().slice(0, 10);
    doc.fontSize(9).font('Helvetica').text(`Période : ${fromDate} → ${toDate}`, { align: 'center' });
    doc.moveDown(1);

    // Summary
    const totalOrders = orders.length;
    const confirmed = orders.filter((o: any) => o.status === 'confirmed').length;
    const cancelled = orders.filter((o: any) => o.status === 'cancelled').length;
    const pending = orders.filter((o: any) => o.status === 'pending').length;
    const revenue = orders
      .filter((o: any) => o.status !== 'cancelled')
      .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

    doc.fontSize(10).font('Helvetica-Bold').text('Résumé');
    doc.moveDown(0.2);
    doc.fontSize(9).font('Helvetica');
    doc.text(`Nombre de commandes : ${totalOrders}`);
    doc.text(`Confirmées : ${confirmed}  |  En attente : ${pending}  |  Annulées : ${cancelled}`);
    doc.text(`Chiffre d'affaires : ${(revenue / 1000).toFixed(3)} DT`);
    doc.moveDown(1);

    // Table header
    const STATUS_MAP: Record<string, string> = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      prepared: 'En prép.',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
      tentative: 'Tentative',
    };

    const tableTop = doc.y;
    const colWidths = [60, 55, 90, 70, 130, 55, 55];
    const headers = ['Réf.', 'Date', 'Client', 'Téléphone', 'Articles', 'Total', 'Statut'];

    // Draw header row
    doc.fontSize(7).font('Helvetica-Bold');
    let x = 40;
    for (let i = 0; i < headers.length; i++) {
      doc.fillColor('#0D63FF').rect(x, tableTop, colWidths[i], 16).fill();
      doc.fillColor('#FFFFFF').text(headers[i], x + 3, tableTop + 4, { width: colWidths[i] - 6 });
      x += colWidths[i];
    }

    // Draw rows
    doc.font('Helvetica').fontSize(7);
    let y = tableTop + 16;
    const pageHeight = doc.page.height - 60;

    for (const order of orders) {
      if (y > pageHeight) {
        doc.addPage();
        y = 40;
      }

      const articles = (order.items || [])
        .map((it: any) => `${it.name} — ${it.size} × ${it.quantity}`)
        .join('\n');

      const rowHeight = 16;
      x = 40;
      doc.fillColor('#F8FAFC').rect(40, y, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill();
      doc.fillColor('#1E293B');

      const rowData = [
        order.orderNumber || '',
        new Date(order.createdAt).toLocaleDateString('fr-TN'),
        order.customer?.name || '',
        order.customer?.phone || '',
        articles,
        `${((order.total || 0) / 1000).toFixed(3)} DT`,
        STATUS_MAP[order.status] || order.status,
      ];

      for (let i = 0; i < rowData.length; i++) {
        doc.text(rowData[i], x + 3, y + 3, { width: colWidths[i] - 6, lineGap: 1 });
        x += colWidths[i];
      }
      y += rowHeight;
    }

    doc.end();
  }

  // Admin only: Update order status
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin', 'GESTIONNAIRE_COMMANDES')
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
  ) {
    return this.ordersService.updateStatus(id, body.status, body.notes);
  }

  // Admin only: Update order details (drawer edit)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin', 'GESTIONNAIRE_COMMANDES')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.ordersService.update(id, body);
  }

  // Admin only: Delete an order
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return this.ordersService.delete(id);
  }

  // Admin only: Get inventory movements
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin', 'GESTIONNAIRE_COMMANDES')
  @Get('inventory/movements')
  async getInventoryMovements(@Query('productId') productId?: string) {
    return this.ordersService.getInventoryMovements(productId);
  }
}
