(function(){
  'use strict';

  const colToIndex = letters => {
    let result = 0;
    for (const ch of String(letters || '').toUpperCase()) result = result * 26 + ch.charCodeAt(0) - 64;
    return result - 1;
  };
  const refParts = ref => {
    const match = String(ref || '').match(/^([A-Z]+)(\d+)$/i);
    return match ? { col: colToIndex(match[1]), row: Number(match[2]) - 1 } : null;
  };
  const xml = text => new DOMParser().parseFromString(text, 'application/xml');
  const textContent = node => node ? node.textContent || '' : '';
  const normalizeCellValue = value => typeof value === 'string' ? value.replace(/\r\n/g, '\n').trim() : value;


  function parseCsv(text) {
    const rows = [];
    let row = [], field = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (quoted) {
        if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
        else if (ch === '"') quoted = false;
        else field += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ',') { row.push(normalizeCellValue(field)); field = ''; }
      else if (ch === '\n') {
        row.push(normalizeCellValue(field.replace(/\r$/, '')));
        rows.push(row); row = []; field = '';
      } else field += ch;
    }
    row.push(normalizeCellValue(field.replace(/\r$/, '')));
    if (row.some(value => String(value ?? '').trim() !== '')) rows.push(row);
    return rows;
  }

  async function readWorkbook(file) {
    const name = String(file?.name || '').toLowerCase();
    if (name.endsWith('.csv') || String(file?.type || '').includes('csv')) {
      const rows = parseCsv(await file.text());
      if (!rows.length) throw new Error('The CSV file is empty.');
      return { sheets: [{ name: file.name.replace(/\.csv$/i, '') || 'CSV Import', rows }] };
    }
    if (!name.endsWith('.xlsx')) throw new Error('Unsupported file type. Please select an .xlsx or .csv file.');
    if (!window.JSZip) throw new Error('Excel reader could not load. Keep jszip.min.js beside the application files.');
    let zip;
    try { zip = await JSZip.loadAsync(await file.arrayBuffer()); }
    catch (error) { throw new Error('This file could not be opened as an Excel workbook. It may be damaged, password-protected, or an older .xls file. Save it as .xlsx and try again.'); }
    const getText = async path => {
      const entry = zip.file(path);
      if (!entry) return '';
      return entry.async('text');
    };

    const sharedXml = await getText('xl/sharedStrings.xml');
    const sharedStrings = [];
    if (sharedXml) {
      const doc = xml(sharedXml);
      [...doc.getElementsByTagName('si')].forEach(si => {
        sharedStrings.push([...si.getElementsByTagName('t')].map(textContent).join(''));
      });
    }

    const workbookText = await getText('xl/workbook.xml');
    if (!workbookText) throw new Error('The Excel workbook is missing its workbook definition. Save a fresh copy as .xlsx and try again.');
    const workbookDoc = xml(workbookText);
    const relDoc = xml(await getText('xl/_rels/workbook.xml.rels'));
    const relMap = {};
    [...relDoc.getElementsByTagName('Relationship')].forEach(rel => {
      relMap[rel.getAttribute('Id')] = rel.getAttribute('Target');
    });

    const sheets = [];
    for (const sheet of [...workbookDoc.getElementsByTagName('sheet')]) {
      const name = sheet.getAttribute('name') || 'Sheet';
      const relId = sheet.getAttribute('r:id') || sheet.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
      let target = relMap[relId] || '';
      target = target.replace(/^\//, '');
      if (!target.startsWith('xl/')) target = `xl/${target.replace(/^\.\//, '')}`;
      const sheetText = await getText(target);
      if (!sheetText) continue;
      const sheetDoc = xml(sheetText);
      const cells = new Map();
      let maxRow = -1, maxCol = -1;

      [...sheetDoc.getElementsByTagName('c')].forEach(cell => {
        const parts = refParts(cell.getAttribute('r'));
        if (!parts) return;
        const type = cell.getAttribute('t');
        const vNode = cell.getElementsByTagName('v')[0];
        const inlineNode = cell.getElementsByTagName('is')[0];
        let value = '';
        if (type === 's') value = sharedStrings[Number(textContent(vNode))] ?? '';
        else if (type === 'inlineStr') value = [...(inlineNode?.getElementsByTagName('t') || [])].map(textContent).join('');
        else if (type === 'b') value = textContent(vNode) === '1';
        else if (type === 'str') value = textContent(vNode);
        else {
          const raw = textContent(vNode);
          value = raw === '' ? '' : (Number.isFinite(Number(raw)) ? Number(raw) : raw);
        }
        cells.set(`${parts.row}:${parts.col}`, normalizeCellValue(value));
        maxRow = Math.max(maxRow, parts.row);
        maxCol = Math.max(maxCol, parts.col);
      });

      [...sheetDoc.getElementsByTagName('mergeCell')].forEach(merge => {
        const [startRef, endRef] = String(merge.getAttribute('ref') || '').split(':');
        const start = refParts(startRef), end = refParts(endRef || startRef);
        if (!start || !end) return;
        const value = cells.get(`${start.row}:${start.col}`) ?? '';
        for (let r = start.row; r <= end.row; r++) {
          for (let c = start.col; c <= end.col; c++) {
            if (!cells.has(`${r}:${c}`)) cells.set(`${r}:${c}`, value);
          }
        }
      });

      const rows = [];
      for (let r = 0; r <= maxRow; r++) {
        const row = [];
        for (let c = 0; c <= maxCol; c++) row.push(cells.get(`${r}:${c}`) ?? '');
        rows.push(row);
      }
      sheets.push({ name, rows });
    }
    if (!sheets.length) throw new Error('No readable worksheets were found in this Excel file.');
    return { sheets };
  }

  window.CBITXLSX = { readWorkbook, parseCsv };
})();
