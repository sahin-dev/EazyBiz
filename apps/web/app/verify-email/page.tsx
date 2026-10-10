import { Suspense } from "react";
import { AuthFrame } from "@/components/auth/auth-frame";
import { AccountFlow } from "@/components/auth/account-flow";
export default function VerifyPage() { return <AuthFrame><Suspense><AccountFlow mode="verify-email" /></Suspense></AuthFrame>; }
