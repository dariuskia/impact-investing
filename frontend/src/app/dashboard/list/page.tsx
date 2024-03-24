import { redirect } from "next/navigation";
import MediaItemList from "~/components/MediaItemList";
import Sidebar from "~/components/Sidebar";
import { getServerAuthSession } from "~/server/auth";

export default async function MediaList() {
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
        <h1 className="font-general-sans text-3xl font-bold text-neutral-900">
          Media List
        </h1>

        <div className="">
          <p className="pt-1 text-lg text-neutral-600">
            Add new media items to your context for portfolio creation.
          </p>
        </div>
        <MediaItemList />
      </div>
    </main>
  );
}
