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



// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//     flexRender,
//     getCoreRowModel,
//     useReactTable,
//     getFilteredRowModel,
//     getSortedRowModel,
//     getPaginationRowModel,
//     getGroupedRowModel,
//     getExpandedRowModel,
//     getFacetedRowModel,
//     getFacetedUniqueValues,
//     getFacetedMinMaxValues,
//     type ColumnDef,
//     type ColumnFiltersState,
//     type SortingState,
//     type VisibilityState,
//     type ColumnOrderState,
//     type ColumnPinningState,
//     type RowSelectionState,
// } from "@tanstack/react-table";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// export type Employee = {
//     id: number;
//     name: string;
//     age: number;
//     startDate: string;
//     department: string;
//     active: boolean;
//     salary: number;
// };

// const ColumnVisibilityToggle = ({ table }: { table: ReturnType<typeof useReactTable<Employee>> }) => {
//     const allColumns = table.getAllLeafColumns().filter((col) => col.getCanHide());

//     return (
//         <div className="relative inline-block">
//             <details className="group">
//                 <summary className="cursor-pointer bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
//                     Hiển thị cột
//                 </summary>
//                 <div className="absolute z-10 mt-1 bg-white border rounded shadow-md p-2 w-48">
//                     {allColumns.map((column) => (
//                         <label key={column.id} className="flex items-center space-x-2 mb-1">
//                             <input
//                                 type="checkbox"
//                                 checked={column.getIsVisible()}
//                                 onChange={() => column.toggleVisibility()}
//                             />
//                             <span>{String(column.columnDef.id === "select" ? "Action" : column.columnDef.header)}</span>
//                         </label>
//                     ))}
//                 </div>
//             </details>
//         </div>
//     );
// };

// export const EmployeeTable = () => {
//     const [data, setData] = useState<Employee[]>(() => {
//         const stored = localStorage.getItem("employeeData");
//         return stored ? JSON.parse(stored) : [];
//     });

//     const savedState = useMemo(() => {
//         try {
//             const stored = localStorage.getItem("tableState");
//             return stored ? JSON.parse(stored) : {};
//         } catch {
//             return {};
//         }
//     }, []);

//     const [globalFilter, setGlobalFilter] = useState(savedState.globalFilter ?? "");
//     const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(savedState.columnFilters ?? []);
//     const [sorting, setSorting] = useState<SortingState>(savedState.sorting ?? []);
//     const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(savedState.columnVisibility ?? {});
//     const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(savedState.columnOrder ?? []);
//     const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(savedState.columnPinning ?? {});
//     const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

//     const dragCol = useRef<string | null>(null);
//     const [openDialog, setOpenDialog] = useState(false);

//     const [newEmployee, setNewEmployee] = useState<Employee>({
//         id: data.length + 1,
//         name: "",
//         age: 0,
//         startDate: new Date().toISOString().split("T")[0],
//         department: "",
//         active: false,
//         salary: 0,
//     });

//     const handleAddEmployee = () => {
//         if (!newEmployee.name || !newEmployee.department) {
//             alert("Vui lòng nhập đầy đủ thông tin!");
//             return;
//         }

//         const updated = [
//             ...data,
//             {
//                 ...newEmployee,
//                 id: data.length ? Math.max(...data.map((e) => e.id)) + 1 : 1,
//             },
//         ];

//         setData(updated);
//         localStorage.setItem("employeeData", JSON.stringify(updated));

//         setNewEmployee({
//             id: data.length + 2,
//             name: "",
//             age: 0,
//             startDate: new Date().toISOString().split("T")[0],
//             department: "",
//             active: false,
//             salary: 0,
//         });

//         setOpenDialog(false);
//     };

//     const columns = useMemo<ColumnDef<Employee>[]>(() => [
//         {
//             id: "select",
//             header: ({ table }) => (
//                 <input
//                     type="checkbox"
//                     checked={table.getIsAllRowsSelected()}
//                     onChange={table.getToggleAllRowsSelectedHandler()}
//                 />
//             ),
//             cell: ({ row }) => (
//                 <input
//                     type="checkbox"
//                     checked={row.getIsSelected()}
//                     onChange={row.getToggleSelectedHandler()}
//                 />
//             ),
//             enableResizing: false,
//             size: 40,
//         },
//         {
//             accessorKey: "name",
//             header: "Họ tên",
//         },
//         {
//             accessorKey: "age",
//             header: "Tuổi",
//         },
//         {
//             accessorKey: "department",
//             header: "Phòng ban",
//         },
//         {
//             accessorKey: "startDate",
//             header: "Ngày bắt đầu",
//             cell: (info) => new Date(info.getValue() as string).toLocaleDateString(),
//         },
//         {
//             accessorKey: "active",
//             header: "Trạng thái",
//             cell: ({ getValue }) => ((getValue() as boolean) ? "Đang làm việc" : "Đã nghỉ việc"),
//         },
//         {
//             accessorKey: "salary",
//             header: "Lương ($)",
//         }
//     ], []);

//     const table = useReactTable({
//         data,
//         columns,
//         state: {
//             globalFilter,
//             columnFilters,
//             sorting,
//             columnVisibility,
//             columnOrder,
//             columnPinning,
//             rowSelection,
//         },
//         onGlobalFilterChange: setGlobalFilter,
//         onColumnFiltersChange: setColumnFilters,
//         onSortingChange: setSorting,
//         onColumnVisibilityChange: setColumnVisibility,
//         onColumnOrderChange: setColumnOrder,
//         onColumnPinningChange: setColumnPinning,
//         onRowSelectionChange: setRowSelection,
//         getCoreRowModel: getCoreRowModel(),
//         getFilteredRowModel: getFilteredRowModel(),
//         getSortedRowModel: getSortedRowModel(),
//         getPaginationRowModel: getPaginationRowModel(),
//         getGroupedRowModel: getGroupedRowModel(),
//         getExpandedRowModel: getExpandedRowModel(),
//         getFacetedRowModel: getFacetedRowModel(),
//         getFacetedUniqueValues: getFacetedUniqueValues(),
//         getFacetedMinMaxValues: getFacetedMinMaxValues(),
//         enableColumnResizing: true,
//     });

//     useEffect(() => {
//         const state = table.getState();
//         localStorage.setItem("tableState", JSON.stringify({
//             globalFilter: state.globalFilter,
//             columnFilters: state.columnFilters,
//             sorting: state.sorting,
//             columnVisibility: state.columnVisibility,
//             columnOrder: state.columnOrder,
//             columnPinning: state.columnPinning,
//         }));
//     }, [table.getState()]);

//     const reorder = (cols: string[], from: string, to: string) => {
//         const start = cols.indexOf(from);
//         const end = cols.indexOf(to);
//         const updated = [...cols];
//         const [removed] = updated.splice(start, 1);
//         updated.splice(end, 0, removed);
//         return updated;
//     };

