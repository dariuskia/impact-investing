import { redirect } from "next/navigation";
import Questionnaire from "~/components/Questionnaire/Questionnaire";
import { getServerAuthSession } from "~/server/auth";

export default async function Onboard() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/signin");
  }

  if (session.user.onboarded) {
    redirect("/dashboard/home");
  }

  return (
    <main className="flex min-h-screen w-full bg-neutral-50 pb-32 text-neutral-900">
      <div className="mx-auto w-full max-w-xl pt-24">
        <div className="">
          <h1 className="font-general-sans text-4xl font-bold text-neutral-900">
            Almost there!
          </h1>
          <p className="font-sans text-neutral-500">
            Please complete the questionnaire to generate your first portfolio.
          </p>
        </div>
        <Questionnaire />
      </div>
    </main>
  );
}
