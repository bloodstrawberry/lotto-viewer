'use client';

import { useEffect, useState } from 'react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

// ----------------------------------------------------------------------

const DisplayCellStyle = styled('div')({
  '& span': {
    backgroundColor: '#33ceff',
    position: 'relative',
    padding: '0.4rem 0.85rem',
    border: '1px solid transparent',
    borderRadius: '0.35rem',
  },
});

const data = [
  ['', '2017', '2018', '2019', '2020', '2021', '2022'],
  ['Tesla', 10, 5, 5, 10, 14, 5],
  ['Nissan', 15, 2, 7, 11, 13, 4],
  ['Toyota', 11, 1, 10, 12, 12, 3],
  ['Honda', 5, 3, 7, 13, 11, 4],
  ['Mazda', 4, 7, 5, 14, 10, 4],
];

const MY_OPTIONS = 'MY_OPTIONS';
const COMMENTS_KEY = 'COMMENTS_KEY';
const MERGE_CELLS_KEY = 'MERGE_CELLS_KEY';
const CELL_STYLE_KEY = 'CELL_STYLE_KEY';

// ----------------------------------------------------------------------

type MyOptions = {
  trueFalseOptions: Record<string, boolean>;
  numberOptions: Record<string, number>;
  cellInfo: {
    colWidths: number | number[];
    rowHeights: number | number[];
  };
};

type CustomHandsontableProps = {
  myOptions: MyOptions;
};

