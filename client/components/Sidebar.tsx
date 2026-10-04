"use client";

import {
  ChevronDown,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Plus,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import CreateIssuemodel from "./CreateIssuemodel";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

const Sidebar = () => {
  const router = useRouter();
  const { user, logout, selectedProject, setSelectedProject } = useAuth();

  const [project, setProject] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showCreateIssueModel, setShowCreateIssueModel] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      try {
        setLoading(true);

        const res = await axiosInstance.get("/api/projects");

        const userProjects = res.data.filter(
          (project: any) =>
            project.ownerId === user.id ||
            project.memberIds?.includes(user.id),
        );

        setProject(userProjects);

        if (!selectedProject && userProjects.length > 0) {
          setSelectedProject(userProjects[0]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  const redirectProject = () => {
    router.push("/create-project");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <aside className="flex h-screen w-64 items-center justify-center border-r bg-white">
        <p className="text-sm text-slate-500">Loading projects...</p>
      </aside>
    );
  }

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0052CC] text-white">
            <FolderKanban className="h-5 w-5" />
          </div>

          <span className="text-lg font-semibold text-[#172B4D]">
            Jira Clone
          </span>
        </div>

        {/* Project selector */}
        {selectedProject && (
          <div className="relative border-b px-3 py-3">
            <button
              onClick={() => setShowProjectMenu(!showProjectMenu)}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-slate-100"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#172B4D]">
                  {selectedProject.name}
                </p>

                <p className="text-xs text-slate-500">
                  {selectedProject.key}
                </p>
              </div>

              <ChevronDown className="h-4 w-4 text-slate-500" />
            </button>

            {showProjectMenu && (
              <div className="absolute left-3 right-3 top-17 z-50 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                <p className="px-2 py-1 text-xs font-semibold uppercase text-slate-400">
                  Projects
                </p>

                {project.map((project: any) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      setSelectedProject(project);
                      setShowProjectMenu(false);
                    }}
                    className="flex w-full items-center rounded-md px-2 py-2 text-sm hover:bg-slate-100"
                  >
                    <span className="truncate">{project.name}</span>
                  </button>
                ))}

                <div className="my-2 border-t" />

                <button
                  onClick={redirectProject}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-[#0052CC] hover:bg-blue-50"
                >
                  <Plus className="h-4 w-4" />
                  Create project
                </button>
              </div>
            )}
          </div>
        )}

        {/* Search */}
        <div className="px-3 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              placeholder="Search..."
              className="h-9 border-slate-200 pl-9 text-sm focus-visible:ring-[#0052CC]"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3">
          <NavItem
            href="/"
            icon={<LayoutDashboard />}
            label="Kanban Board"
          />

          <NavItem
            href="/backlog"
            icon={<ListTodo />}
            label="Backlog"
          />

          <NavItem
            href="/projects"
            icon={<FolderKanban />}
            label="Projects"
          />

          <NavItem
            href="/team"
            icon={<Users />}
            label="Team"
          />

          <NavItem
            href="/profile"
            icon={<Settings />}
            label="Profile"
          />
        </nav>

        {/* Bottom section */}
        <div className="border-t border-slate-200 p-3">
          {/* User */}
          {user && (
            <div className="mb-3 flex items-center gap-3 rounded-md p-2">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.name}
                />

                <AvatarFallback className="bg-blue-100 text-[#0052CC]">
                  {user.name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#172B4D]">
                  {user.name}
                </p>

                <p className="truncate text-xs text-slate-500">
                  {user.email}
                </p>
              </div>
            </div>
          )}

          {/* Create Issue */}
          <Button
            onClick={() => setShowCreateIssueModel(true)}
            className="mb-2 w-full bg-[#0052CC] text-white hover:bg-[#0747A6]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Issue
          </Button>

          {/* Logout */}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </aside>

      <CreateIssuemodel
        isOpen={showCreateIssueModel}
        onClose={() => setShowCreateIssueModel(false)}
      />
    </>
  );
};

export default Sidebar;

function NavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#172B4D]"
    >
      <span className="flex h-5 w-5 items-center justify-center">
        {icon}
      </span>

      <span>{label}</span>
    </Link>
  );
}