
import React, { useState, useRef, useEffect } from 'react';
import { Task, ViewMode } from '../types';

interface TaskCardProps {
  task: Task;
  viewMode: ViewMode;
  onContextMenu: (e: React.MouseEvent, task: Task) => void;
  onUpdate: (newName: string) => void;
  onResizeStart: (e: React.MouseEvent, direction: 'left' | 'right', task: Task) => void;
  onMouseDown: (e: React.MouseEvent, task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, viewMode, onContextMenu, onUpdate, onResizeStart, onMouseDown }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditValue(task.name);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue.trim() && editValue !== task.name) {
      onUpdate(editValue.trim());
    } else {
      setEditValue(task.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(task.name);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing || e.button !== 0) return;
    onMouseDown(e, task);
  };

  const isTooSmallForText = () => {
    if (viewMode === 'month') return task.duration < 2.5;
    if (viewMode === 'quarter') return task.duration < 7;
    if (viewMode === 'year') return task.duration < 15;
    return false;
  };
  const showOutside = isTooSmallForText();

  return (
    <div 
      className={`task-card group relative flex items-center h-7 bg-indigo-100 border-indigo-600 rounded px-1 transition-shadow shadow-sm ${isEditing ? 'ring-2 ring-indigo-500 z-50' : 'cursor-grab active:cursor-grabbing hover:brightness-95 hover:shadow-md'}`}
      style={{ overflow: 'visible' }}
      draggable={false}
      onMouseDown={handleMouseDown}
      onContextMenu={(e) => onContextMenu(e, task)}
      onDoubleClick={handleDoubleClick}
    >
      {/* Resize Handle Left */}
      {!isEditing && (
        <div 
          className="absolute left-0 top-0 bottom-0 w-2 cursor-w-resize z-20 hover:bg-indigo-400/50 rounded-l"
          onMouseDown={(e) => { e.stopPropagation(); onResizeStart(e, 'left', task); }}
        />
      )}

      {/* Content */}
      <span className="text-[10px] font-bold text-indigo-900 mr-1.5 whitespace-nowrap select-none ml-1 flex-shrink-0 z-10">{task.id}</span>
      
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-white text-[10px] px-1 py-0.5 border-none outline-none text-indigo-900 rounded h-5 min-w-0 z-10"
        />
      ) : (
         <>
            {showOutside ? (
                // Text Outside (to the right)
                <div className="absolute left-full ml-1 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-medium text-slate-700 pointer-events-none z-0">
                    {task.name}
                </div>
            ) : (
                // Text Inside (Marquee or Truncate)
                <div className="flex-1 overflow-hidden relative h-full flex items-center z-10">
                    <div className="whitespace-nowrap text-[10px] font-medium text-indigo-800 absolute group-hover:animate-marquee">
                    {task.name}
                    </div>
                    <div className="whitespace-nowrap text-[10px] font-medium text-indigo-800 opacity-100 group-hover:opacity-0 truncate">
                    {task.name}
                    </div>
                </div>
            )}
         </>
      )}
      
      {/* Resize Handle Right */}
      {!isEditing && (
        <div 
          className="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize z-20 hover:bg-indigo-400/50 rounded-r"
          onMouseDown={(e) => { e.stopPropagation(); onResizeStart(e, 'right', task); }}
        />
      )}
    </div>
  );
};
