"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { AlertCircle, ArrowRight, FolderKanban } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const page = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    key: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
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
    setIsLoading(true);

    try {
      // Validate inputs
      if (!formData.name.trim()) {
        setError("Project name is required");
        setIsLoading(false);
        return;
      }

      if (!formData.key.trim()) {
        setError("Project key is required");
        setIsLoading(false);
        return;
      }

      await axiosInstance.post("/api/projects", {
        name: formData.name,
        key: formData.key,
        ownerId: user?.id,
      });

      // Redirect to board
      router.push("/");
    } catch (err) {
      setError("Failed to create project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleskip = () => {
    router.push("/");
  };

  if (user === null) {
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F5F7] px-4 py-10">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-5 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#0052CC] text-white shadow-md">
              <FolderKanban className="h-7 w-7" />
            </div>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-[#172B4D]">
            Create your first project
          </h1>

          <p className="mt-2 text-sm text-[#6B778C]">
            Welcome, {user?.name}!
          </p>
        </div>

        {/* Card */}
        <Card className="overflow-hidden rounded-xl border border-[#DFE1E6] bg-white shadow-lg">
          <CardHeader className="border-b border-[#DFE1E6] px-6 py-5">
            <CardTitle className="text-lg font-semibold text-[#172B4D]">
              Set up your project
            </CardTitle>

            <CardDescription className="mt-1 text-sm text-[#6B778C]">
              Give your project a name and key to get started
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error */}
              {error && (
                <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Project Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#172B4D]">
                  Project name
                </label>

                <Input
                  type="text"
                  name="name"
                  placeholder="e.g., Platform Services"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="h-11 border-[#C1C7D0] bg-white text-sm shadow-none focus-visible:border-[#0052CC] focus-visible:ring-2 focus-visible:ring-[#DEEBFF]"
                />

                <p className="text-xs text-[#6B778C]">
                  This is the display name for your project
                </p>
              </div>

              {/* Project Key */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#172B4D]">
                  Project key
                </label>

                <Input
                  type="text"
                  name="key"
                  placeholder="e.g., PS"
                  maxLength={5}
                  required
                  value={formData.key}
                  onChange={handleChange}
                  className="h-11 border-[#C1C7D0] bg-white text-sm uppercase shadow-none focus-visible:border-[#0052CC] focus-visible:ring-2 focus-visible:ring-[#DEEBFF]"
                />

                <p className="text-xs leading-5 text-[#6B778C]">
                  Used for issue keys (e.g.,{" "}
                  <span className="font-medium text-[#172B4D]">
                    {formData.key || "PS"}-1
                  </span>
                  ). Letters only, max 5 characters.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse gap-3 border-t border-[#DFE1E6] pt-5 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleskip}
                  disabled={isLoading}
                  className="h-10 border-[#C1C7D0] px-5 text-sm font-medium text-[#172B4D] hover:bg-[#F4F5F7]"
                >
                  Skip for now
                </Button>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-10 bg-[#0052CC] px-5 text-sm font-medium text-white shadow-sm hover:bg-[#0747A6]"
                >
                  {isLoading
                    ? "Creating project..."
                    : "Create project"}

                  {!isLoading && (
                    <ArrowRight className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer information */}
        <div className="mt-5 text-center">
          <p className="mx-auto max-w-lg text-xs leading-5 text-[#6B778C]">
            You can create additional projects anytime from the
            Projects page after you get started.
          </p>
        </div>
      </div>
    </div>
  );
};

export default page;