//     return (
//         <div className="p-4">
//             <Dialog open={openDialog} onOpenChange={setOpenDialog}>
//                 <DialogTrigger asChild>
//                     <button className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
//                         + Thêm nhân viên
//                     </button>
//                 </DialogTrigger>
//                 <DialogContent>
//                     <DialogHeader>
//                         <DialogTitle>Thêm nhân viên mới</DialogTitle>
//                     </DialogHeader>
//                     <div className="grid grid-cols-2 gap-4 mt-4">
//                         <input type="text" placeholder="Họ tên" value={newEmployee.name} onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })} className="border px-2 py-1 rounded" />
//                         <input type="number" placeholder="Tuổi" value={newEmployee.age} onChange={(e) => setNewEmployee({ ...newEmployee, age: parseInt(e.target.value) })} className="border px-2 py-1 rounded" />
//                         <input type="date" value={newEmployee.startDate} onChange={(e) => setNewEmployee({ ...newEmployee, startDate: e.target.value })} className="border px-2 py-1 rounded" />
//                         <select value={newEmployee.department} onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })} className="border px-2 py-1 rounded">
//                             <option value="">-- Chọn phòng ban --</option>
//                             <option value="Marketing">Marketing</option>
//                             <option value="Kinh doanh">Kinh doanh</option>
//                             <option value="Nhân sự">Nhân sự</option>
//                         </select>
//                         <input type="number" placeholder="Lương" value={newEmployee.salary} onChange={(e) => setNewEmployee({ ...newEmployee, salary: parseFloat(e.target.value) })} className="border px-2 py-1 rounded" />
//                         <label className="flex items-center space-x-2">
//                             <input type="checkbox" checked={newEmployee.active} onChange={(e) => setNewEmployee({ ...newEmployee, active: e.target.checked })} />
//                             <span>Đang làm việc</span>
//                         </label>
//                     </div>
//                     <button onClick={handleAddEmployee} className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
//                         Thêm mới
//                     </button>
//                 </DialogContent>
//             </Dialog>

//             <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
//                 <input placeholder="Tìm kiếm toàn bộ bảng..." value={globalFilter ?? ""} onChange={(e) => setGlobalFilter(e.target.value)} className="border px-3 py-2 rounded w-full max-w-sm" />
//                 <ColumnVisibilityToggle table={table} />
//             </div>

//             <div className="overflow-auto border rounded">
//                 <table className="min-w-full">
//                     <thead>
//                         {table.getHeaderGroups().map((headerGroup) => (
//                             <tr key={headerGroup.id}>
//                                 {headerGroup.headers.map((header) => (
//                                     <th
//                                         key={header.id}
//                                         className={`border px-2 py-1 text-left bg-gray-100 ${columnPinning.left?.includes(header.column.id) ? "sticky left-0 bg-yellow-50 z-10" : columnPinning.right?.includes(header.column.id) ? "sticky right-0 bg-yellow-50 z-10" : ""}`}
//                                         draggable
//                                         onDragStart={() => dragCol.current = header.column.id}
//                                         onDragOver={(e) => e.preventDefault()}
//                                         onDrop={() => {
//                                             if (dragCol.current && dragCol.current !== header.column.id) {
//                                                 setColumnOrder((prev) =>
//                                                     reorder(
//                                                         prev.length ? prev : table.getAllLeafColumns().map(c => c.id),
//                                                         dragCol.current!,
//                                                         header.column.id
//                                                     )
//                                                 );
//                                             }
//                                         }}
//                                     >
//                                         <div className="flex justify-between items-center cursor-move">
//                                             {flexRender(header.column.columnDef.header, header.getContext())}
//                                             <button
//                                                 onClick={() => {
//                                                     setColumnPinning((prev) => ({
//                                                         left: prev.left?.includes(header.column.id)
//                                                             ? prev.left.filter((id) => id !== header.column.id)
//                                                             : [...(prev.left || []), header.column.id],
//                                                     }));
//                                                 }}
//                                                 className="text-xs ml-2 px-1 bg-gray-200 rounded hover:bg-gray-300"
//                                             >📌</button>
//                                         </div>
//                                     </th>
//                                 ))}
//                             </tr>
//                         ))}
//                     </thead>
//                     <tbody>
//                         {table.getRowModel().rows.map((row) => (
//                             <tr key={row.id} className="border-t">
//                                 {row.getVisibleCells().map((cell) => (
//                                     <td
//                                         key={cell.id}
//                                         className={`border px-2 py-1 ${columnPinning.left?.includes(cell.column.id) ? "sticky left-0 bg-yellow-50 z-0" : columnPinning.right?.includes(cell.column.id) ? "sticky right-0 bg-yellow-50 z-0" : ""}`}
//                                     >
//                                         {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                                     </td>
//                                 ))}
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };

// // import React, { useEffect, useMemo, useRef, useState } from "react";
// // import {
// //     flexRender,
// //     getCoreRowModel,
// //     useReactTable,
// //     getFilteredRowModel,
// //     getSortedRowModel,
// //     getPaginationRowModel,
// //     getGroupedRowModel,
// //     getExpandedRowModel,
// //     getFacetedRowModel,
// //     getFacetedUniqueValues,
// //     getFacetedMinMaxValues,
// //     type ColumnDef,
// //     type ColumnFiltersState,
// //     type SortingState,
// //     type VisibilityState,
// //     type ColumnOrderState,
// //     type ColumnPinningState,
// //     type Row,
// //     type Table as ReactTable,
// // } from "@tanstack/react-table";
// // import { Checkbox } from "@radix-ui/react-checkbox";
// // import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// // export type Employee = {
// //     id: number;
// //     name: string;
// //     age: number;
// //     startDate: string;
// //     department: string;
// //     active: boolean;
// //     salary: number;
// // };

// // const ColumnVisibilityToggle = ({ table }: { table: ReactTable<Employee> }) => {
// //     const allColumns = table.getAllLeafColumns().filter((col) => col.getCanHide());

// //     return (
// //         <div className="relative inline-block">
// //             <details className="group">
// //                 <summary className="cursor-pointer bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
// //                     Hiển thị cột
// //                 </summary>
// //                 <div className="absolute z-10 mt-1 bg-white border rounded shadow-md p-2 w-48">
// //                     {allColumns.map((column) => (
// //                         <label key={column.id} className="flex items-center space-x-2 mb-1">
// //                             <input
// //                                 type="checkbox"
// //                                 checked={column.getIsVisible()}
// //                                 onChange={() => column.toggleVisibility()}
// //                             />
// //                             <span>{String(column.columnDef.header)}</span>
// //                         </label>
// //                     ))}
// //                 </div>
// //             </details>
// //         </div>
// //     );
// // };

// // export const EmployeeTable = () => {
// //     const [data, setData] = useState<Employee[]>(() => {
// //         const stored = localStorage.getItem("employeeData");
// //         return stored ? JSON.parse(stored) : [];
// //     });

