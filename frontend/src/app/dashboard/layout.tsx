import Sidebar from "~/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen w-full bg-neutral-50 text-neutral-900">
      <div className="flex w-full max-w-md ">
        <Sidebar />
      </div>
    </main>
  );
}
