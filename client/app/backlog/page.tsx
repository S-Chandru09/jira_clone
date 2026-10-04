"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import {
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Share2,
} from "lucide-react";
import { useEffect, useState } from "react";

const page = () => {
  const { selectedProject, user } = useAuth();

  const [issues, setIssues] = useState<any[]>([]);
  const [, setActiveSprint] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(false);

  /* =====================
     Fetch backlog data
  ===================== */
  const fetchData = async () => {
    if (!selectedProject?.id) return;

    try {
      setLoading(true);

      const issuesRes = await axiosInstance.get(
        `/api/issues/project/${selectedProject.id}`,
      );

      const sprintRes = await axiosInstance.get(
        `/api/sprints/project/${selectedProject.id}`,
      );

      setIssues(issuesRes.data);
      setActiveSprint(sprintRes.data || null);
    } catch (err) {
      console.error("Failed to load backlog", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedProject?.id]);

  /* =====================
     Create backlog issue
  ===================== */
  const createIssue = async () => {
    if (!newTitle.trim() || !selectedProject || !user) return;

    try {
      await axiosInstance.post("/api/issues", {
        title: newTitle,
        projectId: selectedProject.id,
        status: "TODO",
        priority: "MEDIUM",
        type: "TASK",
        reporterId: user.id,
        sprintId: null,
      });

      setNewTitle("");
      setIsCreating(false);
      fetchData();
    } catch (err) {
      console.error("Failed to create issue", err);
    }
  };

  const backlogIssues = issues.filter((i) => !i.sprintId);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#F7F8FA] text-sm text-[#6B778C]">
        Loading backlog…
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#F7F8FA] p-6">
      {/* Breadcrumb + Header */}
      <div className="mb-7 flex flex-col gap-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#6B778C]">
          <span className="font-medium">Projects</span>

          <ChevronRight className="h-4 w-4 shrink-0 text-[#5E6C84]" />

          <span className="font-medium">
            {selectedProject?.name}
          </span>

          <ChevronRight className="h-4 w-4 shrink-0 text-[#5E6C84]" />

          <span className="font-medium text-[#172B4D]">
            Backlog
          </span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#172B4D]">
            Backlog
          </h1>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-[#5E6C84] hover:bg-[#F4F5F7] hover:text-[#172B4D]"
            >
              <Share2 className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-[#5E6C84] hover:bg-[#F4F5F7] hover:text-[#172B4D]"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto pr-2">
        {/* =====================
            Backlog Section
        ===================== */}

        <section>
          <SectionHeader
            title="Backlog"
            count={backlogIssues.length}
          />

          <div className="overflow-hidden rounded-b-xl border border-slate-200 border-t-0 bg-white shadow-sm">
            <div className="divide-y divide-slate-100">
              {backlogIssues.map((issue) => (
                <BacklogItem
                  key={issue.id}
                  issue={issue}
                />
              ))}

              {/* Create Issue */}
              {isCreating ? (
                <form
                  className="px-5 py-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    createIssue();
                  }}
                >
                  <input
                    autoFocus
                    value={newTitle}
                    onChange={(e) =>
                      setNewTitle(e.target.value)
                    }
                    onBlur={() => {
                      if (!newTitle) {
                        setIsCreating(false);
                      }
                    }}
                    placeholder="Enter issue title..."
                    className="h-10 w-full rounded-md border border-[#0052CC] bg-white px-3 text-sm text-[#172B4D] outline-none ring-2 ring-[#DEEBFF] placeholder:text-[#6B778C]"
                  />
                </form>
              ) : (
                <CreateIssueRow
                  onClick={() => setIsCreating(true)}
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

/* =====================
   Section Header
===================== */

const SectionHeader = ({ title, count }: any) => (
  <div className="flex items-center justify-between rounded-t-xl border border-slate-200 bg-[#F4F5F7] px-5 py-4">
    <div className="flex items-center gap-3">
      <ChevronDown className="h-4 w-4 text-[#5E6C84]" />

      <span className="text-sm font-semibold text-[#172B4D]">
        {title}
      </span>

      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[#6B778C]">
        {count} issues
      </span>
    </div>
  </div>
);

/* =====================
   Create Issue Row
===================== */

const CreateIssueRow = ({ onClick }: any) => (
  <div className="px-5 py-3">
    <div
      onClick={onClick}
      className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#5E6C84] transition-colors hover:bg-[#F4F5F7] hover:text-[#0052CC]"
    >
      <Plus className="h-4 w-4" />

      <span>Create Issue</span>
    </div>
  </div>
);

/* =====================
   Backlog Item
===================== */

const BacklogItem = ({ issue }: any) => {
  const priorityMap = {
    HIGH: "text-red-500",
    MEDIUM: "text-orange-500",
    LOW: "text-blue-500",
  };

  const priorityColor =
    priorityMap[
      issue.priority as keyof typeof priorityMap
    ] || "text-[#6B778C]";

  const status =
    issue.status === "IN_PROGRESS"
      ? "In Progress"
      : issue.status === "DONE"
        ? "Done"
        : "To Do";

  return (
    <div className="group flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-[#F8F9FB]">
      {/* Left side */}
      <div className="flex min-w-0 items-center gap-3">
        {/* Priority dot */}
        <div
          className={`h-3 w-3 shrink-0 rounded-full bg-current ${priorityColor}`}
        />

        {/* Issue key */}
        <span className="shrink-0 text-xs font-semibold text-[#0052CC]">
          {issue.key}
        </span>

        {/* Title */}
        <span className="truncate text-sm font-medium text-[#172B4D]">
          {issue.title}
        </span>
      </div>

      {/* Right side */}
      <div className="flex shrink-0 items-center gap-4">
        {/* Priority */}
        <span
          className={`text-xs font-medium capitalize ${priorityColor}`}
        >
          {issue.priority?.toLowerCase() || "medium"}
        </span>

        {/* Status */}
        <div className="rounded-md bg-[#DEEBFF] px-2.5 py-1 text-xs font-medium text-[#0052CC]">
          {status}
        </div>

        {/* Avatar */}
        <Avatar className="h-7 w-7 border border-white">
          <AvatarImage
            src={issue.assignee?.avatar}
            className="object-cover"
          />

          <AvatarFallback className="bg-[#DFE1E6] text-xs font-medium text-[#172B4D]">
            U
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default page;