// //     const [rowSelection, setRowSelection] = useState({});

// //     const savedState = useMemo(() => {
// //         try {
// //             const stored = localStorage.getItem("tableState");
// //             return stored ? JSON.parse(stored) : {};
// //         } catch {
// //             return {};
// //         }
// //     }, []);

// //     const [globalFilter, setGlobalFilter] = useState(savedState.globalFilter ?? "");
// //     const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(savedState.columnFilters ?? []);
// //     const [sorting, setSorting] = useState<SortingState>(savedState.sorting ?? []);
// //     const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(savedState.columnVisibility ?? {});
// //     const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(savedState.columnOrder ?? []);
// //     const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(savedState.columnPinning ?? {});
// //     const dragCol = useRef<string | null>(null);
// //     const [openDialog, setOpenDialog] = useState(false);

// //     const [newEmployee, setNewEmployee] = useState<Employee>({
// //         id: data.length + 1,
// //         name: "",
// //         age: 0,
// //         startDate: new Date().toISOString().split("T")[0],
// //         department: "",
// //         active: false,
// //         salary: 0,
// //     });

// //     const handleAddEmployee = () => {
// //         if (!newEmployee.name || !newEmployee.department) {
// //             alert("Vui lòng nhập đầy đủ thông tin!");
// //             return;
// //         }

// //         const updated = [
// //             ...data,
// //             {
// //                 ...newEmployee,
// //                 id: data.length ? Math.max(...data.map((e) => e.id)) + 1 : 1,
// //             },
// //         ];

// //         setData(updated);
// //         localStorage.setItem("employeeData", JSON.stringify(updated));

// //         setNewEmployee({
// //             id: data.length + 2,
// //             name: "",
// //             age: 0,
// //             startDate: new Date().toISOString().split("T")[0],
// //             department: "",
// //             active: false,
// //             salary: 0,
// //         });

// //         setOpenDialog(false);
// //     };

// //     const columns = useMemo<ColumnDef<Employee>[]>(() => [
// //         {
// //             id: "select",
// //             header: ({ table }) => (
// //                 <input
// //                     type="checkbox"
// //                     checked={table.getIsAllRowsSelected()}
// //                     onChange={table.getToggleAllRowsSelectedHandler()}
// //                 />
// //             ),
// //             cell: ({ row }) => (
// //                 <input
// //                     type="checkbox"
// //                     checked={row.getIsSelected()}
// //                     onChange={row.getToggleSelectedHandler()}
// //                 />
// //             ),
// //             size: 50,
// //             enableResizing: false,
// //         },
// //         {
// //             accessorKey: "name",
// //             header: "Họ tên",
// //             cell: (info) => info.getValue(),
// //             enableResizing: true,
// //         },
// //         {
// //             accessorKey: "age",
// //             header: "Tuổi",
// //             cell: (info) => info.getValue(),
// //             enableResizing: true,
// //         },
// //         {
// //             accessorKey: "department",
// //             header: "Phòng ban",
// //             cell: (info) => info.getValue(),
// //             enableResizing: true,
// //         },
// //         {
// //             accessorKey: "startDate",
// //             header: "Ngày bắt đầu",
// //             cell: (info) => new Date(info.getValue() as string).toLocaleDateString(),
// //             enableResizing: true,
// //         },
// //         {
// //             accessorKey: "active",
// //             header: "Đang làm việc",
// //             cell: ({ getValue }) => (
// //                 <input type="checkbox" checked={getValue() as boolean} disabled />
// //             ),
// //         }
// //         ,
// //         {
// //             accessorKey: "salary",
// //             header: "Lương ($)",
// //             cell: (info) => info.getValue(),
// //             enableResizing: true,
// //         },
// //     ], []);

// //     const table = useReactTable({
// //         data,
// //         columns,
// //         state: {
// //             globalFilter,
// //             columnFilters,
// //             sorting,
// //             columnVisibility,
// //             columnOrder,
// //             columnPinning,
// //             rowSelection,
// //         },
// //         onGlobalFilterChange: setGlobalFilter,
// //         onColumnFiltersChange: setColumnFilters,
// //         onSortingChange: setSorting,
// //         onColumnVisibilityChange: setColumnVisibility,
// //         onColumnOrderChange: setColumnOrder,
// //         onColumnPinningChange: setColumnPinning,
// //         onRowSelectionChange: setRowSelection,
// //         enableRowSelection: true,
// //         enableColumnResizing: true,
// //         getCoreRowModel: getCoreRowModel(),
// //         getFilteredRowModel: getFilteredRowModel(),
// //         getSortedRowModel: getSortedRowModel(),
// //         getPaginationRowModel: getPaginationRowModel(),
// //         getGroupedRowModel: getGroupedRowModel(),
// //         getExpandedRowModel: getExpandedRowModel(),
// //         getFacetedRowModel: getFacetedRowModel(),
// //         getFacetedUniqueValues: getFacetedUniqueValues(),
// //         getFacetedMinMaxValues: getFacetedMinMaxValues(),
// //     });

// //     useEffect(() => {
// //         const state = table.getState();
// //         localStorage.setItem("tableState", JSON.stringify({
// //             globalFilter: state.globalFilter,
// //             columnFilters: state.columnFilters,
// //             sorting: state.sorting,
// //             columnVisibility: state.columnVisibility,
// //             columnOrder: state.columnOrder,
// //             columnPinning: state.columnPinning,
// //         }));
// //     }, [table.getState()]);

// //     const reorder = (cols: string[], from: string, to: string) => {
// //         const start = cols.indexOf(from);
// //         const end = cols.indexOf(to);
// //         const updated = [...cols];
// //         const [removed] = updated.splice(start, 1);
// //         updated.splice(end, 0, removed);
// //         return updated;
// //     };

