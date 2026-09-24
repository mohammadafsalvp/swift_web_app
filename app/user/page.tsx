import type { Metadata } from "next";
import UserPortal from "../components/user/UserPortal";

export const metadata: Metadata = {
  title: "IDC Swift · Employee Portal",
  description: "Upload, browse and download marine engineering documents",
};

export default function UserPage() {
  return <UserPortal />;
}
