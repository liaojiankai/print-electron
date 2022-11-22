/* eslint-disable @typescript-eslint/no-explicit-any */

process.env.DIST_ELECTRON = join(__dirname, '../..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST_ELECTRON, '../public')

// const ipp = require('ipp');
// const PDFDocument = require('pdfkit');
import { join } from 'path'
import { app } from 'electron'
// import * as ipp from 'ipp';
import * as fs from 'fs';
import PDFDocument from '@foliojs-fork/pdfkit';
// import {default as PDFDocument} from 'pdfkit';

// const image = require('./1668475008502.png');
// const ttf = require('./jizihefengchisongzhenghei.ttf');
const basePath = process.env.PUBLIC;

const createPDF = async (data?: any) => {
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
    .text(`收货: ${data.serialNo}`, 300, 240)
    .text(`${data.A}`, 300, 280)
    .text(``, 300, 320)
    .text(`${data.B}`, 300, 360)
    .text(`${data.gargoNo}`, 300, 400)
    .text(`${data.C}`, 300, 440)
    .text(`${data.D}`, 300, 480)
    .text(`${data.E}`, 300, 520)
    .text(`${data.remark}`, 220, 570);

  await doc.end();

  return doc;
};

// const printPDF = (ippurl: string, pdf: any): Promise<any> => {
//   return new Promise((resolve) => {
//     const printer = ipp.Printer(ippurl);
//     const msg = {
//       'operation-attributes-tag': {
//         'requesting-user-name': 'User',
//         'job-name': 'PrintBill',
//         'document-format': 'application/pdf',
//       },
//       data: pdf,
//     };

//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     printer.execute('Print-Job', msg, (err: any, res: never) => {
//       console.log('res: ', res)
//       resolve([err, res]);
//     });
//   });
// };

export default {
  basePath,
  createPDF,
  // printPDF,
};