// //     return (
// //         <div className="p-4">
// //             <Dialog open={openDialog} onOpenChange={setOpenDialog}>
// //                 <DialogTrigger asChild>
// //                     <button className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
// //                         + Thêm nhân viên
// //                     </button>
// //                 </DialogTrigger>
// //                 <DialogContent>
// //                     <DialogHeader>
// //                         <DialogTitle>Thêm nhân viên mới</DialogTitle>
// //                     </DialogHeader>
// //                     <div className="grid grid-cols-2 gap-4 mt-4">
// //                         <input
// //                             type="text"
// //                             placeholder="Họ tên"
// //                             value={newEmployee.name}
// //                             onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
// //                             className="border px-2 py-1 rounded"
// //                         />
// //                         <input
// //                             type="number"
// //                             placeholder="Tuổi"
// //                             value={newEmployee.age}
// //                             onChange={(e) => setNewEmployee({ ...newEmployee, age: parseInt(e.target.value) })}
// //                             className="border px-2 py-1 rounded"
// //                         />
// //                         <input
// //                             type="date"
// //                             value={newEmployee.startDate}
// //                             onChange={(e) => setNewEmployee({ ...newEmployee, startDate: e.target.value })}
// //                             className="border px-2 py-1 rounded"
// //                         />
// //                         <select
// //                             value={newEmployee.department}
// //                             onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
// //                             className="border px-2 py-1 rounded"
// //                         >
// //                             <option value="">-- Chọn phòng ban --</option>
// //                             <option value="Marketing">Marketing</option>
// //                             <option value="Kinh doanh">Kinh doanh</option>
// //                             <option value="Nhân sự">Nhân sự</option>
// //                         </select>
// //                         <input
// //                             type="number"
// //                             placeholder="Lương"
// //                             value={newEmployee.salary}
// //                             onChange={(e) => setNewEmployee({ ...newEmployee, salary: parseFloat(e.target.value) })}
// //                             className="border px-2 py-1 rounded"
// //                         />
// //                         <label className="flex items-center space-x-2">
// //                             <input
// //                                 type="checkbox"
// //                                 checked={newEmployee.active}
// //                                 onChange={(e) => setNewEmployee({ ...newEmployee, active: e.target.checked })}
// //                             />
// //                             <span>Đang làm việc</span>
// //                         </label>
// //                     </div>
// //                     <button
// //                         onClick={handleAddEmployee}
// //                         className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
// //                     >
// //                         Thêm mới
// //                     </button>
// //                 </DialogContent>
// //             </Dialog>

// //             <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
// //                 <input
// //                     placeholder="Tìm kiếm toàn bộ bảng..."
// //                     value={globalFilter ?? ""}
// //                     onChange={(e) => setGlobalFilter(e.target.value)}
// //                     className="border px-3 py-2 rounded w-full max-w-sm"
// //                 />
// //                 <ColumnVisibilityToggle table={table} />
// //             </div>

// //             <div className="overflow-auto border rounded">
// //                 <table className="min-w-full">
// //                     <thead>
// //                         {table.getHeaderGroups().map((headerGroup) => (
// //                             <tr key={headerGroup.id}>
// //                                 {headerGroup.headers.map((header) => (
// //                                     <th
// //                                         key={header.id}
// //                                         style={{ width: header.getSize() }}
// //                                         className={`border px-2 py-1 text-left bg-gray-100 ${columnPinning.left?.includes(header.column.id)
// //                                             ? "sticky left-0 bg-yellow-50 z-10"
// //                                             : columnPinning.right?.includes(header.column.id)
// //                                                 ? "sticky right-0 bg-yellow-50 z-10"
// //                                                 : ""
// //                                             }`}
// //                                         draggable
// //                                         onDragStart={() => dragCol.current = header.column.id}
// //                                         onDragOver={(e) => e.preventDefault()}
// //                                         onDrop={() => {
// //                                             if (dragCol.current && dragCol.current !== header.column.id) {
// //                                                 setColumnOrder((prev) =>
// //                                                     reorder(
// //                                                         prev.length ? prev : table.getAllLeafColumns().map(c => c.id),
// //                                                         dragCol.current!,
// //                                                         header.column.id
// //                                                     )
// //                                                 );
// //                                             }
// //                                         }}
// //                                     >
// //                                         <div className="flex justify-between items-center cursor-move">
// //                                             {flexRender(header.column.columnDef.header, header.getContext())}
// //                                             <button
// //                                                 onClick={() => {
// //                                                     setColumnPinning((prev) => ({
// //                                                         left: prev.left?.includes(header.column.id)
// //                                                             ? prev.left.filter((id) => id !== header.column.id)
// //                                                             : [...(prev.left || []), header.column.id],
// //                                                     }));
// //                                                 }}
// //                                                 className="text-xs ml-2 px-1 bg-gray-200 rounded hover:bg-gray-300"
// //                                             >📌</button>
// //                                         </div>
// //                                     </th>
// //                                 ))}
// //                             </tr>
// //                         ))}
// //                     </thead>
// //                     <tbody>
// //                         {table.getRowModel().rows.map((row) => (
// //                             <tr key={row.id} className="border-t">
// //                                 {row.getVisibleCells().map((cell) => (
// //                                     <td
// //                                         key={cell.id}
// //                                         style={{ width: cell.column.getSize() }}
// //                                         className={`border px-2 py-1 ${columnPinning.left?.includes(cell.column.id)
// //                                             ? "sticky left-0 bg-yellow-50 z-0"
// //                                             : columnPinning.right?.includes(cell.column.id)
// //                                                 ? "sticky right-0 bg-yellow-50 z-0"
// //                                                 : ""
// //                                             }`}
// //                                     >
// //                                         {flexRender(cell.column.columnDef.cell, cell.getContext())}
// //                                     </td>
// //                                 ))}
// //                             </tr>
// //                         ))}
// //                     </tbody>
// //                 </table>
// //             </div>
// //         </div>
// //     );
// // };

// // ok nhất rồi đấy
// // import React, { useEffect, useMemo, useRef, useState } from "react";
// // import {
// //     flexRender,
// //     getCoreRowModel,
// //     useReactTable,
// //     getFilteredRowModel,
// //     getSortedRowModel,
// //     getPaginationRowModel,
// //     getGroupedRowModel,
// //     getExpandedRowModel,
// //     getFacetedRowModel,
// //     getFacetedUniqueValues,
// //     getFacetedMinMaxValues,
// //     type ColumnDef,
// //     type ColumnFiltersState,
// //     type SortingState,
// //     type VisibilityState,
// //     type ColumnOrderState,
// //     type ColumnPinningState,
// // } from "@tanstack/react-table";
// // import { Checkbox } from "@radix-ui/react-checkbox";

// // export type Employee = {
// //     id: number;
// //     name: string;
// //     age: number;
// //     startDate: string;
// //     department: string;
// //     active: boolean;
// //     salary: number;
// // };

// // const defaultData: Employee[] = [
// //     {
// //         id: 1,
// //         name: "Nguyễn Văn A",
// //         age: 28,
// //         startDate: "2022-01-10",
// //         department: "Marketing",
// //         active: true,
// //         salary: 1500,
// //     },
// //     {
// //         id: 2,
// //         name: "Trần Thị B",
// //         age: 32,
// //         startDate: "2021-07-18",
// //         department: "Kinh doanh",
// //         active: false,
// //         salary: 2000,
// //     },
// // ];

// // // Toggle hiển thị cột
// // const ColumnVisibilityToggle = ({ table }: { table: ReturnType<typeof useReactTable<Employee>> }) => {
// //     const allColumns = table.getAllLeafColumns().filter((col) => col.getCanHide());

// //     const getHeaderLabel = (columnId: string) => {
// //         const colDef = allColumns.find((c) => c.id === columnId)?.columnDef;
// //         const header = colDef?.header;

// //         if (typeof header === "string") return header;
// //         if (typeof header === "function") return columnId; // fallback nếu là function
// //         return String(header ?? columnId);
// //     };

