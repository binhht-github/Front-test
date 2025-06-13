import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import type { Employee } from "./types";

interface Props {
    onAdd: (employee: Employee) => void;
    nextId: number;
}

export const AddEmployeeDialog = ({ onAdd, nextId }: Props) => {
    const [openDialog, setOpenDialog] = useState(false);

    const [newEmployee, setNewEmployee] = useState<Employee>({
        id: nextId,
        name: "",
        age: 0,
        startDate: new Date().toISOString().split("T")[0],
        department: "",
        active: false,
        salary: 0,
    });

    const handleAdd = () => {
        if (!newEmployee.name || !newEmployee.department) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }
        onAdd({ ...newEmployee });
        setNewEmployee({
            id: nextId + 1,
            name: "",
            age: 0,
            startDate: new Date().toISOString().split("T")[0],
            department: "",
            active: false,
            salary: 0,
        });
        setOpenDialog(false);
    };

    return (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
                <button className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    + Thêm nhân viên
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Thêm nhân viên mới</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <input
                        type="text"
                        placeholder="Họ tên"
                        value={newEmployee.name}
                        onChange={(e) =>
                            setNewEmployee({ ...newEmployee, name: e.target.value })
                        }
                        className="border px-2 py-1 rounded"
                    />
                    <input
                        type="number"
                        placeholder="Tuổi"
                        value={newEmployee.age}
                        onChange={(e) =>
                            setNewEmployee({
                                ...newEmployee,
                                age: parseInt(e.target.value),
                            })
                        }
                        className="border px-2 py-1 rounded"
                    />
                    <input
                        type="date"
                        value={newEmployee.startDate}
                        onChange={(e) =>
                            setNewEmployee({
                                ...newEmployee,
                                startDate: e.target.value,
                            })
                        }
                        className="border px-2 py-1 rounded"
                    />
                    <select
                        value={newEmployee.department}
                        onChange={(e) =>
                            setNewEmployee({
                                ...newEmployee,
                                department: e.target.value,
                            })
                        }
                        className="border px-2 py-1 rounded"
                    >
                        <option value="">-- Chọn phòng ban --</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Kinh doanh">Kinh doanh</option>
                        <option value="Nhân sự">Nhân sự</option>
                    </select>
                    <input
                        type="number"
                        placeholder="Lương"
                        value={newEmployee.salary}
                        onChange={(e) =>
                            setNewEmployee({
                                ...newEmployee,
                                salary: parseFloat(e.target.value),
                            })
                        }
                        className="border px-2 py-1 rounded"
                    />
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={newEmployee.active}
                            onChange={(e) =>
                                setNewEmployee({
                                    ...newEmployee,
                                    active: e.target.checked,
                                })
                            }
                        />
                        <span>Đang làm việc</span>
                    </label>
                </div>
                <button
                    onClick={handleAdd}
                    className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    Thêm mới
                </button>
            </DialogContent>
        </Dialog>
    );
};
