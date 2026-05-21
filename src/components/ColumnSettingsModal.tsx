import React, { useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { GripVertical } from "lucide-react";

export interface ColumnItem {
  key: string;
  title: string;
  visible: boolean;
}

interface ColumnSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnItem[];
  onConfirm: (updatedColumns: ColumnItem[]) => void;
}

export const ColumnSettingsModal: React.FC<ColumnSettingsModalProps> = ({
  isOpen,
  onClose,
  columns,
  onConfirm,
}) => {
  const [items, setItems] = useState<ColumnItem[]>([]);

  // Keep state sync when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setItems([...columns]);
    }
  }, [isOpen, columns]);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const list = [...items];
    const draggedItem = list[draggedIndex];
    list.splice(draggedIndex, 1);
    list.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    setItems(list);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleToggle = (index: number) => {
    const list = [...items];
    list[index] = { ...list[index], visible: !list[index].visible };
    setItems(list);
  };

  const handleSelectAll = (checked: boolean) => {
    setItems(items.map(item => ({ ...item, visible: checked })));
  };

  const isAllChecked = items.length > 0 && items.every((i) => i.visible);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="列表设置" width="max-w-[400px]">
      <div className="py-2 space-y-4">
        {/* Table Header mock */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-500 font-medium text-sm">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              checked={isAllChecked}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
            <span>列名</span>
          </div>
          <span className="text-xs">拖动</span>
        </div>

        {/* Scrollable list */}
        <div className="max-h-[300px] overflow-y-auto space-y-1 pr-1 border border-slate-100 rounded-lg p-1">
          {items.map((item, index) => (
            <div
              key={item.key}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center justify-between px-4 py-2.5 rounded-md text-sm border cursor-move transition-colors group select-none ${
                draggedIndex === index
                  ? "bg-blue-50/50 border-blue-200/50 opacity-50"
                  : "bg-white hover:bg-slate-50 border-slate-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  checked={item.visible}
                  onChange={() => handleToggle(index)}
                />
                <span className="text-slate-700 font-medium">{item.title}</span>
              </div>
              <GripVertical className="w-4 h-4 text-slate-400 group-hover:text-slate-600 cursor-grab" />
            </div>
          ))}
        </div>

        {/* Modal Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="border-slate-200 h-9">
            取消
          </Button>
          <Button variant="primary" onClick={() => onConfirm(items)} className="bg-blue-600 hover:bg-blue-700 h-9">
            确定
          </Button>
        </div>
      </div>
    </Modal>
  );
};
