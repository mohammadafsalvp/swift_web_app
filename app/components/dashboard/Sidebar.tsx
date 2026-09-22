import Image from "next/image";
import {
  IconAnalytics,
  IconBlueprints,
  IconEngine,
  IconVessels,
} from "./icons";
import { navItems } from "./data";

const iconByKey = {
  blueprints: IconBlueprints,
  vessels: IconVessels,
  "engine-repairs": IconEngine,
  analytics: IconAnalytics,
};

export default function Sidebar() {
  return (
    <aside className="flex flex-col gap-4 xl:col-span-3">
      <div className="flex items-center px-1">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary p-2">
          <Image
            src="/swift-icon.png"
            alt="Swift"
            width={88}
            height={74}
            className="h-full w-full object-contain"
            priority
          />
        </div>
      </div>

      <nav aria-label="Main Navigation" className="grid grid-cols-2 gap-2.5">
        {navItems.map((item) => {
          const Icon = iconByKey[item.key];
          return (
            <a
              key={item.key}
              href={item.href}
              className="group flex flex-col items-center justify-center rounded-lg border border-border bg-surface p-3.5 text-text-secondary shadow-card transition hover:bg-surface-inset"
            >
              <Icon className="mb-1.5 h-5 w-5 text-text-secondary group-hover:text-text-primary" />
              <span className="text-label-sm font-semibold text-text-primary">
                {item.label}
              </span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
