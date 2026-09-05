import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic="force-dynamic";
function sortKeys(value:unknown):unknown{if(Array.isArray(value))return value.map(sortKeys);if(value&&typeof value==="object")return Object.fromEntries(Object.entries(value as Record<string,unknown>).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,sortKeys(v)]));return value;}
function validSignature(body:unknown,signature:string,timestamp:string,secret:string){const ts=Number(timestamp);if(!Number.isFinite(ts)||Math.abs(Math.floor(Date.now()/1000)-ts)>300)return false;const canonical=JSON.stringify(sortKeys(body));const expected=crypto.createHmac("sha256",secret).update(canonical,"utf8").digest("hex");return expected.length===signature.length&&crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(signature));}

type Payload={webhook_type?:string;status?:string;vendor_data?:string;session_id?:string;decision?:{id_verifications?:Array<{status?:string;full_name?:string;first_name?:string;last_name?:string;date_of_birth?:string;gender?:string}>}};

export async function POST(request:Request){
 const secret=process.env.DIDIT_WEBHOOK_SECRET; if(!secret)return NextResponse.json({error:"Webhook not configured"},{status:503});
 const raw=await request.text(); let body:Payload; try{body=JSON.parse(raw);}catch{return NextResponse.json({error:"Invalid payload"},{status:400});}
 const signature=request.headers.get("x-signature-v2")||""; const timestamp=request.headers.get("x-timestamp")||""; if(!validSignature(body,signature,timestamp,secret))return NextResponse.json({error:"Invalid signature"},{status:401});
 if(!["status.updated","data.updated"].includes(body.webhook_type??"")||!body.vendor_data)return NextResponse.json({ok:true});
 const userId=body.vendor_data; const admin=createAdminClient();
 if(body.status==="Approved"){
  const id=body.decision?.id_verifications?.find((item)=>item.status==="Approved")??body.decision?.id_verifications?.[0];
  const gender=id?.gender==="F"?"woman":id?.gender==="M"?"man":id?.gender==="X"?"non-binary":null; const name=id?.full_name||[id?.first_name,id?.last_name].filter(Boolean).join(" ");
  if(id?.date_of_birth&&name&&gender){await admin.from("extrovert_profiles").upsert({id:userId,display_name:name,date_of_birth:id.date_of_birth,gender,identity_type:"other",department:"General",academic_year:"postgraduate",verification_status:"verified"},{onConflict:"id"});}
 }else if(["Declined","Expired","Abandoned"].includes(body.status??"")){await admin.from("extrovert_profiles").update({verification_status:"rejected"}).eq("id",userId);}else{await admin.from("extrovert_profiles").update({verification_status:"processing"}).eq("id",userId);}
 return NextResponse.json({ok:true});
}