// //     return (
// //         <div className="relative inline-block">
// //             <details className="group">
// //                 <summary className="cursor-pointer bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
// //                     Hiển thị cột
// //                 </summary>
// //                 <div className="absolute z-10 mt-1 bg-white border rounded shadow-md p-2 w-48 max-h-60 overflow-y-auto">
// //                     {allColumns.map((column) => (
// //                         <label key={column.id} className="flex items-center space-x-2 mb-1">
// //                             <input
// //                                 type="checkbox"
// //                                 checked={column.getIsVisible()}
// //                                 onChange={() => column.toggleVisibility()}
// //                             />
// //                             <span>{getHeaderLabel(column.id)}</span>
// //                         </label>
// //                     ))}
// //                 </div>
// //             </details>
// //         </div>
// //     );
// // };





// // export const EmployeeTable = () => {
// //     const [data, setData] = useState(() => [...defaultData]);

// //     const savedState = useMemo(() => {
// //         try {
// //             const stored = localStorage.getItem("tableState");
// //             return stored ? JSON.parse(stored) : {};
// //         } catch {
// //             return {};
// //         }
// //     }, []);

// //     const [globalFilter, setGlobalFilter] = useState(savedState.globalFilter ?? "");
// //     const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(savedState.columnFilters ?? []);
// //     const [sorting, setSorting] = useState<SortingState>(savedState.sorting ?? []);
// //     const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(savedState.columnVisibility ?? {});
// //     const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(savedState.columnOrder ?? []);
// //     const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(savedState.columnPinning ?? {});

// //     const dragCol = useRef<string | null>(null);

// //     const columns = useMemo<ColumnDef<Employee>[]>(() => [
// //         {
// //             accessorKey: "name",
// //             header: () => (
// //                 <div>
// //                     <div>Họ tên</div>
// //                     <input
// //                         type="text"
// //                         onChange={(e) =>
// //                             setColumnFilters((prev) => [
// //                                 ...prev.filter((f) => f.id !== "name"),
// //                                 { id: "name", value: e.target.value },
// //                             ])
// //                         }
// //                         className="border px-2 py-1 mt-1 w-full"
// //                         placeholder="Lọc theo tên"
// //                     />
// //                 </div>
// //             ),
// //             cell: ({ getValue, row }) => (
// //                 <input
// //                     defaultValue={getValue() as string}
// //                     onBlur={(e) => {
// //                         row.original.name = e.target.value;
// //                     }}
// //                     className="border rounded px-2 py-1 w-full"
// //                 />
// //             ),
// //         },
// //         {
// //             accessorKey: "age",
// //             header: () => (
// //                 <div>
// //                     <div>Tuổi</div>
// //                     <input
// //                         type="number"
// //                         onChange={(e) =>
// //                             setColumnFilters((prev) => [
// //                                 ...prev.filter((f) => f.id !== "age"),
// //                                 { id: "age", value: e.target.value },
// //                             ])
// //                         }
// //                         className="border px-2 py-1 mt-1 w-full"
// //                         placeholder="Lọc tuổi"
// //                     />
// //                 </div>
// //             ),
// //             cell: (info) => info.getValue(),
// //         },
// //         {
// //             accessorKey: "department",
// //             header: () => (
// //                 <div>
// //                     <div>Phòng ban</div>
// //                     <select
// //                         onChange={(e) =>
// //                             setColumnFilters((prev) => [
// //                                 ...prev.filter((f) => f.id !== "department"),
// //                                 { id: "department", value: e.target.value },
// //                             ])
// //                         }
// //                         className="border px-2 py-1 mt-1 w-full"
// //                         defaultValue=""
// //                     >
// //                         <option value="">Tất cả</option>
// //                         <option value="Marketing">Marketing</option>
// //                         <option value="Kinh doanh">Kinh doanh</option>
// //                         <option value="Nhân sự">Nhân sự</option>
// //                     </select>
// //                 </div>
// //             ),
// //             cell: (info) => info.getValue(),
// //         },
// //         {
// //             accessorKey: "startDate",
// //             header: "Ngày bắt đầu",
// //             cell: (info) => new Date(info.getValue() as string).toLocaleDateString(),
// //         },
// //         {
// //             accessorKey: "active",
// //             header: "Đang làm việc",
// //             cell: ({ getValue }) => <Checkbox checked={getValue() as boolean} disabled />,
// //         },
// //         {
// //             accessorKey: "salary",
// //             header: "Lương ($)",
// //             cell: (info) => info.getValue(),
// //         },
// //     ], []);

// //     const table = useReactTable({
// //         data,
// //         columns,
// //         state: {
// //             globalFilter,
// //             columnFilters,
// //             sorting,
// //             columnVisibility,
// //             columnOrder,
// //             columnPinning,
// //         },
// //         onGlobalFilterChange: setGlobalFilter,
// //         onColumnFiltersChange: setColumnFilters,
// //         onSortingChange: setSorting,
// //         onColumnVisibilityChange: setColumnVisibility,
// //         onColumnOrderChange: setColumnOrder,
// //         onColumnPinningChange: setColumnPinning,
// //         getCoreRowModel: getCoreRowModel(),
// //         getFilteredRowModel: getFilteredRowModel(),
// //         getSortedRowModel: getSortedRowModel(),
// //         getPaginationRowModel: getPaginationRowModel(),
// //         getGroupedRowModel: getGroupedRowModel(),
// //         getExpandedRowModel: getExpandedRowModel(),
// //         getFacetedRowModel: getFacetedRowModel(),
// //         getFacetedUniqueValues: getFacetedUniqueValues(),
// //         getFacetedMinMaxValues: getFacetedMinMaxValues(),
// //     });

// //     useEffect(() => {
// //         const state = table.getState();
// //         localStorage.setItem("tableState", JSON.stringify({
// //             globalFilter: state.globalFilter,
// //             columnFilters: state.columnFilters,
// //             sorting: state.sorting,
// //             columnVisibility: state.columnVisibility,
// //             columnOrder: state.columnOrder,
// //             columnPinning: state.columnPinning,
// //         }));
// //     }, [table.getState()]);

// //     const handleExport = () => {
// //         const rows = table.getFilteredRowModel().rows.map((row) => row.original);
// //         console.log("Exported Data:", rows);
// //     };

// //     const reorder = (cols: string[], from: string, to: string) => {
// //         const start = cols.indexOf(from);
// //         const end = cols.indexOf(to);
// //         const updated = [...cols];
// //         const [removed] = updated.splice(start, 1);
// //         updated.splice(end, 0, removed);
// //         return updated;
// //     };

// //     return (
// //         <div className="p-4">
// //             <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
// //                 <input
// //                     placeholder="Tìm kiếm toàn bộ bảng..."
// //                     value={globalFilter ?? ""}
// //                     onChange={(e) => setGlobalFilter(e.target.value)}
// //                     className="border px-3 py-2 rounded w-full max-w-sm"
// //                 />
// //                 <div className="flex items-center gap-2">
// //                     <ColumnVisibilityToggle table={table} />
// //                     <button
// //                         onClick={handleExport}
// //                         className="bg-blue-500 text-white px-4 py-2 rounded"
// //                     >
// //                         Xuất dữ liệu
// //                     </button>
// //                 </div>
// //             </div>

