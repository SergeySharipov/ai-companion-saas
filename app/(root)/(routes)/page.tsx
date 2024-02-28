import { Categories } from "@/components/categories";
import { SearchInput } from "@/components/search-input";
import prismadb from "@/lib/prismadb";

const Page = async () => {
  const categories = await prismadb.category.findMany();

  return (
    <div className="h-full space-y-2 p-4">
      <SearchInput />
      <Categories data={categories} />
    </div>
  );
};

export default Page;
