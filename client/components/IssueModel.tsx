"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Trash2, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";

const priorityLabels: Record<string, string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

const typeLabels: Record<string, string> = {
  BUG: "Bug",
  TASK: "Task",
  STORY: "Story",
};

const typeIcons: Record<string, string> = {
  BUG: "🐛",
  TASK: "✓",
  STORY: "📖",
};

const IssueModel = ({ issue, isOpen, onClose }: any) => {
  const { user } = useAuth();

  const [assignee, setAssignee] = useState<any>(null);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [localIssue, setLocalIssue] = useState<any>(null);

  /* =====================================================
     LOAD ISSUE
  ===================================================== */

  useEffect(() => {
    if (!isOpen || !issue?.id) {
      return;
    }

    setLocalIssue(issue);
    setCommentText("");
  }, [isOpen, issue]);

  /* =====================================================
     LOAD ASSIGNEE
  ===================================================== */

  useEffect(() => {
    if (!localIssue?.assigneeId) {
      setAssignee(null);
      return;
    }

    const fetchAssignee = async () => {
      try {
        const res = await axiosInstance.get(
          `/api/users/${localIssue.assigneeId}`,
        );

        setAssignee(res.data);
      } catch (error) {
        console.error("Failed to load assignee:", error);
        setAssignee(null);
      }
    };

    fetchAssignee();
  }, [localIssue?.assigneeId]);

  /* =====================================================
     SAVE COMMENT
  ===================================================== */

  const saveComment = async () => {
    if (!commentText.trim() || !user || !localIssue) {
      return;
    }

    try {
      setLoading(true);

      const updatedComments = [
        ...(localIssue.comments || []),
        commentText.trim(),
      ];

      const res = await axiosInstance.put(
        `/api/issues/${localIssue.id}`,
        {
          title: localIssue.title,
          description: localIssue.description,
          type: localIssue.type,
          priority: localIssue.priority,
          status: localIssue.status,
          projectId: localIssue.projectId,
          reporterId: localIssue.reporterId,
          assigneeId: localIssue.assigneeId || null,
          sprintId: localIssue.sprintId || null,
          order: localIssue.order ?? 0,
          comments: updatedComments,
          updatedAt: new Date().toISOString(),
        },
      );

      setLocalIssue(res.data);

      setCommentText("");
    } catch (error) {
      console.error("Failed to save comment:", error);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     DELETE ISSUE
  ===================================================== */

  const handleDeleteIssue = async () => {
    if (!localIssue?.id) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${localIssue.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      await axiosInstance.delete(
        `/api/issues/${localIssue.id}`,
      );

      setLocalIssue(null);

      onClose();
    } catch (error: any) {
      console.error("Failed to delete issue:", error);

      if (error?.response) {
        console.error("Delete status:", error.response.status);
        console.error("Delete data:", error.response.data);
      }

      alert(
        "Failed to delete issue. Check the browser console and backend console.",
      );
    } finally {
      setDeleting(false);
    }
  };

  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate = (date: any) => {
    if (!date) {
      return "—";
    }

    try {
      return new Date(date).toLocaleDateString("en-GB");
    } catch {
      return "—";
    }
  };

  /* =====================================================
     CLOSE HANDLER
  ===================================================== */

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogContent
        className="
          w-240!
          max-w-[calc(100vw-32px)]!
          max-h-[90vh]
          overflow-hidden
          p-0
          gap-0
          rounded-xl
          border
          border-[#DFE1E6]
          bg-white
          shadow-2xl
        "
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <DialogHeader
          className="
            flex
            h-14
            flex-row
            items-center
            justify-between
            border-b
            border-[#DFE1E6]
            px-5
            py-0
          "
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                flex
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-md
                bg-[#0052CC]
                text-xs
                font-bold
                text-white
              "
            >
              {typeIcons[localIssue?.type] || "✓"}
            </div>

            <DialogTitle
              className="
                truncate
                text-sm
                font-semibold
                text-[#172B4D]
              "
            >
              {localIssue?.key
                ? localIssue.key
                : "Issue"}
            </DialogTitle>
          </div>

          <div className="flex items-center gap-1">
            {/* Delete */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={deleting || !localIssue}
              onClick={handleDeleteIssue}
              className="
                h-8
                w-8
                text-[#6B778C]
                hover:bg-red-50
                hover:text-red-600
              "
              title="Delete issue"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            {/* Open */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={!localIssue}
              className="
                h-8
                w-8
                text-[#6B778C]
                hover:bg-[#F4F5F7]
                hover:text-[#172B4D]
              "
              title="Open issue"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* =================================================
            CONTENT
        ================================================= */}

        {!localIssue ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-[#6B778C]">
              Loading issue...
            </p>
          </div>
        ) : (
          <>
            <div
              className="
                max-h-[calc(90vh-110px)]
                overflow-y-auto
                overflow-x-hidden
              "
            >
              <div
                className="
                  grid
                  min-w-0
                  grid-cols-1
                  md:grid-cols-[minmax(0,1fr)_260px]
                "
              >
                {/* =================================================
                    MAIN CONTENT
                ================================================= */}

                <main
                  className="
                    min-w-0
                    px-6
                    py-6
                  "
                >
                  {/* Title */}

                  <h1
                    className="
                      mb-6
                      wrap-break-word
                      text-2xl
                      font-semibold
                      leading-tight
                      text-[#172B4D]
                    "
                  >
                    {localIssue.title}
                  </h1>

                  {/* Description */}

                  <section className="mb-8">
                    <h3
                      className="
                        mb-2
                        text-sm
                        font-semibold
                        text-[#172B4D]
                      "
                    >
                      Description
                    </h3>

                    <div
                      className="
                        min-h-18
                        w-full
                        rounded-lg
                        border
                        border-[#DFE1E6]
                        bg-[#F7F8FA]
                        px-4
                        py-3
                      "
                    >
                      <p
                        className="
                          whitespace-pre-wrap
                          wrap-break-word
                          text-sm
                          leading-6
                          text-[#42526E]
                        "
                      >
                        {localIssue.description ||
                          "No description provided."}
                      </p>
                    </div>
                  </section>

                  {/* Comments */}

                  <section>
                    <div className="mb-4 flex items-center justify-between">
                      <h3
                        className="
                          text-sm
                          font-semibold
                          text-[#172B4D]
                        "
                      >
                        Comments
                        <span
                          className="
                            ml-1
                            text-[#6B778C]
                          "
                        >
                          ({localIssue.comments?.length || 0})
                        </span>
                      </h3>
                    </div>

                    {/* Existing comments */}

                    {localIssue.comments?.length > 0 ? (
                      <div className="mb-6 space-y-3">
                        {localIssue.comments.map(
                          (
                            comment: string,
                            index: number,
                          ) => (
                            <div
                              key={index}
                              className="
                                rounded-lg
                                border
                                border-[#DFE1E6]
                                bg-white
                                px-4
                                py-3
                              "
                            >
                              <div className="flex items-start gap-3">
                                <Avatar className="h-8 w-8 shrink-0">
                                  <AvatarImage
                                    src={user?.avatar}
                                  />

                                  <AvatarFallback
                                    className="
                                      bg-[#DEEBFF]
                                      text-[#0052CC]
                                    "
                                  >
                                    {user?.name
                                      ?.charAt(0)
                                      ?.toUpperCase() ||
                                      "U"}
                                  </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0 flex-1">
                                  <div className="mb-1 flex items-center gap-2">
                                    <span
                                      className="
                                        text-sm
                                        font-semibold
                                        text-[#172B4D]
                                      "
                                    >
                                      {user?.name ||
                                        "User"}
                                    </span>
                                  </div>

                                  <p
                                    className="
                                      whitespace-pre-wrap
                                      wrap-break-word
                                      text-sm
                                      leading-5
                                      text-[#42526E]
                                    "
                                  >
                                    {comment}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <p
                        className="
                          mb-6
                          text-sm
                          italic
                          text-[#6B778C]
                        "
                      >
                        No comments yet.
                      </p>
                    )}

                    {/* Add comment */}

                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={user?.avatar} />

                        <AvatarFallback
                          className="
                            bg-[#DEEBFF]
                            text-[#0052CC]
                          "
                        >
                          {user?.name
                            ?.charAt(0)
                            ?.toUpperCase() || "ME"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <Textarea
                          value={commentText}
                          onChange={(e) =>
                            setCommentText(e.target.value)
                          }
                          placeholder="Add a comment..."
                          disabled={loading}
                          className="
                            min-h-12
                            w-full
                            resize-y
                            rounded-lg
                            border-[#DFE1E6]
                            bg-white
                            text-sm
                            text-[#172B4D]
                            placeholder:text-[#6B778C]
                            focus-visible:ring-2
                            focus-visible:ring-[#0052CC]
                          "
                        />

                        <div className="mt-3 flex justify-end">
                          <Button
                            type="button"
                            size="sm"
                            disabled={
                              !commentText.trim() ||
                              loading
                            }
                            onClick={saveComment}
                            className="
                              bg-[#0052CC]
                              text-white
                              hover:bg-[#0747A6]
                            "
                          >
                            {loading
                              ? "Saving..."
                              : "Save"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </section>
                </main>

                {/* =================================================
                    SIDEBAR
                ================================================= */}

                <aside
                  className="
                    min-w-0
                    border-t
                    border-[#DFE1E6]
                    bg-[#FAFBFC]
                    px-6
                    py-6
                    md:border-l
                    md:border-t-0
                  "
                >
                  <div className="space-y-7">
                    {/* Status */}

                    <div>
                      <p
                        className="
                          mb-2
                          text-[11px]
                          font-bold
                          uppercase
                          tracking-wide
                          text-[#6B778C]
                        "
                      >
                        Status
                      </p>

                      <Badge
                        className="
                          border-0
                          bg-[#DEEBFF]
                          px-2.5
                          py-1
                          text-xs
                          font-semibold
                          text-[#0052CC]
                        "
                      >
                        {localIssue.status || "TODO"}
                      </Badge>
                    </div>

                    {/* Type */}

                    <div>
                      <p
                        className="
                          mb-2
                          text-[11px]
                          font-bold
                          uppercase
                          tracking-wide
                          text-[#6B778C]
                        "
                      >
                        Type
                      </p>

                      <div
                        className="
                          flex
                          items-center
                          gap-2
                          text-sm
                          font-medium
                          text-[#172B4D]
                        "
                      >
                        <span>
                          {typeIcons[localIssue.type] ||
                            "✓"}
                        </span>

                        <span>
                          {typeLabels[
                            localIssue.type
                          ] ||
                            localIssue.type}
                        </span>
                      </div>
                    </div>

                    {/* Priority */}

                    <div>
                      <p
                        className="
                          mb-2
                          text-[11px]
                          font-bold
                          uppercase
                          tracking-wide
                          text-[#6B778C]
                        "
                      >
                        Priority
                      </p>

                      <Badge
                        className={`
                          border-0
                          px-2.5
                          py-1
                          text-xs
                          font-semibold
                          ${
                            localIssue.priority ===
                            "HIGH"
                              ? "bg-[#FFEBE6] text-[#BF2600]"
                              : localIssue.priority ===
                                  "LOW"
                                ? "bg-[#E3FCEF] text-[#006644]"
                                : "bg-[#FFF0B3] text-[#7A5C00]"
                          }
                        `}
                      >
                        {priorityLabels[
                          localIssue.priority
                        ] ||
                          localIssue.priority ||
                          "Medium"}
                      </Badge>
                    </div>

                    {/* Assignee */}

                    <div>
                      <p
                        className="
                          mb-3
                          text-[11px]
                          font-bold
                          uppercase
                          tracking-wide
                          text-[#6B778C]
                        "
                      >
                        Assignee
                      </p>

                      {assignee ? (
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar className="h-9 w-9 shrink-0">
                            <AvatarImage
                              src={assignee.avatar}
                            />

                            <AvatarFallback
                              className="
                                bg-[#DEEBFF]
                                text-[#0052CC]
                              "
                            >
                              {assignee.name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "U"}
                            </AvatarFallback>
                          </Avatar>

                          <div className="min-w-0">
                            <p
                              className="
                                truncate
                                text-sm
                                font-semibold
                                text-[#172B4D]
                              "
                            >
                              {assignee.name}
                            </p>

                            <p
                              className="
                                truncate
                                text-xs
                                text-[#6B778C]
                              "
                            >
                              {assignee.email}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span
                          className="
                            text-sm
                            italic
                            text-[#6B778C]
                          "
                        >
                          Unassigned
                        </span>
                      )}
                    </div>
                  </div>
                </aside>
              </div>
            </div>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div
              className="
                flex
                min-h-12
                flex-wrap
                items-center
                gap-x-8
                gap-y-1
                border-t
                border-[#DFE1E6]
                bg-[#F7F8FA]
                px-6
                py-3
              "
            >
              <div>
                <span className="text-xs text-[#6B778C]">
                  Created
                </span>

                <span className="ml-2 text-xs font-medium text-[#42526E]">
                  {formatDate(localIssue.createdAt)}
                </span>
              </div>

              <div>
                <span className="text-xs text-[#6B778C]">
                  Updated
                </span>

                <span className="ml-2 text-xs font-medium text-[#42526E]">
                  {formatDate(localIssue.updatedAt)}
                </span>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default IssueModel;