// //             <div className="overflow-auto border rounded">
// //                 <table className="min-w-full">
// //                     <thead>
// //                         {table.getHeaderGroups().map((headerGroup) => (
// //                             <tr key={headerGroup.id}>
// //                                 {headerGroup.headers.map((header) => (
// //                                     <th
// //                                         key={header.id}
// //                                         className={`border px-2 py-1 text-left bg-gray-100 ${columnPinning.left?.includes(header.column.id)
// //                                             ? "sticky left-0 bg-yellow-50 z-10"
// //                                             : columnPinning.right?.includes(header.column.id)
// //                                                 ? "sticky right-0 bg-yellow-50 z-10"
// //                                                 : ""
// //                                             }`}
// //                                         draggable
// //                                         onDragStart={() => {
// //                                             dragCol.current = header.column.id;
// //                                         }}
// //                                         onDragOver={(e) => e.preventDefault()}
// //                                         onDrop={() => {
// //                                             if (dragCol.current && dragCol.current !== header.column.id) {
// //                                                 setColumnOrder((prev) =>
// //                                                     reorder(prev.length ? prev : table.getAllLeafColumns().map(c => c.id), dragCol.current!, header.column.id)
// //                                                 );
// //                                             }
// //                                         }}
// //                                     >
// //                                         <div className="flex justify-between items-center cursor-move">
// //                                             {flexRender(header.column.columnDef.header, header.getContext())}
// //                                             <button
// //                                                 onClick={() => {
// //                                                     setColumnPinning((prev) => ({
// //                                                         left: prev.left?.includes(header.column.id)
// //                                                             ? prev.left.filter((id) => id !== header.column.id)
// //                                                             : [...(prev.left || []), header.column.id],
// //                                                     }));
// //                                                 }}
// //                                                 className="text-xs ml-2 px-1 bg-gray-200 rounded hover:bg-gray-300"
// //                                             >
// //                                                 📌
// //                                             </button>
// //                                         </div>
// //                                     </th>
// //                                 ))}
// //                             </tr>
// //                         ))}
// //                     </thead>
// //                     <tbody>
// //                         {table.getRowModel().rows.map((row) => (
// //                             <tr key={row.id} className="border-t">
// //                                 {row.getVisibleCells().map((cell) => (
// //                                     <td
// //                                         key={cell.id}
// //                                         className={`border px-2 py-1 ${columnPinning.left?.includes(cell.column.id)
// //                                             ? "sticky left-0 bg-yellow-50 z-0"
// //                                             : columnPinning.right?.includes(cell.column.id)
// //                                                 ? "sticky right-0 bg-yellow-50 z-0"
// //                                                 : ""
// //                                             }`}
// //                                     >
// //                                         {flexRender(cell.column.columnDef.cell, cell.getContext())}
// //                                     </td>
// //                                 ))}
// //                             </tr>
// //                         ))}
// //                     </tbody>
// //                 </table>
// //             </div>
// //         </div>
// //     );
// // };



// // // import React, { useEffect, useMemo, useState } from "react";
// // // import {
// // //     flexRender,
// // //     getCoreRowModel,
// // //     useReactTable,
// // //     getFilteredRowModel,
// // //     getSortedRowModel,
// // //     getPaginationRowModel,
// // //     getGroupedRowModel,
// // //     getExpandedRowModel,
// // //     getFacetedRowModel,
// // //     getFacetedUniqueValues,
// // //     getFacetedMinMaxValues,
// // // } from "@tanstack/react-table";
// // // import type {
// // //     ColumnDef,
// // //     ColumnFiltersState,
// // //     SortingState,
// // //     VisibilityState,
// // //     ColumnOrderState,
// // //     ColumnPinningState,
// // // } from "@tanstack/react-table";
// // // import { Checkbox } from "@radix-ui/react-checkbox";

// // // // Type và data mẫu
// // // export type Employee = {
// // //     id: number;
// // //     name: string;
// // //     age: number;
// // //     startDate: string;
// // //     department: string;
// // //     active: boolean;
// // //     salary: number;
// // // };

// // // const defaultData: Employee[] = [
// // //     {
// // //         id: 1,
// // //         name: "Nguyễn Văn A",
// // //         age: 28,
// // //         startDate: "2022-01-10",
// // //         department: "Marketing",
// // //         active: true,
// // //         salary: 1500,
// // //     },
// // //     {
// // //         id: 2,
// // //         name: "Trần Thị B",
// // //         age: 32,
// // //         startDate: "2021-07-18",
// // //         department: "Kinh doanh",
// // //         active: false,
// // //         salary: 2000,
// // //     },
// // // ];

// // // // Component toggle hiển thị cột
// // // const ColumnVisibilityToggle = ({ table }: { table: ReturnType<typeof useReactTable<Employee>> }) => {
// // //     const allColumns = table.getAllLeafColumns().filter((col) => col.getCanHide());

// // //     return (
// // //         <div className="relative inline-block">
// // //             <details className="group">
// // //                 <summary className="cursor-pointer bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
// // //                     Hiển thị cột
// // //                 </summary>
// // //                 <div className="absolute z-10 mt-1 bg-white border rounded shadow-md p-2 w-48">
// // //                     {allColumns.map((column) => (
// // //                         <label key={column.id} className="flex items-center space-x-2 mb-1">
// // //                             <input
// // //                                 type="checkbox"
// // //                                 checked={column.getIsVisible()}
// // //                                 onChange={() => column.toggleVisibility()}
// // //                             />
// // //                             <span>{column.columnDef.header as string}</span>
// // //                         </label>
// // //                     ))}
// // //                 </div>
// // //             </details>
// // //         </div>
// // //     );
// // // };

// // // export const EmployeeTable = () => {
// // //     const [data, setData] = useState(() => [...defaultData]);

// // //     const savedState = useMemo(() => {
// // //         try {
// // //             const stored = localStorage.getItem("tableState");
// // //             return stored ? JSON.parse(stored) : {};
// // //         } catch {
// // //             return {};
// // //         }
// // //     }, []);

// // //     const [globalFilter, setGlobalFilter] = useState(savedState.globalFilter ?? "");
// // //     const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(savedState.columnFilters ?? []);
// // //     const [sorting, setSorting] = useState<SortingState>(savedState.sorting ?? []);
// // //     const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(savedState.columnVisibility ?? {});
// // //     const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(savedState.columnOrder ?? []);
// // //     const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(savedState.columnPinning ?? {});

