"use client";

import React from "react";

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

  const [projectData, setProjectData] = useState({ name: "", key: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  if (!user) {
    router.push("/login");
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;

    if (name === "key") {
      value = value.toUpperCase().replace(/[^A-Z]/g, "");
    }

    setProjectData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
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

      await axiosInstance.post("/api/projects", {
        name: projectData.name,
        key: projectData.key,
        ownerId: user.id,
      });

      router.push("/");
    } catch (err) {
      setError("Failed to create project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div>
        <h1>
          Create a new project
        </h1>

        <p>
          Set up a new project to start managing your work
        </p>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>
              Project details
            </CardTitle>

            <CardDescription>
              Provide basic information about your project
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleCreateProject}>
              {error && (
                <div>
                  <AlertCircle />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label>
                  Project name
                </label>

                <Input
                  type="text"
                  name="name"
                  placeholder="e.g., Platform Services"
                  required
                  value={projectData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label>
                  Project key
                </label>

                <Input
                  type="text"
                  name="key"
                  placeholder="e.g., PS"
                  maxLength={5}
                  required
                  value={projectData.key}
                  onChange={handleInputChange}
                />

                <p>
                  Used for issue keys (e.g., {projectData.key || "PS"}-1).
                  Letters only, max 5 characters.
                </p>
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create project"}
                  {!isLoading && <ArrowRight />}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}