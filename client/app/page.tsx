import KanbanBoard from "@/components/kanbanBoard";

import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { ChevronRight, MoreHorizontal, Share2 } from "lucide-react";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="flex h-full min-h-screen flex-col overflow-hidden bg-white p-6">
      <div className="mb-6 flex flex-col gap-5">
        <div className="flex items-center gap-2 text-sm text-[#5E6C84]">
          <span className="font-medium">Projects</span>

          <ChevronRight className="h-4 w-4 shrink-0" />

          <span className="font-medium">Platform Services</span>

          <ChevronRight className="h-4 w-4 shrink-0" />

          <span className="font-medium text-[#172B4D]">
            Kanban Board
          </span>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#172B4D]">
            Kanban Board
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

        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <Avatar
                key={i}
                className="h-8 w-8 rounded-full border-2 border-white"
              >
                <AvatarImage
                  src={`https://i.pravatar.cc/150?u=${i}`}
                  className="rounded-full object-cover"
                />

                <AvatarFallback className="bg-[#DFE1E6] text-xs text-[#172B4D]">
                  U{i}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-full border-dashed border-[#C1C7D0] bg-white px-4 text-xs text-[#5E6C84] hover:bg-[#F4F5F7]"
          >
            Only My Issues
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-full border-dashed border-[#C1C7D0] bg-white px-4 text-xs text-[#5E6C84] hover:bg-[#F4F5F7]"
          >
            Recently Updated
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center text-sm text-[#6B778C]">
              Loading board...
            </div>
          }
        >
          <KanbanBoard />
        </Suspense>
      </div>
    </div>
  );
}