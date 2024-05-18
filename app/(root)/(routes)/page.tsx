import { Categories } from "@/components/categories";
import { Companions } from "@/components/companions";
import { SearchInput } from "@/components/search-input";
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";

interface PageProps {
  searchParams: {
    categoryId: string;
    name: string;
  };
}

const Page = async ({ searchParams }: PageProps) => {
  const { userId } = auth();

  let data;
  if (userId) {
    data = await prismadb.companion.findMany({
      where: {
        categoryId: searchParams.categoryId,
        name: {
          contains: searchParams.name,
          mode: "insensitive",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            messages: {
              where: {
                userId,
              },
            },
          },
        },
      },
    });
  } else {
    data = await prismadb.companion.findMany({
      where: {
        categoryId: searchParams.categoryId,
        name: {
          contains: searchParams.name,
          mode: "insensitive",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  const categories = await prismadb.category.findMany();

  return (
    <div className="h-full space-y-2 p-4">
      <SearchInput />
      <Categories data={categories} />
      <Companions data={data} />
    </div>
  );
};

export default Page;
