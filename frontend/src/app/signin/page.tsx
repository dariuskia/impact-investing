import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";
import SigninForm from "~/components/SigninForm";

export default async function Signin() {
  const session = await getServerAuthSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen w-full justify-center bg-neutral-50 text-neutral-900">
      <div className="w-full max-w-md pt-48">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[2rem]">
          Impact
        </h1>
        <p className="pt-1 text-lg text-neutral-600">
          Put your money where your heart is.
        </p>
        <div className="flex justify-center pt-8">
          <SigninForm />
        </div>
      </div>
    </main>
  );
}
