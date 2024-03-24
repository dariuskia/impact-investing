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
      <div className="mx-auto flex h-full min-h-screen w-full max-w-4xl flex-1 flex-col py-10 md:py-16">
        <h1 className="pb-10 font-general-sans text-3xl font-bold">
          Welcome back
        </h1>
        <div className="gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-white p-4 shadow">heee</div>
            <div className="rounded-lg bg-white p-4 shadow">heee</div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="rounded-lg bg-white p-4 shadow">table</div>
          </div>
        </div>
      </div>
    </main>
  );
}
