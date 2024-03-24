import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";

export default async function Onboard() {
  const session = await getServerAuthSession();

  //   if (!session) {
  //     redirect("/signin");
  //   }

  return (
    <main className="flex min-h-screen w-full bg-neutral-50 text-neutral-900">
      <div className="w-full max-w-md">
        <div className="">
          <h1 className="text-3xl font-semibold text-neutral-900">Onboard</h1>
          <p className="text-neutral-700">
            Welcome to the onboard page. This is where you can onboard new
            users.
          </p>
        </div>
      </div>
    </main>
  );
}
