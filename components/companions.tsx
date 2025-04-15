import Image from "next/image";
import Link from "next/link";
import { Companion } from "@prisma/client";
import { MessagesSquare } from "lucide-react";

import { Card, CardFooter, CardHeader } from "@/components/ui/card";

interface CompanionsProps {
  data?: (Companion & { _count?: { messages?: number } })[];
}

export const Companions = ({ data }: CompanionsProps) => {
  if (!data || !data.length) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 pt-10">
        <div className="relative h-60 w-60">
          <Image fill className="grayscale" src="/empty.png" alt="Empty" />
        </div>
        <p className="text-sm text-muted-foreground">No companions found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 pb-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {data.map((item) => (
        <Link
          className="cursor-pointer"
          key={item.id}
          href={`/chat/${item.id}`}
        >
          <Card className="flex h-full flex-col rounded-xl border-0 bg-primary/10 transition hover:opacity-75">
            <CardHeader className="flex items-center justify-center text-center text-muted-foreground">
              <div className="relative h-32 w-32">
                <Image
                  src={item.src}
                  fill
                  sizes="128px"
                  loading="lazy"
                  className="rounded-xl object-cover"
                  alt="Character"
                />
              </div>
              <p className="font-bold">{item.name}</p>
              <p className="text-xs">{item.description}</p>
            </CardHeader>
            <CardFooter className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center">
                <MessagesSquare className="mr-1 h-3 w-3" />
                {item._count?.messages ? item._count.messages : 0}
              </div>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
};
