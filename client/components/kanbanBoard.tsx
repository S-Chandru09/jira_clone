"use client";

import {
  closestCorners,
  defaultDropAnimationSideEffects,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";
import IssueModel from "./IssueModel";

import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";

const STATUS_COLUMNS = [
  {
    id: "TODO",
    title: "To Do",
  },
  {
    id: "IN_PROGRESS",
    title: "In Progress",
  },
  {
    id: "DONE",
    title: "Done",
  },
];

const KanbanBoard = () => {
  const { selectedProject } = useAuth();

  const searchParams = useSearchParams();

  const searchQuery =
    searchParams.get("search")?.toLowerCase() || "";

  const [issues, setIssues] = useState<any[]>([]);
  const [activeIssue, setActiveIssue] = useState<any | null>(null);
  const [selectedIssue, setSelectedIssue] =
    useState<any | null>(null);

  const [loading, setLoading] = useState(false);

  // Used for DragOverlay portal
  const [isMounted, setIsMounted] = useState(false);

  /* =====================================================
     MOUNT
  ===================================================== */

  useEffect(() => {
    setIsMounted(true);
  }, []);

  /* =====================================================
     DRAG SENSORS
  ===================================================== */

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  /* =====================================================
     FETCH ISSUES
  ===================================================== */

  const fetchIssues = async () => {
    if (!selectedProject?.id) {
      setIssues([]);
      return;
    }

    try {
      setLoading(true);

      const res = await axiosInstance.get(
        `/api/issues/project/${selectedProject.id}`
      );

      setIssues(res.data);
    } catch (err) {
      console.error("Failed to load issues", err);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     LOAD ISSUES WHEN PROJECT CHANGES
  ===================================================== */

  useEffect(() => {
    fetchIssues();
  }, [selectedProject?.id]);

  /* =====================================================
     REFRESH AFTER ISSUE CREATION
  ===================================================== */

  useEffect(() => {
    const handleIssueCreated = () => {
      fetchIssues();
    };

    window.addEventListener(
      "issue-created",
      handleIssueCreated
    );

    return () => {
      window.removeEventListener(
        "issue-created",
        handleIssueCreated
      );
    };
  }, [selectedProject?.id]);

  /* =====================================================
     DRAG START
  ===================================================== */

  const onDragStart = (event: DragStartEvent) => {
    const issue = issues.find(
      (item) => item.id === event.active.id
    );

    setActiveIssue(issue || null);
  };

  /* =====================================================
     DRAG END
  ===================================================== */

  const onDragEnd = async (event: DragEndEvent) => {
    setActiveIssue(null);

    const { active, over } = event;

    if (!over) {
      return;
    }

    const issueId = active.id as string;
    const newStatus = over.id as string;

    const issue = issues.find(
      (item) => item.id === issueId
    );

    if (!issue) {
      return;
    }

    // Nothing changed
    if (issue.status === newStatus) {
      return;
    }

    const updatedIssue = {
      ...issue,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    try {
      /* ================================================
         OPTIMISTIC UPDATE
      ================================================= */

      setIssues((prevIssues) =>
        prevIssues.map((item) =>
          item.id === issueId
            ? updatedIssue
            : item
        )
      );

      /* ================================================
         UPDATE BACKEND
      ================================================= */

      await axiosInstance.put(
        `/api/issues/${issueId}`,
        {
          title: updatedIssue.title,
          description: updatedIssue.description,
          type: updatedIssue.type,
          priority: updatedIssue.priority,
          status: updatedIssue.status,
          projectId: updatedIssue.projectId,
          reporterId: updatedIssue.reporterId,
          assigneeId:
            updatedIssue.assigneeId ?? null,
          sprintId:
            updatedIssue.sprintId ?? null,
          order: updatedIssue.order ?? 0,
          comments:
            updatedIssue.comments ?? [],
          updatedAt: updatedIssue.updatedAt,
        }
      );
    } catch (err) {
      console.error(
        "Failed to update issue",
        err
      );

      /* ================================================
         ROLLBACK IF API FAILS
      ================================================= */

      setIssues((prevIssues) =>
        prevIssues.map((item) =>
          item.id === issueId
            ? issue
            : item
        )
      );
    }
  };

  /* =====================================================
     NO PROJECT SELECTED
  ===================================================== */

  if (!selectedProject) {
    return (
      <div
        className="
          flex
          h-full
          min-h-30
          items-center
          justify-center
          rounded-xl
          border
          border-dashed
          border-slate-200
          bg-slate-50
          text-sm
          text-[#6B778C]
        "
      >
        Select a project to view the board
      </div>
    );
  }

  /* =====================================================
     BOARD
  ===================================================== */

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {/* =================================================
          BOARD CONTENT
      ================================================= */}

      {loading ? (
        <div
          className="
            flex
            h-full
            min-h-30
            items-center
            justify-center
            rounded-xl
            border
            border-slate-200
            bg-slate-50
            text-sm
            text-[#6B778C]
          "
        >
          Loading board…
        </div>
      ) : (
        <div
          className="
            flex
            h-full
            min-h-0
            gap-4
            overflow-x-auto
            overflow-y-hidden
            pb-4
          "
        >
          {STATUS_COLUMNS.map((column) => {
            const columnIssues = issues
              .filter(
                (issue) =>
                  issue.status === column.id
              )
              .filter(
                (issue) =>
                  issue?.title
                    ?.toLowerCase()
                    .includes(searchQuery) ||
                  issue?.key
                    ?.toLowerCase()
                    .includes(searchQuery)
              )
              .sort(
                (a, b) =>
                  (a.order ?? 0) -
                  (b.order ?? 0)
              );

            return (
              <KanbanColumn
                key={column.id}
                column={column}
                issues={columnIssues}
                onIssueClick={setSelectedIssue}
              />
            );
          })}
        </div>
      )}

      {/* =================================================
          ISSUE MODAL
      ================================================= */}

      <IssueModel
        issue={selectedIssue}
        isOpen={!!selectedIssue}
        onClose={() => {
          setSelectedIssue(null);
        }}
        onIssueDeleted={(issueId: string) => {
          /*
           * IMPORTANT:
           *
           * Remove the deleted issue directly
           * from the Kanban board state.
           *
           * This means the user does NOT need
           * to refresh the browser.
           */

          setIssues((prevIssues) =>
            prevIssues.filter(
              (issue) => issue.id !== issueId
            )
          );

          // Also close the issue modal
          setSelectedIssue(null);
        }}
      />

      {/* =================================================
          DRAG OVERLAY
      ================================================= */}

      {isMounted &&
        !loading &&
        createPortal(
          <DragOverlay
            dropAnimation={{
              sideEffects:
                defaultDropAnimationSideEffects({
                  styles: {
                    active: {
                      opacity: "0.5",
                    },
                  },
                }),
            }}
          >
            {activeIssue ? (
              <KanbanCard
                issue={activeIssue}
                isOverlay
              />
            ) : null}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  );
};

export default KanbanBoard;