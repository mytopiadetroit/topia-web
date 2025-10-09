import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableItem({ id, children, className }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'move',
    zIndex: isDragging ? 1 : 'auto',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={className}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}
