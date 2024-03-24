"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import { RxDashboard, RxListBullet, RxGear } from "react-icons/rx";
import { cn } from "~/lib/utils";

const SIDEBAR_TABS = [
  {
    title: "Home",
    icon: <RxDashboard className="h-5 w-5" />,
    slug: "/dashboard/home",
  },
  {
    title: "List",
    icon: <RxListBullet className="h-5 w-5" />,
    slug: "/dashboard/list",
  },
  // {
  //   title: "Settings",
  //   icon: <RxGear className="h-5 w-5" />,
  //   slug: "/dashboard/settings",
  // },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <div className="fixed left-0 top-0 flex h-full w-[248px] flex-col bg-sidebar-background p-4">
      <div className="pb-4">
        <h1 className="text-3xl font-semibold text-neutral-50">Alignly</h1>
      </div>
      <ul className="w-full space-y-1">
        {SIDEBAR_TABS.map((tab) => (
          <li key={tab.title} className="w-full">
            <Link href={tab.slug}>
              <div
                className={cn(
                  "flex w-full items-center space-x-3 rounded-xl px-3 py-3 transition-colors duration-150",
                  {
                    "bg-neutral-500/15 text-white": pathname === tab.slug,
                    "text-white/50 hover:bg-neutral-500/15 hover:text-white":
                      pathname !== tab.slug,
                  },
                )}
              >
                {tab.icon}
                <p className="">{tab.title}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;
