import { redirect } from "next/navigation";
import { useEffect } from "react";
import LineChart from "~/components/LineChart";
import PieChart from "~/components/PieChart";
import PortfolioTable from "~/components/PortfolioTable";
import Sidebar from "~/components/Sidebar";
import { getServerAuthSession } from "~/server/auth";
// import fetch from 'node-fetch'

// interface TableData = {
//   data: {
//     symbol: string;
//     name: string;
//     currentValue: number;
//     qty: number;
//     description: string;
//     createdAt: Date;
//   }[];
// }

interface InsightsResponse {
  pie: { id: string; value: number }[];
  table: {
    name: string;
    symbol: string;
    qty: number;
    price: number;
    description: string;
  }[];
  historical: {
    symbol: string;
    history: string;
  }[];
}

async function getGraphData() {
  const res = await fetch(
    "https://superb-mighty-tortoise.ngrok-free.app/insights",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userid: "66005f46652067a0f0c4c762" }),
    },
  );

  if (!res.ok) {
    console.error("Failed to fetch graph data", res.status);
  }
  // const data: unknown = await res.json();

  return res.json();
}

export default async function Home() {
  const session = await getServerAuthSession();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const graphData: InsightsResponse = await getGraphData();

  if (!session) {
    redirect("/signin");
  }

  // if (!session.user.onboarded) {
  //   redirect("/onboard");
  // }

  return (
    <main className="flex min-h-screen w-full bg-neutral-50 text-neutral-900">
      <div className="w-[248px]">
        <Sidebar />
      </div>
      <div className="mx-auto flex h-full min-h-screen w-full max-w-4xl flex-1 flex-col py-10 md:py-16">
        <h1 className="pb-10 font-general-sans text-3xl font-bold">
          Welcome back
        </h1>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-white p-4 shadow">
              <h1 className="text-2xl font-semibold">Yearly Returns</h1>
              {/* <LineChart data={history} /> */}
            </div>
            <div className="h-[24rem] rounded-lg bg-white p-4 shadow">
              <PieChart data={graphData.pie} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="rounded-lg bg-white p-4 shadow">
              <h1 className="pb-4 text-2xl font-semibold">Stocks</h1>
              <PortfolioTable data={graphData.table} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
