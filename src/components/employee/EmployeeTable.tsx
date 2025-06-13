import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getFilteredRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    getGroupedRowModel,
    getExpandedRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFacetedMinMaxValues,
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    type ColumnOrderState,
    type ColumnPinningState,
    type RowSelectionState,
} from "@tanstack/react-table";

import { ColumnVisibilityToggle } from "./ColumnVisibilityToggle";
import { AddEmployeeDialog } from "./AddEmployeeDialog";
import type { Employee } from "./types";

export const EmployeeTable = () => {
    const [data, setData] = useState<Employee[]>(() => {
        const stored = localStorage.getItem("employeeData");
        return stored ? JSON.parse(stored) : [];
    });

    const savedState = useMemo(() => {
        try {
            const stored = localStorage.getItem("tableState");
            return stored ? JSON.parse(stored) : {};
        } catch {
            return {};
        }
    }, []);

    const [globalFilter, setGlobalFilter] = useState(savedState.globalFilter ?? "");
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(savedState.columnFilters ?? []);
    const [sorting, setSorting] = useState<SortingState>(savedState.sorting ?? []);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(savedState.columnVisibility ?? {});
    const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(savedState.columnOrder ?? []);
    const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(savedState.columnPinning ?? {});
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const dragCol = useRef<string | null>(null);

    const handleAddEmployee = (employee: Employee) => {
        const updated = [...data, employee];
        setData(updated);
        localStorage.setItem("employeeData", JSON.stringify(updated));
    };

    const columns = useMemo<ColumnDef<Employee>[]>(() => [
        {
            id: "select",
            header: ({ table }) => (
                <input
                    type="checkbox"
                    checked={table.getIsAllRowsSelected()}
                    onChange={table.getToggleAllRowsSelectedHandler()}
                />
            ),
            cell: ({ row }) => (
                <input
                    type="checkbox"
                    checked={row.getIsSelected()}
                    onChange={row.getToggleSelectedHandler()}
                />
            ),
            enableResizing: false,
            size: 40,
        },
        {
            accessorKey: "name",
            header: "Họ tên",
        },
        {
            accessorKey: "age",
            header: "Tuổi",
        },
        {
            accessorKey: "department",
            header: "Phòng ban",
        },
        {
            accessorKey: "startDate",
            header: "Ngày bắt đầu",
            cell: (info) => new Date(info.getValue() as string).toLocaleDateString(),
        },
        {
            accessorKey: "active",
            header: "Trạng thái",
            cell: ({ getValue }) => ((getValue() as boolean) ? "Đang làm việc" : "Đã nghỉ việc"),
        },
        {
            accessorKey: "salary",
            header: "Lương ($)",
        }
    ], []);

    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter,
            columnFilters,
            sorting,
            columnVisibility,
            columnOrder,
            columnPinning,
            rowSelection,
        },
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnOrderChange: setColumnOrder,
        onColumnPinningChange: setColumnPinning,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFacetedMinMaxValues: getFacetedMinMaxValues(),
        enableColumnResizing: true,
    });

    useEffect(() => {
        const state = table.getState();
        localStorage.setItem("tableState", JSON.stringify({
            globalFilter: state.globalFilter,
            columnFilters: state.columnFilters,
            sorting: state.sorting,
            columnVisibility: state.columnVisibility,
            columnOrder: state.columnOrder,
            columnPinning: state.columnPinning,
        }));
    }, [table.getState()]);

    const reorder = (cols: string[], from: string, to: string) => {
        const start = cols.indexOf(from);
        const end = cols.indexOf(to);
        const updated = [...cols];
        const [removed] = updated.splice(start, 1);
        updated.splice(end, 0, removed);
        return updated;
    };

    return (
        <div className="p-4">
            <AddEmployeeDialog onAdd={handleAddEmployee} nextId={(data.length ? Math.max(...data.map(d => d.id)) : 0) + 1} />
            <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
                <input
                    placeholder="Tìm kiếm toàn bộ bảng..."
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="border px-3 py-2 rounded w-full max-w-sm"
                />
                <ColumnVisibilityToggle table={table} />
            </div>

            <div className="overflow-auto border rounded">
                <table className="min-w-full">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className={`border px-2 py-1 text-left bg-gray-100 ${columnPinning.left?.includes(header.column.id)
                                            ? "sticky left-0 bg-yellow-50 z-10"
                                            : columnPinning.right?.includes(header.column.id)
                                                ? "sticky right-0 bg-yellow-50 z-10"
                                                : ""
                                            }`}
                                        draggable
                                        onDragStart={() => dragCol.current = header.column.id}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={() => {
                                            if (dragCol.current && dragCol.current !== header.column.id) {
                                                setColumnOrder((prev) =>
                                                    reorder(
                                                        prev.length ? prev : table.getAllLeafColumns().map(c => c.id),
                                                        dragCol.current!,
                                                        header.column.id
                                                    )
                                                );
                                            }
                                        }}
                                    >
                                        <div className="flex justify-between items-center cursor-move">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            <button
                                                onClick={() =>
                                                    setColumnPinning((prev) => ({
                                                        left: prev.left?.includes(header.column.id)
                                                            ? prev.left.filter((id) => id !== header.column.id)
                                                            : [...(prev.left || []), header.column.id],
                                                    }))
                                                }
                                                className="text-xs ml-2 px-1 bg-gray-200 rounded hover:bg-gray-300"
                                            >
                                                📌
                                            </button>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id} className="border-t">
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
                                        className={`border px-2 py-1 ${columnPinning.left?.includes(cell.column.id)
                                            ? "sticky left-0 bg-yellow-50 z-0"
                                            : columnPinning.right?.includes(cell.column.id)
                                                ? "sticky right-0 bg-yellow-50 z-0"
                                                : ""
                                            }`}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