// // //     const columns = useMemo<ColumnDef<Employee>[]>(() => [
// // //         {
// // //             accessorKey: "name",
// // //             header: () => (
// // //                 <div>
// // //                     <div>Họ tên</div>
// // //                     <input
// // //                         type="text"
// // //                         onChange={(e) =>
// // //                             setColumnFilters((prev) => [
// // //                                 ...prev.filter((f) => f.id !== "name"),
// // //                                 { id: "name", value: e.target.value },
// // //                             ])
// // //                         }
// // //                         className="border px-2 py-1 mt-1 w-full"
// // //                         placeholder="Lọc theo tên"
// // //                     />
// // //                 </div>
// // //             ),
// // //             cell: ({ getValue, row }) => (
// // //                 <input
// // //                     defaultValue={getValue() as string}
// // //                     onBlur={(e) => {
// // //                         row.original.name = e.target.value;
// // //                     }}
// // //                     className="border rounded px-2 py-1 w-full"
// // //                 />
// // //             ),
// // //         },
// // //         {
// // //             accessorKey: "age",
// // //             header: () => (
// // //                 <div>
// // //                     <div>Tuổi</div>
// // //                     <input
// // //                         type="number"
// // //                         onChange={(e) =>
// // //                             setColumnFilters((prev) => [
// // //                                 ...prev.filter((f) => f.id !== "age"),
// // //                                 { id: "age", value: e.target.value },
// // //                             ])
// // //                         }
// // //                         className="border px-2 py-1 mt-1 w-full"
// // //                         placeholder="Lọc tuổi"
// // //                     />
// // //                 </div>
// // //             ),
// // //             cell: (info) => info.getValue(),
// // //         },
// // //         {
// // //             accessorKey: "department",
// // //             header: () => (
// // //                 <div>
// // //                     <div>Phòng ban</div>
// // //                     <select
// // //                         onChange={(e) =>
// // //                             setColumnFilters((prev) => [
// // //                                 ...prev.filter((f) => f.id !== "department"),
// // //                                 { id: "department", value: e.target.value },
// // //                             ])
// // //                         }
// // //                         className="border px-2 py-1 mt-1 w-full"
// // //                         defaultValue=""
// // //                     >
// // //                         <option value="">Tất cả</option>
// // //                         <option value="Marketing">Marketing</option>
// // //                         <option value="Kinh doanh">Kinh doanh</option>
// // //                         <option value="Nhân sự">Nhân sự</option>
// // //                     </select>
// // //                 </div>
// // //             ),
// // //             cell: (info) => info.getValue(),
// // //         },
// // //         {
// // //             accessorKey: "startDate",
// // //             header: "Ngày bắt đầu",
// // //             cell: (info) => new Date(info.getValue() as string).toLocaleDateString(),
// // //         },
// // //         {
// // //             accessorKey: "active",
// // //             header: "Đang làm việc",
// // //             cell: ({ getValue }) => <Checkbox checked={getValue() as boolean} disabled />,
// // //         },
// // //         {
// // //             accessorKey: "salary",
// // //             header: "Lương ($)",
// // //             cell: (info) => info.getValue(),
// // //         },
// // //     ], []);

// // //     const table = useReactTable({
// // //         data,
// // //         columns,
// // //         state: {
// // //             globalFilter,
// // //             columnFilters,
// // //             sorting,
// // //             columnVisibility,
// // //             columnOrder,
// // //             columnPinning,
// // //         },
// // //         onGlobalFilterChange: setGlobalFilter,
// // //         onColumnFiltersChange: setColumnFilters,
// // //         onSortingChange: setSorting,
// // //         onColumnVisibilityChange: setColumnVisibility,
// // //         onColumnOrderChange: setColumnOrder,
// // //         onColumnPinningChange: setColumnPinning,
// // //         getCoreRowModel: getCoreRowModel(),
// // //         getFilteredRowModel: getFilteredRowModel(),
// // //         getSortedRowModel: getSortedRowModel(),
// // //         getPaginationRowModel: getPaginationRowModel(),
// // //         getGroupedRowModel: getGroupedRowModel(),
// // //         getExpandedRowModel: getExpandedRowModel(),
// // //         getFacetedRowModel: getFacetedRowModel(),
// // //         getFacetedUniqueValues: getFacetedUniqueValues(),
// // //         getFacetedMinMaxValues: getFacetedMinMaxValues(),
// // //         debugTable: true,
// // //     });

// // //     useEffect(() => {
// // //         const state = table.getState();
// // //         localStorage.setItem("tableState", JSON.stringify({
// // //             globalFilter: state.globalFilter,
// // //             columnFilters: state.columnFilters,
// // //             sorting: state.sorting,
// // //             columnVisibility: state.columnVisibility,
// // //             columnOrder: state.columnOrder,
// // //             columnPinning: state.columnPinning,
// // //         }));
// // //     }, [table.getState()]);

// // //     const handleExport = () => {
// // //         const rows = table.getFilteredRowModel().rows.map((row) => row.original);
// // //         console.log("Exported Data:", rows);
// // //     };

// // //     return (
// // //         <div className="p-4">
// // //             <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
// // //                 <input
// // //                     placeholder="Tìm kiếm toàn bộ bảng..."
// // //                     value={globalFilter ?? ""}
// // //                     onChange={(e) => setGlobalFilter(e.target.value)}
// // //                     className="border px-3 py-2 rounded w-full max-w-sm"
// // //                 />
// // //                 <div className="flex items-center gap-2">
// // //                     <ColumnVisibilityToggle table={table} />
// // //                     <button
// // //                         onClick={handleExport}
// // //                         className="bg-blue-500 text-white px-4 py-2 rounded"
// // //                     >
// // //                         Xuất dữ liệu
// // //                     </button>
// // //                 </div>
// // //             </div>

// // //             <div className="overflow-auto border rounded">
// // //                 <table className="min-w-full">
// // //                     <thead>
// // //                         {table.getHeaderGroups().map((headerGroup) => (
// // //                             <tr key={headerGroup.id}>
// // //                                 {headerGroup.headers.map((header) => (
// // //                                     <th key={header.id} className="border px-2 py-1 text-left bg-gray-100">
// // //                                         {header.isPlaceholder
// // //                                             ? null
// // //                                             : flexRender(header.column.columnDef.header, header.getContext())}
// // //                                     </th>
// // //                                 ))}
// // //                             </tr>
// // //                         ))}
// // //                     </thead>
// // //                     <tbody>
// // //                         {table.getRowModel().rows.map((row) => (
// // //                             <tr key={row.id} className="border-t">
// // //                                 {row.getVisibleCells().map((cell) => (
// // //                                     <td key={cell.id} className="border px-2 py-1">
// // //                                         {flexRender(cell.column.columnDef.cell, cell.getContext())}
// // //                                     </td>
// // //                                 ))}
// // //                             </tr>
// // //                         ))}
// // //                     </tbody>
// // //                 </table>
// // //             </div>
// // //         </div>
// // //     );
// // // };


