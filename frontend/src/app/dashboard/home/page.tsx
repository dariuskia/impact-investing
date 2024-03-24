import { redirect } from "next/navigation";
import Sidebar from "~/components/Sidebar";
import { getServerAuthSession } from "~/server/auth";

export default async function Home() {
  const session = await getServerAuthSession();

  //   if (!session) {
  //     redirect("/signin");
  //   }

  return (
    <main className="flex min-h-screen w-full bg-neutral-50 text-neutral-900">
      <div className="w-full max-w-md">
        <Sidebar />
      </div>
    </main>
  );
}
