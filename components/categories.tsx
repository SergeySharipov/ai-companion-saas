"use client";

import { cn } from "@/lib/utils";
import { Category } from "@prisma/client";

interface CategoriesProps {
  data: Category[];
}

export const Categories = ({ data }: CategoriesProps) => {
  return (
    <div className="flex w-full space-x-2 overflow-x-auto p-1">
      {data.map((item) => (
        <button
          key={item.id}
          className={cn(
            "flex items-center rounded-md bg-primary/10 px-2 py-3 text-center text-xs transition hover:opacity-75 md:px-4 md:py-3 md:text-sm",
          )}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
};