export function CustomHandsontable({ myOptions }: CustomHandsontableProps) {
  const [myHandsOnTable, setMyHandsOnTable] = useState<Handsontable | null>(null);
  const [displayCellInfo, setDisplayCellInfo] = useState('');
  const [selectedCell, setSelectedCell] = useState([0, 0]);

  const getComments = () => {
    const comments = localStorage.getItem(COMMENTS_KEY);
    if (comments === null) return [];
    return JSON.parse(comments);
  };

  const getMergeCells = () => {
    const mergeCells = localStorage.getItem(MERGE_CELLS_KEY);
    if (mergeCells === null) return [];
    return JSON.parse(mergeCells);
  };

  const setColWidths = (table: Handsontable, setOptions: MyOptions) => {
    const colLength = table.getData()[0].length;
    const widths: number[] = [];

    for (let i = 0; i < colLength; i++) {
      widths.push(table.getColWidth(i) || 60);
    }

    setOptions.cellInfo.colWidths = widths;
    localStorage.setItem(MY_OPTIONS, JSON.stringify(setOptions));
  };

  const setRowHeights = (table: Handsontable, setOptions: MyOptions) => {
    const rowLength = table.getData().length;
    const heights: number[] = [];

    for (let i = 0; i < rowLength; i++) {
      heights.push(table.getRowHeight(i) || 25);
    }

    setOptions.cellInfo.rowHeights = heights;
    localStorage.setItem(MY_OPTIONS, JSON.stringify(setOptions));
  };

  useEffect(() => {
    const container = document.getElementById('hot-app');
    if (!container) return;

    container.innerHTML = '';

    const cellSelected = function (this: Handsontable) {
      const selectedLast = this.getSelectedLast();
      if (!selectedLast || selectedLast[0] < 0 || selectedLast[1] < 0) return;

      const value = this.getValue() || '';
      setDisplayCellInfo(String(value));
      setSelectedCell([selectedLast[0], selectedLast[1]]);
    };

    const localCellStyle = localStorage.getItem(CELL_STYLE_KEY)
      ? JSON.parse(localStorage.getItem(CELL_STYLE_KEY)!)
      : null;

    const options: Handsontable.GridSettings = {
      data,
      colHeaders: true,
      rowHeaders: true,
      wordWrap: false,
      manualColumnResize: true,
      manualRowResize: true,
      manualColumnMove: true,
      manualRowMove: true,
      autoWrapCol: true,
      autoWrapRow: true,
      dragToScroll: true,
      persistentState: false,
      outsideClickDeselects: false,
      readOnly: false,
      enterBeginsEditing: true,
      copyPaste: true,
      undo: true,
      trimWhitespace: false,
      contextMenu: true,
      comments: {
        displayDelay: 1000,
      },
      manualColumnFreeze: true,
      className: 'htMiddle htCenter',
      width: 1000,
      height: 600,
      startCols: 5,
      startRows: 3,
      afterSelection: cellSelected,
      cell: getComments(),
      afterSetCellMeta: (row, col, key, obj) => {
        if (key === 'comment') {
          let temp = getComments().filter(
            (item: any) => !(item.row === row && item.col === col)
          );
          if (obj !== undefined) {
            temp.push({ row, col, comment: { value: obj.value } });
          }
          localStorage.setItem(COMMENTS_KEY, JSON.stringify([...temp]));
        }
      },
      mergeCells: getMergeCells(),
      afterUnmergeCells: (cellRange) => {
        const temp = getMergeCells().filter(
          (item: any) =>
            !(item.row === cellRange.from.row && item.col === cellRange.from.col)
        );
        localStorage.setItem(MERGE_CELLS_KEY, JSON.stringify([...temp]));
      },
      cells: function (row, col) {
        if (localCellStyle === null) return {};

        const cellProperties: any = {};

        cellProperties.className =
          localCellStyle[row]?.[col]?.className || 'htCenter htMiddle';

        cellProperties.renderer = function (
          instance: any,
          td: HTMLTableCellElement,
          row: number,
          col: number,
          prop: string | number,
          value: any,
          cellProperties: any
        ) {
          Handsontable.renderers.TextRenderer.apply(this, arguments as any);
          if (localCellStyle[row]?.[col]?.style) {
            td.style.fontWeight = localCellStyle[row][col].style.fontWeight || '';
            td.style.fontStyle = localCellStyle[row][col].style.fontStyle || '';
            td.style.textDecoration = localCellStyle[row][col].style.textDecoration || '';
            td.style.color = localCellStyle[row][col].style.color || '#000000';
            td.style.backgroundColor =
              localCellStyle[row][col].style.backgroundColor || '#FFFFFF';
          }
        };

        return cellProperties;
      },
      licenseKey: 'non-commercial-and-evaluation',
      ...myOptions.trueFalseOptions,
      ...myOptions.numberOptions,
      ...myOptions.cellInfo,
    };

    const myTable = new Handsontable(container, options);

    myTable.addHook('afterMergeCells', function (cellRange, mergeParent) {
      let temp = getMergeCells();
      temp.push(mergeParent);
      temp = temp.filter((item: any) => myTable.getCellMeta(item.row, item.col).spanned === true);
      localStorage.setItem(MERGE_CELLS_KEY, JSON.stringify([...temp]));
    });

    myTable.addHook('afterColumnResize', function (col, width) {
      let localOptions = localStorage.getItem(MY_OPTIONS);

      if (localOptions === null) {
        setColWidths(myTable, myOptions);
        return;
      }

      const parsedOptions = JSON.parse(localOptions);
      if (!Array.isArray(parsedOptions.cellInfo.colWidths)) {
        setColWidths(myTable, parsedOptions);
        return;
      }

      parsedOptions.cellInfo.colWidths[col] = width;
      localStorage.setItem(MY_OPTIONS, JSON.stringify(parsedOptions));
    });

    myTable.addHook('afterRowResize', function (row, height) {
      let localOptions = localStorage.getItem(MY_OPTIONS);

      if (localOptions === null) {
        setRowHeights(myTable, myOptions);
        return;
      }

      const parsedOptions = JSON.parse(localOptions);
      if (!Array.isArray(parsedOptions.cellInfo.rowHeights)) {
        setRowHeights(myTable, parsedOptions);
        return;
      }

      parsedOptions.cellInfo.rowHeights[row] = height;
      localStorage.setItem(MY_OPTIONS, JSON.stringify(parsedOptions));
    });

    myTable.render();
    setMyHandsOnTable(myTable);

    return () => {
      myTable.destroy();
    };
  }, [myOptions]);

  const changeFormat = (value: any) => {
    let val = value || '';
    val = val.toString();
    if (val.includes('"')) return '"' + val.replace(/"/g, '""') + '"';
    if (val.includes(',') || val.includes('\n')) return '"' + val + '"';
    return val;
  };

  const downloadCSV = () => {
    if (!myHandsOnTable) return;

    const tableData = myHandsOnTable.getData();

    let csv = '';
    for (let r = 0; r < tableData.length; r++) {
      const row = tableData[r].map(changeFormat).join(',');
      csv += row + '\n';
    }

    const fileDown = 'data:csv;charset=utf-8,' + csv;
    const encodedUri = encodeURI(fileDown);
    const link = document.createElement('a');

    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'handsontable.csv');

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box>
      <Box sx={{ m: 2 }}>
        <Button sx={{ m: 2 }} variant="outlined" color="primary" onClick={downloadCSV}>
          Download CSV
        </Button>
        <DisplayCellStyle>
          <span>{displayCellInfo}</span>
        </DisplayCellStyle>
      </Box>
      <div id="hot-app" style={{ marginTop: '13px' }} />
    </Box>
  );
}
