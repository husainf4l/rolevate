import React from "react";
import { HomeIcon, UserIcon, BriefcaseIcon, ChatBubbleLeftRightIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

const icons = [
  { icon: HomeIcon, label: "Home" },
  { icon: UserIcon, label: "Profile" },
  { icon: BriefcaseIcon, label: "Jobs" },
  { icon: ChatBubbleLeftRightIcon, label: "Messages" },
  { icon: Cog6ToothIcon, label: "Settings" },
  { icon: ArrowRightOnRectangleIcon, label: "Logout" },
];

export default function SidebarIcons() {
  return (
    <aside className="h-full w-20 bg-white/80 border-r border-gray-200/60 flex flex-col items-center py-8 shadow-corporate">
      <nav className="flex flex-col gap-8 items-center w-full">
        {icons.map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="group flex flex-col items-center justify-center w-12 h-12 rounded-xl hover:bg-[#13ead9]/10 transition-colors duration-200 focus:outline-none"
            aria-label={label}
          >
            <Icon className="w-6 h-6 text-gray-400 group-hover:text-[#13ead9] transition-colors duration-200" />
          </button>
        ))}
      </nav>
    </aside>
  );
}

