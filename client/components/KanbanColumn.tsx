"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import KanbanCard from "./KanbanCard";

const KanbanColumn = ({ column, issues, onIssueClick }: any) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div
      className="
        flex
        h-full
        w-70
        shrink-0
        flex-col
        rounded-lg
        border
        border-[#DFE1E6]
        bg-[#F4F5F7]
        p-3
      "
    >
      {/* Column Header */}
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[#5E6C84]">
          {column.title}
        </h3>

        <span
          className="
            rounded-full
            bg-[#EBECF0]
            px-2
            py-0.5
            text-[11px]
            font-semibold
            text-[#5E6C84]
          "
        >
          {issues.length}
        </span>
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className="
          min-h-20
          flex-1
          space-y-2
          rounded-md
          transition-colors
        "
      >
        <SortableContext
          items={issues.map((i: any) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {issues.length > 0 ? (
            issues.map((issue: any) => (
              <KanbanCard
                key={issue.id}
                issue={issue}
                onClick={() => onIssueClick(issue)}
              />
            ))
          ) : (
            <div
              className="
                flex
                min-h-20
                items-center
                justify-center
                rounded-md
                border
                border-dashed
                border-[#C1C7D0]
                bg-[#F7F8FA]
                px-3
                text-center
                text-xs
                text-[#6B778C]
              "
            >
              No issues
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};

export default KanbanColumn;