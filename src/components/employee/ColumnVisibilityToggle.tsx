import React from "react";
import { useReactTable } from "@tanstack/react-table";
import type { Employee } from "./types";

export const ColumnVisibilityToggle = ({
    table,
}: {
    table: ReturnType<typeof useReactTable<Employee>>;
}) => {
    const allColumns = table.getAllLeafColumns().filter((col) => col.getCanHide());

    return (
        <div className="relative inline-block">
            <details className="group">
                <summary className="cursor-pointer bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
                    Hiển thị cột
                </summary>
                <div className="absolute z-10 mt-1 bg-white border rounded shadow-md p-2 w-48">
                    {allColumns.map((column) => (
                        <label key={column.id} className="flex items-center space-x-2 mb-1">
                            <input
                                type="checkbox"
                                checked={column.getIsVisible()}
                                onChange={() => column.toggleVisibility()}
                            />
                            <span>{String(column.columnDef.id === "select" ? "Action" : column.columnDef.header)}</span>
                        </label>
                    ))}
                </div>
            </details>
        </div>
    );
};
