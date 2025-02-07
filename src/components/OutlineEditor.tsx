import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Wand2 } from 'lucide-react';

interface OutlineItem {
  id: string;
  content: string;
}

interface SortableItemProps {
  id: string;
  content: string;
  onChange: (value: string) => void;
  onRemove: () => void;
}

function SortableItem({ id, content, onChange, onRemove }: SortableItemProps) {
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
      <input
        type="text"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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

interface OutlineEditorProps {
  outline: string[];
  setOutline: (outline: string[]) => void;
  contentType: string;
  onGenerateContent: () => void;
  isLoading: boolean;
}

export function OutlineEditor({
  outline,
  setOutline,
  contentType,
  onGenerateContent,
  isLoading
}: OutlineEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  // Convert string array to array of objects with unique IDs
  const outlineItems: OutlineItem[] = outline.map((content, index) => ({
    id: `item-${index}`,
    content
  }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = outlineItems.findIndex((item) => item.id === active.id);
      const newIndex = outlineItems.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(outlineItems, oldIndex, newIndex);
      setOutline(newItems.map(item => item.content));
    }
  };

  const maxSections = contentType === 'Social Media Post' ? 4 : 10;
  const canAddSection = outline.length < maxSections;

  const handleAddSection = () => {
    if (!canAddSection) {
      return;
    }
    setOutline([...outline, '']);
  };

  const handleUpdateSection = (index: number, newValue: string) => {
    const newOutline = [...outline];
    newOutline[index] = newValue;
    setOutline(newOutline);
  };

  const handleRemoveSection = (index: number) => {
    const newOutline = [...outline];
    newOutline.splice(index, 1);
    setOutline(newOutline);
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
                content={item.content}
                onChange={(newValue) => handleUpdateSection(index, newValue)}
                onRemove={() => handleRemoveSection(index)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handleAddSection}
          className={`text-blue-500 hover:text-blue-700 text-sm transition-colors duration-200 ${
            !canAddSection ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={!canAddSection}
        >
          + Add section
        </button>
        <button
          onClick={onGenerateContent}
          className="flex items-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors duration-200"
          disabled={isLoading || outline.length === 0}
        >
          <Wand2 className="w-5 h-5" />
          <span>Generate Content</span>
        </button>
      </div>
    </div>
  );
}