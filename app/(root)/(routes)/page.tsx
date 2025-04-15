import { Categories } from "@/components/categories";
import { Companions } from "@/components/companions";
import { SearchInput } from "@/components/search-input";
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";

interface PageProps {
  searchParams: Promise<{
    categoryId: string;
    name: string;
  }>;
}

const Page = async (props: PageProps) => {
  const searchParams = await props.searchParams;
  const { userId } = await auth();

  let companions;
  
  if (userId) {
    companions = await prismadb.companion.findMany({
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
  };

  const categories = await prismadb.category.findMany();

  return (
    <div className="h-full space-y-2 p-4">
      <SearchInput />
      <Categories data={categories} />
      <Companions data={companions} />
    </div>
  );
};

export default Page;
