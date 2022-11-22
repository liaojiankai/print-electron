import * as XLSX from 'xlsx';

function file2blob (file: File): Promise<Blob> {

  return new Promise(resolve => {
    let reader = new FileReader();
    
    let blob = null;
    reader.onload = (event) => {
      const { result } = event.target as any;
      if (typeof result === "object") {
        blob = new Blob([result])
      } else {
        blob = result
      }
      console.log(Object.prototype.toString.call(blob));
      resolve(blob)
    }
    reader.readAsArrayBuffer(file);
  })
}

function importSheet(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    
    fileReader.onload = event => {
      try {
        const { result } = event.target as any;
        const workbook = XLSX.read(result, { type: 'binary' });
        let data: any[] = [];
        for (const sheet in workbook.Sheets) {
          if (workbook.Sheets.hasOwnProperty(sheet)) {
            console.log('sheet: ', workbook.Sheets[sheet])
            data = data.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet], {header: 'A'}));
          }
        }
        resolve(data)
      } catch (err) {
        reject(err)
      }
    };
    fileReader.readAsBinaryString(file)
  })

}

function importExcel(file: Blob) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
   

    fileReader.onload = event => {
      try {
        const { result } = event.target as any;
        const workbook = XLSX.read(result, { type: 'binary' });
        let data: any[] = [];
        for (const sheet in workbook.Sheets) {
          if (workbook.Sheets.hasOwnProperty(sheet)) {
            console.log('workbook.Sheets[sheet]: ', workbook.Sheets[sheet])
            data = data.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
          }
        }
        resolve(data)
      } catch (err) {
        console.log(err)
        reject(err)
      }
    };
    fileReader.readAsBinaryString(file)
  })
}

function exportExcel({headers, data, fileName = 'example.xlsx'}: any) {
  const _headers = headers
    .map((item: { key: any; title: any; }, i: number) => ({ key: item.key, title: item.title, position: String.fromCharCode(65 + i) + 1}))
    .reduce((prev: any, next: { position: any; key: any; title: any; }) => ({ ...prev, [next.position]: { key: next.key, v: next.title }}), {});

  const _data = data
    .map((item: { [x: string]: any; }, i: number) => headers.map((key: { key: string | number; }, j: number) => ({ content: item[key.key], position: String.fromCharCode(65 + j) + (i + 2)})))
    .reduce((prev: string | any[], next: any) => prev.concat(next))
    .reduce((prev: any, next: { position: any; content: any; }) => ({ ...prev, [next.position]: { v: next.content }}), {});

  const output = { ..._headers, ..._data};
  const outputPos = Object.keys(output);
  const ref = `${outputPos[0]}:${outputPos[outputPos.length - 1]}`;

  const wb = {
    SheetNames: ['mySheet'],
    Sheets: {
      mySheet: {
        ...output,
        '!ref': ref,
        '!cols': [{ wpx: 45 }, { wpx: 100 }, { wpx: 200 }, { wpx: 80 }, { wpx: 150 }, { wpx: 100 }, { wpx: 300 }, { wpx: 300 }],
      },
    },
  };

  XLSX.writeFile(wb, fileName);
}

export default {
  file2blob,
  importExcel,
  exportExcel,
  importSheet
};
