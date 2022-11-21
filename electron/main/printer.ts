/* eslint-disable @typescript-eslint/no-explicit-any */

process.env.DIST_ELECTRON = join(__dirname, '../..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST_ELECTRON, '../public')


const ipp = require('ipp');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
import { join } from 'path'
import { app } from 'electron'

// const image = require('./1668475008502.png');
// const ttf = require('./jizihefengchisongzhenghei.ttf');

const basePath = process.env.PUBLIC;

const createPDF = async (data?: any, event?: any) => {
  const doc = new PDFDocument();
  console.log(`${process.env.PUBLIC}/output.pdf`)
  doc.pipe(fs.createWriteStream(`${process.env.PUBLIC}/output.pdf`));
  const ttf = await fs.readFileSync(`${process.env.PUBLIC}/jizihefengchisongzhenghei.ttf`);
  const image = await fs.readFileSync(`${process.env.PUBLIC}/1668475008502.png`);

  doc
    .font(ttf)
    .image(image, {
      fit: [460, 700],
      align: 'left',
      valign: 'left',
    })
    .fontSize(20)
    .text('收货: 舟山度量', 300, 240)
    .text('2022/11/8', 300, 280)
    .text('15:40', 300, 320)
    .text('晋AB0002', 300, 360)
    .text('万通精煤-洗煤厂', 300, 400)
    .text('490000', 300, 440)
    .text('18040', 300, 480)
    .text('30960', 300, 520)
    .text('发货：南阳矿极', 220, 570);

  await doc.end();

  return doc;
};

const printPDF = (ippurl: string, pdf: any): Promise<any> => {
  return new Promise((resolve) => {
    const printer = ipp.Printer(ippurl);
    const msg = {
      'operation-attributes-tag': {
        'requesting-user-name': 'User',
        'job-name': 'PrintBill',
        'document-format': 'application/pdf',
      },
      data: pdf,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    printer.execute('Print-Job', msg, (err: any, res: never) => {
      resolve([err, res]);
    });
  });
};

export default {
  basePath,
  createPDF,
  printPDF,
};
