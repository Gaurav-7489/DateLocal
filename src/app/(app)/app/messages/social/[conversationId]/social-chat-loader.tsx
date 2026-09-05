"use client";
import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
const SocialChatClient = dynamic(() => import("./social-chat-client"), { ssr: false });
export default function SocialChatLoader(props: ComponentProps<typeof SocialChatClient>) { return <SocialChatClient {...props} />; }
