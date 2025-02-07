import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Wand2, Plus } from 'lucide-react';
import { useContentStore } from '../../../lib/store';
import type { OutlineItem } from '../../../lib/store';

interface SortableItemProps {
  id: string;
  item: OutlineItem;
  onChange: (value: string) => void;
  onRemove: () => void;
}

function SortableItem({ id, item, onChange, onRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    position: 'relative' as const
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center space-x-2 bg-white rounded-lg ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      <button
        className="p-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <textarea
        value={item.content}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 transition-all duration-200 min-h-[100px] resize-y"
      />
      <button
        onClick={onRemove}
        className="p-2 text-red-500 hover:text-red-700 transition-colors duration-200"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface OutlineDisplayProps {
  outline: OutlineItem[];
  contentType: string;
  onOutlineChange: (newOutline: OutlineItem[]) => void;
  onGenerateContent: () => void;
  isLoading: boolean;
}

export function OutlineDisplay({
  outline,
  contentType,
  onOutlineChange,
  onGenerateContent,
  isLoading
}: OutlineDisplayProps) {
  const addOutlineSection = useContentStore(state => state.addOutlineSection);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const outlineItems = outline.map((item) => item);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = outlineItems.findIndex((item) => item.id === active.id);
      const newIndex = outlineItems.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(outlineItems, oldIndex, newIndex);
      onOutlineChange(newItems);
    }
  };

  const maxSections = contentType === 'Social Media Post' ? 4 : 10;
  const canAddSection = outline.length < maxSections;

  const handleAddSection = () => {
    if (!canAddSection) return;
    onOutlineChange([...outline, { id: crypto.randomUUID(), type: 'h2', content: '', items: [] }]);
  };

  const handleUpdateSection = (index: number, newValue: string) => {
    const newOutline = [...outline];
    newOutline[index] = { ...newOutline[index], content: newValue };
    onOutlineChange(newOutline);
  };

  const handleRemoveSection = (index: number) => {
    const newOutline = [...outline];
    newOutline.splice(index, 1);
    onOutlineChange(newOutline);
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow animate-fade-in">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">Content Outline</h3>
        <span className="text-sm text-gray-500">
          {outline.length}/{maxSections} sections
        </span>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={outlineItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 mb-4">
            {outlineItems.map((item, index) => (
              <SortableItem
                key={item.id}
                id={item.id}
                item={item}
                onChange={(newValue) => handleUpdateSection(index, newValue)}
                onRemove={() => handleRemoveSection(index)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex justify-between items-center mt-4">
        <div className="flex space-x-2">
          <button
            onClick={() => {
              addOutlineSection('h2');
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
            <span>Add Section</span>
          </button>

          <button
            onClick={() => {
              const parentId = outline.find(item => item.type === 'h2')?.id;
              addOutlineSection('h3', parentId);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subsection</span>
          </button>

          <button
            onClick={() => {
              const parentId = outline.find(item => item.type === 'h2')?.id;
              addOutlineSection('list', parentId);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Plus className="w-4 h-4" />
            <span>Add List</span>
          </button>

          <button
            onClick={() => {
              const parentId = outline.find(item => item.type === 'h2')?.id;
              addOutlineSection('cta', parentId);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            <Plus className="w-4 h-4" />
            <span>Add CTA</span>
          </button>
          
          <button
            onClick={onGenerateContent}
            className="flex-1 flex items-center justify-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
          >
            <Wand2 className="w-5 h-5" />
            <span>Generate Content</span>
          </button>
        </div>
      </div>
    </div>
  );
}