// // // // src/components/EmployeeTable.tsx
// // // import React, { useEffect, useMemo, useState } from "react";
// // // import {
// // //     flexRender,
// // //     getCoreRowModel,
// // //     useReactTable,
// // //     getFilteredRowModel,
// // //     getSortedRowModel,
// // //     getPaginationRowModel,
// // //     getGroupedRowModel,
// // //     getExpandedRowModel,
// // //     getFacetedRowModel,
// // //     getFacetedUniqueValues,
// // //     getFacetedMinMaxValues,
// // // } from "@tanstack/react-table";
// // // import type {
// // //     ColumnDef,
// // //     ColumnFiltersState,
// // //     SortingState,
// // //     VisibilityState,
// // //     ColumnOrderState,
// // //     ColumnPinningState,
// // // } from "@tanstack/react-table";
// // // import { Checkbox } from "@radix-ui/react-checkbox";

// // // // Sample data and type
// // // export type Employee = {
// // //     id: number;
// // //     name: string;
// // //     age: number;
// // //     startDate: string;
// // //     department: string;
// // //     active: boolean;
// // //     salary: number;
// // // };

// // // const defaultData: Employee[] = [
// // //     {
// // //         id: 1,
// // //         name: "Nguyễn Văn A",
// // //         age: 28,
// // //         startDate: "2022-01-10",
// // //         department: "Marketing",
// // //         active: true,
// // //         salary: 1500,
// // //     },
// // //     {
// // //         id: 2,
// // //         name: "Trần Thị B",
// // //         age: 32,
// // //         startDate: "2021-07-18",
// // //         department: "Kinh doanh",
// // //         active: false,
// // //         salary: 2000,
// // //     },
// // //     // ... thêm nhiều dòng dữ liệu nếu cần
// // // ];

// // // export const EmployeeTable = () => {
// // //     const [data, setData] = useState(() => [...defaultData]);
// // //     const [globalFilter, setGlobalFilter] = useState("");
// // //     const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
// // //     const [sorting, setSorting] = useState<SortingState>([]);
// // //     const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
// // //     const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
// // //     const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({});

// // //     const columns = useMemo<ColumnDef<Employee>[]>(
// // //         () => [
// // //             {
// // //                 accessorKey: "name",
// // //                 header: "Họ tên",
// // //                 cell: ({ getValue, row }) => (
// // //                     <input
// // //                         defaultValue={getValue() as string}
// // //                         onBlur={(e) => {
// // //                             row.original.name = e.target.value;
// // //                         }}
// // //                         className="border rounded px-2 py-1 w-full"
// // //                     />
// // //                 ),
// // //             },
// // //             {
// // //                 accessorKey: "age",
// // //                 header: "Tuổi",
// // //                 cell: (info) => info.getValue(),
// // //             },
// // //             {
// // //                 accessorKey: "department",
// // //                 header: "Phòng ban",
// // //                 cell: (info) => info.getValue(),
// // //             },
// // //             {
// // //                 accessorKey: "startDate",
// // //                 header: "Ngày bắt đầu",
// // //                 cell: (info) => new Date(info.getValue() as string).toLocaleDateString(),
// // //             },
// // //             {
// // //                 accessorKey: "active",
// // //                 header: "Đang làm việc",
// // //                 cell: ({ getValue }) => (
// // //                     <Checkbox checked={getValue() as boolean} disabled />
// // //                 ),
// // //             },
// // //             {
// // //                 accessorKey: "salary",
// // //                 header: "Lương ($)",
// // //                 cell: (info) => info.getValue(),
// // //             },
// // //         ],
// // //         []
// // //     );

// // //     const table = useReactTable({
// // //         data,
// // //         columns,
// // //         state: {
// // //             globalFilter,
// // //             columnFilters,
// // //             sorting,
// // //             columnVisibility,
// // //             columnOrder,
// // //             columnPinning,
// // //         },
// // //         onGlobalFilterChange: setGlobalFilter,
// // //         onColumnFiltersChange: setColumnFilters,
// // //         onSortingChange: setSorting,
// // //         onColumnVisibilityChange: setColumnVisibility,
// // //         onColumnOrderChange: setColumnOrder,
// // //         onColumnPinningChange: setColumnPinning,
// // //         getCoreRowModel: getCoreRowModel(),
// // //         getFilteredRowModel: getFilteredRowModel(),
// // //         getSortedRowModel: getSortedRowModel(),
// // //         getPaginationRowModel: getPaginationRowModel(),
// // //         getGroupedRowModel: getGroupedRowModel(),
// // //         getExpandedRowModel: getExpandedRowModel(),
// // //         getFacetedRowModel: getFacetedRowModel(),
// // //         getFacetedUniqueValues: getFacetedUniqueValues(),
// // //         getFacetedMinMaxValues: getFacetedMinMaxValues(),
// // //         debugTable: true,
// // //     });

// // //     useEffect(() => {
// // //         const state = table.getState();
// // //         localStorage.setItem("tableState", JSON.stringify(state));
// // //     }, [table.getState()]);

// // //     const handleExport = () => {
// // //         const rows = table.getFilteredRowModel().rows.map((row) => row.original);
// // //         console.log("Exported Data:", rows);
// // //     };

// // //     return (
// // //         <div className="p-4">
// // //             <div className="flex justify-between mb-2">
// // //                 <input
// // //                     placeholder="Tìm kiếm toàn bộ bảng..."
// // //                     value={globalFilter ?? ""}
// // //                     onChange={(e) => setGlobalFilter(e.target.value)}
// // //                     className="border px-3 py-2 rounded w-1/3"
// // //                 />
// // //                 <button onClick={handleExport} className="bg-blue-500 text-white px-4 py-2 rounded">
// // //                     Xuất dữ liệu
// // //                 </button>
// // //             </div>
// // //             <div className="overflow-auto border rounded">
// // //                 <table className="min-w-full">
// // //                     <thead>
// // //                         {table.getHeaderGroups().map((headerGroup) => (
// // //                             <tr key={headerGroup.id}>
// // //                                 {headerGroup.headers.map((header) => (
// // //                                     <th key={header.id} className="border px-2 py-1 text-left bg-gray-100">
// // //                                         {header.isPlaceholder
// // //                                             ? null
// // //                                             : flexRender(header.column.columnDef.header, header.getContext())}
// // //                                     </th>
// // //                                 ))}
// // //                             </tr>
// // //                         ))}
// // //                     </thead>
// // //                     <tbody>
// // //                         {table.getRowModel().rows.map((row) => (
// // //                             <tr key={row.id} className="border-t">
// // //                                 {row.getVisibleCells().map((cell) => (
// // //                                     <td key={cell.id} className="border px-2 py-1">
// // //                                         {flexRender(cell.column.columnDef.cell, cell.getContext())}
// // //                                     </td>
// // //                                 ))}
// // //                             </tr>
// // //                         ))}
// // //                     </tbody>
// // //                 </table>
// // //             </div>
// // //         </div>
// // //     );
// // // };
