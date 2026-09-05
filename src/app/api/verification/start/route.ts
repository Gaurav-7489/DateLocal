import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic="force-dynamic";

export async function GET(request:Request){
 const supabase=await createServerSupabaseClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.redirect(new URL("/login?error=Please+sign+in+first",request.url));
 const apiKey=process.env.DIDIT_API_KEY;
 const workflowId=process.env.DIDIT_WORKFLOW_ID;
 const appUrl=(process.env.NEXT_PUBLIC_APP_URL||new URL(request.url).origin).replace(/\/$/,"");
 if(!apiKey||!workflowId)return NextResponse.redirect(new URL("/verify?error=Identity+verification+is+not+configured+yet",request.url));
 try{
  const response=await fetch("https://verification.didit.me/v3/session/",{method:"POST",headers:{"x-api-key":apiKey,"Content-Type":"application/json"},body:JSON.stringify({workflow_id:workflowId,vendor_data:user.id,callback:`${appUrl}/verification/complete`,callback_method:"both",language:"en",metadata:{source:"extrovert_onboarding"}}),cache:"no-store"});
  const data=await response.json();
  if(!response.ok||typeof data.url!=="string")return NextResponse.redirect(new URL("/verify?error=We+couldn%27t+start+verification",request.url));
  return NextResponse.redirect(data.url);
 }catch{return NextResponse.redirect(new URL("/verify?error=Verification+service+is+temporarily+unavailable",request.url));}
}
