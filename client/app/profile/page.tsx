"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

import {
  AlertCircle,
  CheckCircle2,
  Mail,
  Save,
} from "lucide-react";

import React, {
  useEffect,
  useRef,
  useState,
} from "react";

const page = () => {
  const {
    user,
    login,
  } = useAuth();

  // =========================
  // PROFILE PICTURE
  // =========================

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileImage, setProfileImage] = useState(
    user?.avatar || ""
  );

  // =========================
  // PROFILE FORM
  // =========================

  const [name, setName] = useState(
    user?.name || ""
  );

  const [isSaving, setIsSaving] = useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  // =========================
  // KEEP FORM IN SYNC WITH USER
  // =========================

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setProfileImage(user.avatar || "");
    }
  }, [user]);

  // =========================
  // OPEN FILE PICKER
  // =========================

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  // =========================
  // SELECT PROFILE PICTURE
  // =========================

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Only allow images
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    // Maximum 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB.");
      return;
    }

    // Preview selected image
    const imageUrl = URL.createObjectURL(file);

    setProfileImage(imageUrl);
  };

  // =========================
  // SAVE PROFILE
  // =========================

  const handleSaveChanges = async () => {
    if (!user?.id) {
      setErrorMessage("User information is not available.");
      return;
    }

    if (!name.trim()) {
      setErrorMessage("Name cannot be empty.");
      setSuccessMessage("");
      return;
    }

    try {
      setIsSaving(true);

      setErrorMessage("");
      setSuccessMessage("");

      const response = await axiosInstance.put(
        `/api/users/${user.id}`,
        {
          name: name.trim(),
          group: user.group || "",
          avatar: user.avatar || "",
        }
      );

      const updatedUser = response.data;

      // Update AuthContext + localStorage immediately
      login(updatedUser);

      // Keep selected preview
      if (profileImage) {
        setProfileImage(profileImage);
      }

      setSuccessMessage(
        "Profile updated successfully."
      );
    } catch (error: any) {
      console.error(
        "Failed to update profile:",
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // =========================
  // USER NOT FOUND
  // =========================

  if (!user) {
    return (
      <div className="p-6">
        User not found
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="flex h-full flex-col overflow-auto bg-[#F4F5F7] p-6">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-[#172B4D]">
          Profile Settings
        </h1>

        <p className="text-[#5E6C84]">
          Manage your personal information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* =========================
            PROFILE CARD
        ========================= */}

        <Card className="lg:col-span-1">

          <CardHeader>
            <CardTitle className="text-[#172B4D]">
              About You
            </CardTitle>
          </CardHeader>

          <CardContent>

            <div className="space-y-4">

              {/* PROFILE */}

              <div className="flex flex-col items-center">

                <Avatar className="mb-4 h-20 w-20">

                  <AvatarImage
                    src={
                      profileImage ||
                      "/placeholder.svg"
                    }
                    alt={user.name}
                  />

                  <AvatarFallback>
                    {user.name
                      .charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>

                </Avatar>

                {/* UPDATED NAME */}

                <h2 className="text-xl font-semibold text-[#172B4D]">
                  {user.name}
                </h2>

                <Badge className="mt-2">
                  {user.role}
                </Badge>

              </div>

              {/* USER INFORMATION */}

              <div className="space-y-3 border-t pt-4">

                <div className="flex items-center gap-3 text-sm">

                  <Mail className="h-4 w-4 text-[#5E6C84]" />

                  <span className="text-[#172B4D]">
                    {user.email}
                  </span>

                </div>

                <div className="flex items-center gap-3 text-sm">

                  <span className="text-[#5E6C84]">
                    Group:
                  </span>

                  {user.group ? (
                    <Badge variant="outline">
                      {user.group}
                    </Badge>
                  ) : (
                    <span className="text-[#A5ADBA]">
                      Not assigned
                    </span>
                  )}

                </div>

              </div>

              {/* EDIT PROFILE PICTURE */}

              <Button
                type="button"
                onClick={
                  handleProfilePictureClick
                }
                className="w-full bg-[#0052CC] text-white hover:bg-[#0747A6]"
              >
                Edit Profile Picture
              </Button>

              {/* HIDDEN FILE INPUT */}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={
                  handleProfilePictureChange
                }
              />

            </div>

          </CardContent>

        </Card>

        {/* =========================
            SETTINGS
        ========================= */}

        <div className="space-y-6 lg:col-span-2">

          {/* PERSONAL INFORMATION */}

          <Card>

            <CardHeader>

              <CardTitle className="text-[#172B4D]">
                Personal Information
              </CardTitle>

              <CardDescription>
                Update your contact details
              </CardDescription>

            </CardHeader>

            <CardContent>

              <div className="space-y-4">

                {/* SUCCESS MESSAGE */}

                {successMessage && (
                  <div className="flex items-center gap-3 rounded-lg border border-[#ABF5D1] bg-[#E3FCEF] px-4 py-3 text-sm text-[#006644]">

                    <CheckCircle2 className="h-5 w-5" />

                    <span>
                      {successMessage}
                    </span>

                  </div>
                )}

                {/* ERROR MESSAGE */}

                {errorMessage && (
                  <div className="flex items-center gap-3 rounded-lg border border-[#FFBDAD] bg-[#FFEBE6] px-4 py-3 text-sm text-[#BF2600]">

                    <AlertCircle className="h-5 w-5" />

                    <span>
                      {errorMessage}
                    </span>

                  </div>
                )}

                {/* FULL NAME */}

                <div>

                  <label
                    htmlFor="full-name"
                    className="mb-1 block text-sm font-semibold text-[#172B4D]"
                  >
                    Full Name
                  </label>

                  <Input
                    id="full-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setSuccessMessage("");
                      setErrorMessage("");
                    }}
                    className="focus-visible:ring-[#0052CC]"
                  />

                </div>

                {/* EMAIL */}

                <div>

                  <label
                    htmlFor="email"
                    className="mb-1 block text-sm font-semibold text-[#172B4D]"
                  >
                    Email
                  </label>

                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="bg-[#F4F5F7] text-[#6B778C]"
                  />

                </div>

                {/* ROLE + TEAM */}

                <div className="grid grid-cols-2 gap-4">

                  {/* ROLE */}

                  <div>

                    <label
                      htmlFor="role"
                      className="mb-1 block text-sm font-semibold text-[#172B4D]"
                    >
                      Role
                    </label>

                    <Input
                      id="role"
                      disabled
                      value={user.role || ""}
                      className="bg-[#F4F5F7] text-[#6B778C]"
                    />

                  </div>

                  {/* TEAM */}

                  <div>

                    <label
                      htmlFor="team"
                      className="mb-1 block text-sm font-semibold text-[#172B4D]"
                    >
                      Team
                    </label>

                    <Input
                      id="team"
                      disabled
                      value={user.group || ""}
                      placeholder="Not assigned"
                      className="bg-[#F4F5F7] text-[#6B778C]"
                    />

                  </div>

                </div>

                {/* SAVE */}

                <div className="flex justify-end pt-4">

                  <Button
                    type="button"
                    onClick={handleSaveChanges}
                    disabled={
                      isSaving ||
                      !name.trim()
                    }
                    className="bg-[#0052CC] text-white hover:bg-[#0747A6]"
                  >

                    <Save className="mr-2 h-4 w-4" />

                    {isSaving
                      ? "Saving..."
                      : "Save Changes"}

                  </Button>

                </div>

              </div>

            </CardContent>

          </Card>

          {/* =========================
              ACTIVITY
          ========================= */}

          <Card>

            <CardHeader>

              <CardTitle className="text-[#172B4D]">
                Activity
              </CardTitle>

              <CardDescription>
                Your account activity information
              </CardDescription>

            </CardHeader>

            <CardContent>

              <div className="space-y-3">

                {/* ACCOUNT CREATED */}

                <div className="flex justify-between text-sm">

                  <span className="text-[#5E6C84]">
                    Account Created
                  </span>

                  <span className="font-semibold text-[#172B4D]">

                    {user.createdAt
                      ? new Date(
                          user.createdAt
                        ).toLocaleDateString()
                      : "—"}

                  </span>

                </div>

                {/* LAST LOGIN */}

                <div className="flex justify-between border-t pt-3 text-sm">

                  <span className="text-[#5E6C84]">
                    Last Login
                  </span>

                  <span className="font-semibold text-[#172B4D]">
                    Today at 2:45 PM
                  </span>

                </div>

              </div>

            </CardContent>

          </Card>

        </div>

      </div>

    </div>
  );
};

export default page;