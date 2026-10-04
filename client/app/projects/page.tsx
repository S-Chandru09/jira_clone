"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import {
  Plus,
  Users,
  FolderKanban,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Page = () => {
  const router = useRouter();

  const { user, setSelectedProject } = useAuth();

  const [project, setProject] = useState<any[]>([]);
  const [issuesbyproject, setIssuesByProject] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // =========================
  // FETCH PROJECTS
  // =========================
  const fetchProject = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get("/api/projects");

      const userProject = res.data?.filter(
        (p: any) =>
          p.ownerId === user?.id ||
          p.memberIds?.includes(user?.id)
      );

      setProject(userProject);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FETCH ISSUES FOR PROJECT
  // =========================
  const fetchIssuesForProject = async (projectId: string) => {
    try {
      const res = await axiosInstance.get(
        `/api/issues/project/${projectId}`
      );

      setIssuesByProject((prev: any) => ({
        ...prev,
        [projectId]: res.data,
      }));
    } catch (error) {
      console.error(
        `Failed to fetch issues for project ${projectId}:`,
        error
      );
    }
  };

  // =========================
  // LOAD PROJECTS
  // =========================
  useEffect(() => {
    if (!user) return;

    fetchProject();
  }, [user]);

  // =========================
  // LOAD PROJECT ISSUES
  // =========================
  useEffect(() => {
    project.forEach((project: any) => {
      fetchIssuesForProject(project.id);
    });
  }, [project]);

  // =========================
  // CREATE PROJECT
  // =========================
  const redirectProject = () => {
    router.push("/create-project");
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F8FA] p-6 lg:p-8">
        <div className="w-full">
          <div className="mb-8">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />

            <div className="mt-3 h-9 w-40 animate-pulse rounded bg-slate-200" />

            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-slate-200" />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[285px] animate-pulse rounded-xl border border-[#DFE1E6] bg-white"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] p-6 lg:p-8">
      <div className="w-full max-w-[1400px] mx-auto">

        {/* =========================
            HEADER
        ========================= */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div>
            {/* Breadcrumb */}
            <div className="mb-2 flex items-center gap-2 text-sm text-[#6B778C]">
              <FolderKanban className="h-4 w-4 text-[#5E6C84]" />

              <span>Projects</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold tracking-tight text-[#172B4D]">
              Projects
            </h1>

            {/* Description */}
            <p className="mt-1 text-sm text-[#6B778C]">
              Manage and view all your projects
            </p>
          </div>

          {/* Create Project */}
          <Button
            onClick={redirectProject}
            className="h-10 bg-[#0052CC] px-4 font-medium text-white shadow-sm hover:bg-[#0747A6]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>

        {/* =========================
            PROJECT LIST
        ========================= */}
        {project.length > 0 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

            {project.map((project: any) => {
              const projectIssues =
                issuesbyproject[project.id] || [];

              return (
                <Card
                  key={project.id}
                  className="
                    group
                    flex
                    min-h-[285px]
                    flex-col
                    overflow-hidden
                    rounded-xl
                    border
                    border-[#DFE1E6]
                    bg-white
                    shadow-sm
                    transition-all
                    duration-200
                    hover:-translate-y-[2px]
                    hover:border-[#B3BAC5]
                    hover:shadow-md
                  "
                >

                  {/* =========================
                      CARD HEADER
                  ========================= */}
                  <CardHeader className="pb-3">

                    <div className="flex items-start justify-between gap-4">

                      {/* Project name */}
                      <div className="min-w-0">

                        <CardTitle className="truncate text-xl font-semibold text-[#172B4D]">
                          {project.name}
                        </CardTitle>

                        <CardDescription className="mt-1 text-sm text-[#6B778C]">
                          Key:{" "}
                          <span className="font-medium text-[#42526E]">
                            {project.key}
                          </span>
                        </CardDescription>

                      </div>

                      {/* Project key */}
                      <Badge
                        variant="outline"
                        className="
                          shrink-0
                          rounded-md
                          border-[#B3D4FF]
                          bg-[#DEEBFF]
                          px-2.5
                          py-1
                          text-xs
                          font-semibold
                          text-[#0052CC]
                        "
                      >
                        {project.key}
                      </Badge>

                    </div>
                  </CardHeader>

                  {/* =========================
                      CARD CONTENT
                  ========================= */}
                  <CardContent className="flex flex-1 flex-col pt-2">

                    {/* Description */}
                    <p className="min-h-[48px] text-sm leading-6 text-[#6B778C]">
                      {project.description ||
                        "No description available for this project."}
                    </p>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* =========================
                        PROJECT INFORMATION
                    ========================= */}
                    <div className="mb-5 flex items-center gap-6 border-t border-[#F0F1F2] pt-4">

                      {/* Members */}
                      <div className="flex items-center gap-2 text-sm">

                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F4F5F7]">
                          <Users className="h-4 w-4 text-[#5E6C84]" />
                        </div>

                        <div>
                          <p className="text-xs text-[#6B778C]">
                            Members
                          </p>

                          <p className="font-medium text-[#172B4D]">
                            {project.memberIds?.length || 0}
                          </p>
                        </div>

                      </div>

                      {/* Issues */}
                      <div className="flex items-center gap-2 text-sm">

                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F4F5F7]">
                          <FolderKanban className="h-4 w-4 text-[#5E6C84]" />
                        </div>

                        <div>
                          <p className="text-xs text-[#6B778C]">
                            Issues
                          </p>

                          <p className="font-medium text-[#172B4D]">
                            {projectIssues.length}
                          </p>
                        </div>

                      </div>

                    </div>

                    {/* =========================
                        VIEW BOARD
                    ========================= */}
                    <Link
                      href="/"
                      onClick={() =>
                        setSelectedProject(project)
                      }
                      className="block"
                    >
                      <Button
                        variant="outline"
                        className="
                          h-10
                          w-full
                          rounded-md
                          border-[#DFE1E6]
                          bg-white
                          font-medium
                          text-[#172B4D]
                          transition-colors
                          hover:border-[#B3BAC5]
                          hover:bg-[#F4F5F7]
                          group-hover:border-[#B3BAC5]
                        "
                      >
                        View Board

                        <ArrowRight
                          className="
                            ml-2
                            h-4
                            w-4
                            transition-transform
                            duration-200
                            group-hover:translate-x-1
                          "
                        />
                      </Button>
                    </Link>

                  </CardContent>
                </Card>
              );
            })}

          </div>
        )}

        {/* =========================
            EMPTY STATE
        ========================= */}
        {project.length === 0 && (
          <Card className="rounded-xl border border-dashed border-[#B3BAC5] bg-white shadow-sm">

            <CardContent className="flex min-h-[400px] flex-col items-center justify-center px-6 py-16 text-center">

              {/* Icon */}
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#DEEBFF]">
                <FolderKanban className="h-8 w-8 text-[#0052CC]" />
              </div>

              {/* Title */}
              <h2 className="text-xl font-semibold text-[#172B4D]">
                No projects yet
              </h2>

              {/* Description */}
              <p className="mt-2 max-w-md text-sm leading-6 text-[#6B778C]">
                Create your first project to start managing
                issues and collaborating with your team.
              </p>

              {/* Create first project */}
              <Button
                onClick={redirectProject}
                className="mt-6 h-10 bg-[#0052CC] px-5 font-medium text-white hover:bg-[#0747A6]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create your first project
              </Button>

            </CardContent>
          </Card>
        )}

      </div>
    </main>
  );
};

export default Page;