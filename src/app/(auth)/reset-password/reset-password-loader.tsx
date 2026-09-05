"use client";
import dynamic from "next/dynamic";
const ResetPasswordClient = dynamic(() => import("./reset-password-client"), { ssr: false });
export default function ResetPasswordLoader() { return <ResetPasswordClient />; }
