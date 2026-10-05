"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";

export default function Page() {
  const router = useRouter();

  const [projectData, setProjectData] = useState({
    name: "",
    key: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();

  if (!user) {
    router.push("/login");
    return null;
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let { name, value } = e.target;

    if (name === "key") {
      value = value.toUpperCase().replace(/[^A-Z]/g, "");
    }

    setProjectData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleCreateProject = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError("");

      if (!projectData.name.trim()) {
        setError("Project name is required");
        setIsLoading(false);
        return;
      }

      if (!projectData.key.trim()) {
        setError("Project key is required");
        setIsLoading(false);
        return;
      }

      if (projectData.key.length > 5) {
        setError("Project key must be 5 characters or less");
        setIsLoading(false);
        return;
      }

      const response = await axiosInstance.post("/api/projects", {
        name: projectData.name,
        key: projectData.key,
        ownerId: user.id,
      });

      // Tell the Sidebar that a new project was created
      window.dispatchEvent(
        new CustomEvent("project-created", {
          detail: response.data,
        })
      );

      router.push("/");
    } catch (err) {
      console.error("Failed to create project:", err);
      setError("Failed to create project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <main className="mx-auto w-full max-w-5xl px-6 py-10 lg:px-10">
        {/* Breadcrumb */}
        <div className="mb-3 flex items-center gap-2 text-sm">
          <span className="text-[#6B778C]">Projects</span>
          <span className="text-[#A5ADBA]">/</span>
          <span className="font-medium text-[#172B4D]">
            Create project
          </span>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#172B4D]">
            Create a new project
          </h1>

          <p className="mt-2 text-sm text-[#6B778C]">
            Set up a new project to start managing your work.
          </p>
        </div>

        {/* Project Card */}
        <Card className="overflow-hidden rounded-xl border border-[#DFE1E6] bg-white shadow-sm">
          <CardHeader className="border-b border-[#DFE1E6] px-7 py-6">
            <CardTitle className="text-lg font-semibold text-[#172B4D]">
              Project details
            </CardTitle>

            <CardDescription className="mt-1 text-sm text-[#6B778C]">
              Provide the basic information needed to create
              your project.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-7 py-7">
            <form
              onSubmit={handleCreateProject}
              className="space-y-6"
            >
              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-3 rounded-lg border border-[#FFBDAD] bg-[#FFEBE6] px-4 py-3 text-sm text-[#BF2600]">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Project Name */}
              <div className="space-y-2">
                <label
                  htmlFor="project-name"
                  className="text-sm font-semibold text-[#172B4D]"
                >
                  Project name
                  <span className="ml-1 text-[#DE350B]">
                    *
                  </span>
                </label>

                <Input
                  id="project-name"
                  type="text"
                  name="name"
                  placeholder="e.g., Platform Services"
                  required
                  value={projectData.name}
                  onChange={handleInputChange}
                  className="h-11 rounded-md border-[#DFE1E6] bg-white text-[#172B4D] placeholder:text-[#7A869A] focus:border-[#0052CC] focus:ring-[#0052CC]"
                />

                <p className="text-xs text-[#6B778C]">
                  Choose a clear name that describes what your
                  team is working on.
                </p>
              </div>

              {/* Project Key */}
              <div className="space-y-2">
                <label
                  htmlFor="project-key"
                  className="text-sm font-semibold text-[#172B4D]"
                >
                  Project key
                  <span className="ml-1 text-[#DE350B]">
                    *
                  </span>
                </label>

                <div className="flex items-center gap-3">
                  <Input
                    id="project-key"
                    type="text"
                    name="key"
                    placeholder="e.g., PS"
                    maxLength={5}
                    required
                    value={projectData.key}
                    onChange={handleInputChange}
                    className="h-11 max-w-xs rounded-md border-[#DFE1E6] bg-white font-semibold uppercase tracking-wide text-[#172B4D] placeholder:font-normal placeholder:tracking-normal placeholder:text-[#7A869A] focus:border-[#0052CC] focus:ring-[#0052CC]"
                  />

                  {projectData.key && (
                    <div className="rounded-md bg-[#DEEBFF] px-3 py-2 text-sm font-semibold text-[#0747A6]">
                      {projectData.key}-1
                    </div>
                  )}
                </div>

                <p className="text-xs text-[#6B778C]">
                  Used for issue keys such as{" "}
                  <span className="font-medium text-[#172B4D]">
                    {projectData.key || "PS"}-1
                  </span>
                  . Letters only, maximum 5 characters.
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-[#DFE1E6]" />

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                  className="h-10 border-[#DFE1E6] bg-white px-5 font-medium text-[#172B4D] hover:bg-[#F4F5F7]"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-10 bg-[#0052CC] px-5 font-semibold text-white hover:bg-[#0747A6]"
                >
                  {isLoading
                    ? "Creating..."
                    : "Create project"}

                  {!isLoading && (
                    <ArrowRight className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Helpful Information */}
        <div className="mt-5 rounded-lg border border-[#DFE1E6] bg-[#F4F5F7] px-5 py-4">
          <p className="text-sm text-[#5E6C84]">
            <span className="font-semibold text-[#172B4D]">
              Tip:
            </span>{" "}
            After creating your project, you can add team
            members and start creating issues.
          </p>
        </div>
      </main>
    </div>
  );
}