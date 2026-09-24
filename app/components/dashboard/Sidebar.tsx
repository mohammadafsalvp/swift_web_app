import Image from "next/image";
import type { ComponentType, ReactNode } from "react";
import {
  IconAnalytics,
  IconBlueprints,
  IconEngine,
  IconVessels,
} from "./icons";
import { navItems } from "./data";

export interface SidebarItem {
  key: string;
  label: string;
  href: string;
  Icon: ComponentType<{ className?: string }>;
}

const iconByKey = {
  blueprints: IconBlueprints,
  vessels: IconVessels,
  "engine-repairs": IconEngine,
  analytics: IconAnalytics,
};

const defaultItems: SidebarItem[] = navItems.map((item) => ({
  ...item,
  Icon: iconByKey[item.key],
}));

interface SidebarProps {
  items?: SidebarItem[];
  activeKey?: string;
  onItemClick?: (key: string) => void;
  footer?: ReactNode;
}

export default function Sidebar({
  items = defaultItems,
  activeKey,
  onItemClick,
  footer,
}: SidebarProps) {
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
        {items.map(({ key, label, href, Icon }) => {
          const isActive = activeKey === key;
          return (
            <a
              key={key}
              href={href}
              aria-current={isActive ? "page" : undefined}
              onClick={
                onItemClick
                  ? (e) => {
                      e.preventDefault();
                      onItemClick(key);
                    }
                  : undefined
              }
              className={`group flex flex-col items-center justify-center rounded-lg border p-3.5 shadow-card transition ${
                isActive
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface text-text-secondary hover:bg-surface-inset"
              }`}
            >
              <Icon
                className={`mb-1.5 h-5 w-5 ${
                  isActive ? "text-white" : "text-text-secondary group-hover:text-text-primary"
                }`}
              />
              <span
                className={`text-label-sm font-semibold ${
                  isActive ? "text-white" : "text-text-primary"
                }`}
              >
                {label}
              </span>
            </a>
          );
        })}
      </nav>

      {footer}
    </aside>
  );
}
