"use client";

import { useUser } from "@clerk/nextjs";

import { Avatar, AvatarImage } from "@/components/ui/avatar";

export const UserAvatar = () => {
  const { user } = useUser();

  return (
    <Avatar className="h-12 w-12">
      <AvatarImage src={user?.imageUrl} />
    </Avatar>
  );
};
