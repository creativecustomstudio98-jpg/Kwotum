import type { Metadata } from "next";

import { AuthShell } from "../auth/auth-shell";
import { RecoveryForm } from "./recovery-form";
import "../auth/auth-layout.css";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Odzyskiwanie hasła",
};

export const dynamic = "force-dynamic";

export default function RecoveryPage() {
  return (
    <AuthShell mode="login">
      <RecoveryForm />
    </AuthShell>
  );
}
