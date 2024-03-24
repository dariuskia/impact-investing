import { redirect } from "next/navigation";
import Sidebar from "~/components/Sidebar";
import { getServerAuthSession } from "~/server/auth";

export default async function Home() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/signin");
  }

  if (!session.user.onboarded) {
    redirect("/onboard");
  }

  return (
    <main className="flex min-h-screen w-full bg-neutral-50 text-neutral-900">
      <div className="w-[248px]">
        <Sidebar />
      </div>
      <div className="mx-auto flex h-full min-h-screen w-full max-w-xl flex-1 py-10 md:py-16">
        dasdsa
      </div>
    </main>
  );
}
