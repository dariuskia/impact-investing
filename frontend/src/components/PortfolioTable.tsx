"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useReducer, useState } from "react";

interface TableData {
  symbol: string;
  name: string;
  qty: number;
  description: string;
  price: number;
}

interface TableDataProps {
  data: TableData[];
}

const columnHelper = createColumnHelper<TableData>();

const columns = [
  columnHelper.accessor("symbol", {
    cell: (info) => info.getValue(),
    header: () => <span>Symbol</span>,
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("name", {
    id: "name",
    cell: (info) => <i>{info.getValue()}</i>,
    header: () => <span>Name</span>,
    footer: (info) => info.column.id,
  }),
  //   columnHelper.accessor("currentValue", {
  //     header: () => "Current Value",
  //     cell: (info) => info.renderValue(),
  //     footer: (info) => info.column.id,
  //   }),
  columnHelper.accessor("qty", {
    header: () => <span>Quantity</span>,
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("price", {
    header: () => <span>Quote</span>,
    footer: (info) => info.column.id,
  }),
];

function PortfolioTable({ data }: TableDataProps) {
  //   const [data, _setData] = useState(() => []);
  const rerender = useReducer(() => ({}), {})[1];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full p-2">
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="p-2 text-left">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PortfolioTable;
