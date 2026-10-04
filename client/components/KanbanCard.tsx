"use client";

import { useEffect, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import axiosInstance from "@/lib/axiosinstance";

interface KanbanCardProps {
  issue: any;
  isOverlay?: boolean;
  onClick?: () => void;
}

const priorityColors: Record<string, string> = {
  HIGH: "bg-red-100 text-red-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  LOW: "bg-green-100 text-green-800",
};

const issueTypeColors: Record<string, string> = {
  BUG: "bg-red-500",
  TASK: "bg-blue-500",
  STORY: "bg-purple-500",
};

const KanbanCard = ({
  issue,
  isOverlay = false,
  onClick,
}: KanbanCardProps) => {
  const [assignee, setAssignee] = useState<any>(null);

  // ❗ useSortable ONLY for real cards, not overlay
  const sortable = !isOverlay
    ? useSortable({ id: issue.id })
    : null;

  const style = sortable
    ? {
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
        opacity: sortable.isDragging ? 0.4 : 1,
      }
    : undefined;

  /* =====================
     Fetch assignee by ID
  ===================== */
  useEffect(() => {
    if (!issue?.assigneeId || isOverlay) return;

    const fetchAssignee = async () => {
      try {
        const res = await axiosInstance.get(
          `/api/users/${issue.assigneeId}`
        );
        setAssignee(res.data);
      } catch (err) {
        console.error("Failed to load assignee", err);
      }
    };

    fetchAssignee();
  }, [issue?.assigneeId, isOverlay]);

  return (
    <div
      ref={sortable?.setNodeRef}
      style={style}
      {...sortable?.attributes}
      {...sortable?.listeners}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`group rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all duration-200 ${
        isOverlay
          ? "border-[#0052CC] shadow-xl ring-2 ring-blue-100"
          : "cursor-pointer hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
      }`}
    >
      {/* Title */}
      <p className="mb-3 line-clamp-2 text-sm font-medium leading-5 text-[#172B4D]">
        {issue.title}
      </p>

      {/* Meta */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className={`h-4 w-4 shrink-0 rounded ${issueTypeColors[issue.type]}`}
          />

          <span className="truncate text-[11px] font-bold tracking-wide text-[#5E6C84]">
            {issue.key}
          </span>
        </div>

        <Badge
          className={`ml-2 rounded-md border-0 px-2 py-0.5 text-[10px] font-semibold ${priorityColors[issue.priority]}`}
        >
          {issue.priority}
        </Badge>
      </div>

      {/* Assignee */}
      {assignee && (
        <div className="flex items-center gap-2 border-t border-slate-100 pt-2">
          <Avatar className="h-6 w-6 shrink-0">
            <AvatarImage
              src={assignee.avatar}
              className="object-cover"
            />

            <AvatarFallback className="bg-blue-100 text-[10px] font-semibold text-[#0052CC]">
              {assignee.name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <span className="truncate text-[10px] font-medium text-[#626F86]">
            {assignee.name}
          </span>
        </div>
      )}
    </div>
  );
};

export default KanbanCard;