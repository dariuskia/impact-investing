import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";
import { SigninForm } from "~/components/SigninForm";

export default async function Home() {
  const session = await getServerAuthSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen w-full justify-center bg-neutral-50 text-neutral-900">
      <div className="w-full max-w-md pt-48">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[2rem]">
          Sign in to Impact
        </h1>
        <div className="flex justify-center pt-8">
          <SigninForm />
        </div>
      </div>
    </main>
  );
}
