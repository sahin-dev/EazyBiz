import { Suspense } from "react";
import { AuthFrame } from "@/components/auth/auth-frame";
import { AccountFlow } from "@/components/auth/account-flow";
export default function SignupPage() { return <AuthFrame><Suspense><AccountFlow mode="signup" /></Suspense></AuthFrame>; }
