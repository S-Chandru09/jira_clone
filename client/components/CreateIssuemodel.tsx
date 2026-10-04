"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { AlertCircle } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

const CreateIssuemodel = ({ isOpen, onClose }: any) => {
  const { user, selectedProject } = useAuth();

  const [isloading, setIsloading] = useState(false);
  const [error, setError] = useState("");
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "TASK",
    priority: "MEDIUM",
    assigneeId: "",
  });

  useEffect(() => {
    if (!selectedProject?.id || !isOpen) return;

    const fetchMembers = async () => {
      try {
        const res = await axiosInstance.get(
          `/api/projects/${selectedProject.id}`
        );

        setTeamMembers(res.data.members || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchMembers();
  }, [selectedProject?.id, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !selectedProject) {
      setError("No project and no user present");
      return;
    }

    try {
      setIsloading(true);

      await axiosInstance.post("/api/issues", {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        priority: formData.priority,
        status: "TODO",
        projectId: selectedProject.id,
        reporterId: user.id,
        assigneeId: formData.assigneeId || null,
        order: 0,
      });

      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsloading(false);

      setFormData({
        title: "",
        description: "",
        type: "TASK",
        priority: "MEDIUM",
        assigneeId: "",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-0 shadow-2xl">
        <DialogHeader className="border-b border-slate-200 px-6 py-5">
          <DialogTitle className="text-xl font-semibold text-[#172B4D]">
            Create Issue
          </DialogTitle>

          <p className="mt-1 text-sm text-[#6B778C]">
            Create a new issue for your project.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Issue Title */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#172B4D]">
              Issue Title *
            </label>

            <Input
              type="text"
              name="title"
              placeholder="e.g., Implement user authentication"
              required
              value={formData.title}
              onChange={handleChange}
              className="h-10 border-slate-300 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-[#0052CC]"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#172B4D]">
              Description
            </label>

            <Textarea
              name="description"
              placeholder="Add a description (optional)"
              value={formData.description}
              onChange={handleChange}
              className="min-h-28 resize-none border-slate-300 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-[#0052CC]"
            />
          </div>

          {/* Type / Priority / Assignee */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {/* Type */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#172B4D]">
                Type
              </label>

              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-[#172B4D] outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-blue-100"
              >
                <option value="TASK">Task</option>
                <option value="BUG">Bug</option>
                <option value="STORY">Story</option>
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#172B4D]">
                Priority
              </label>

              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-[#172B4D] outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-blue-100"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            {/* Assignee */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#172B4D]">
                Assignee
              </label>

              <select
                name="assigneeId"
                value={formData.assigneeId}
                onChange={handleChange}
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-[#172B4D] outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Unassigned</option>

                {teamMembers.map((member: any) => (
                  <option
                    key={member.id}
                    value={member.id}
                  >
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isloading}
              className="border-slate-300 px-5 text-sm text-[#5E6C84] hover:bg-slate-50"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isloading}
              className="bg-[#0052CC] px-5 text-sm text-white hover:bg-[#0747A6]"
            >
              {isloading ? "Creating..." : "Create Issue"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateIssuemodel;