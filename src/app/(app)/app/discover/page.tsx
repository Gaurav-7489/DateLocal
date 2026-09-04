import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getProfilePhotoUrl } from "@/lib/profile-photo";
import DiscoverClient from "./discover-client";
import { Sparkles, ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Discover | Extrovert Date" };
export const dynamic = "force-dynamic";
export const revalidate = 0;
const DISCOVER_BATCH_SIZE = 20;
const DISCOVER_CANDIDATE_SIZE = 50;
const EXTROVERT_REACH_BOOST = 1.25;

type DiscoverProfile = { id:string;display_name:string;date_of_birth:string;gender:string;department:string;academic_year:string;identity_type?:string;institution_name?:string|null;field_of_study?:string|null;job_title?:string|null;employer_name?:string|null;role_description?:string|null;bio:string|null;ghost_mode:boolean;created_at:string;profile_photos:Array<{storage_path:string;display_order:number;is_primary:boolean}>|null;profile_interests:Array<{interests:{id:string;name:string}|null}>|null };

type TrustRow={id:string;verification_status:string;area_verification_status:string;area_id:string|null;profile_photo_path:string|null;trust_state:string};

export default async function DiscoverPage(){
 const supabase=await createServerSupabaseClient();const {data:claimsData}=await supabase.auth.getClaims();const userId=typeof claimsData?.claims?.sub==="string"?claimsData.claims.sub:null;if(!userId)return null;
 const [{data:myProfile},{data:myPrefs},{data:likes},{data:passes},{data:blocksCreated},{data:blocksReceived},{data:isPro}]=await Promise.all([
  supabase.from("profiles").select("id,profile_completed,ghost_mode").eq("id",userId).maybeSingle(),supabase.from("dating_preferences").select("preferred_department,interested_in").eq("user_id",userId).maybeSingle(),supabase.from("likes").select("liked_id").eq("liker_id",userId),supabase.from("passes").select("passed_id").eq("passer_id",userId),supabase.from("blocks").select("blocked_id").eq("blocker_id",userId),supabase.from("blocks").select("blocker_id").eq("blocked_id",userId),supabase.rpc("is_datebu_pro")
 ]);
 if(!myProfile?.profile_completed)return <div className="mx-auto max-w-2xl px-4 py-16 text-center"><Card className="border-pink-200 bg-pink-50/50 p-8"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-100 text-pink-600"><Sparkles className="h-7 w-7"/></div><h1 className="mt-4 text-2xl font-black">Create your dating profile first</h1><p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">Your Extrovert identity can exist without dating. Create your dating profile to appear here and discover other people.</p><Link href={routes.profileSetup}><Button className="mt-4 gap-2 bg-pink-500 hover:bg-pink-600">Create dating profile <ArrowRight className="h-4 w-4"/></Button></Link></Card></div>;
 const excludedIds=new Set<string>([userId,...(likes??[]).map(l=>l.liked_id),...(passes??[]).map(p=>p.passed_id),...(blocksCreated??[]).map(b=>b.blocked_id),...(blocksReceived??[]).map(b=>b.blocker_id)]);
 const {data:rawProfiles,error}=await supabase.rpc("get_discover_profiles",{p_excluded_ids:Array.from(excludedIds),p_limit:DISCOVER_CANDIDATE_SIZE});
 if(error)return <div className="mx-auto max-w-md px-4 py-16 text-center"><h1 className="text-xl font-bold">Discover is taking a moment</h1><p className="mt-2 text-sm text-muted-foreground">We&apos;re loading people near you. Please try again.</p></div>;
 let normalized=(rawProfiles??[]) as DiscoverProfile[];
 const wanted=Array.isArray(myPrefs?.interested_in)?myPrefs.interested_in:[];
 if(!wanted.includes("everyone")&&wanted.length){normalized=normalized.filter(p=>{const g=(p.gender||"").toLowerCase();if(wanted.includes("men")&&(g==="man"||g==="male"))return true;if(wanted.includes("women")&&(g==="woman"||g==="female"))return true;if((wanted.includes("nonbinary")||wanted.includes("other"))&&(g==="non-binary"||g==="nonbinary"||g==="other"))return true;return false;});}
 const prefDept=myPrefs?.preferred_department?.trim().toLowerCase();if(prefDept)normalized.sort((a,b)=>Number(b.department?.toLowerCase().includes(prefDept))-Number(a.department?.toLowerCase().includes(prefDept)));
 const candidateIds=normalized.map(p=>p.id);
 const [{data:extrovertIds},{data:paidRows},{data:trustRows}]=await Promise.all([
  candidateIds.length?supabase.rpc("get_extrovert_user_ids",{p_user_ids:candidateIds}):Promise.resolve({data:[]}),
  candidateIds.length?supabase.from("subscriptions").select("user_id,plan,status,current_period_end").in("user_id",candidateIds).eq("plan","pro").in("status",["active","trialing"]):Promise.resolve({data:[]}),
  candidateIds.length?supabase.from("extrovert_profiles").select("id,verification_status,area_verification_status,area_id,profile_photo_path,trust_state").in("id",candidateIds):Promise.resolve({data:[]})
 ]);
 const proIds=new Set((extrovertIds??[]) as string[]);const beyondIds=new Set((paidRows??[]).filter((s)=>!!s.current_period_end&&new Date(s.current_period_end).getTime()>Date.now()).map(s=>s.user_id));const trustMap=new Map(((trustRows??[]) as TrustRow[]).map(row=>[row.id,row]));
 const areaIds=Array.from(new Set((trustRows??[]).map(row=>row.area_id).filter(Boolean))) as string[];const {data:areaRows}=areaIds.length?await supabase.from("extrovert_areas").select("id,name").in("id",areaIds):{data:[]};const areaMap=new Map((areaRows??[]).map(a=>[a.id,a.name]));
 const ranked=normalized.map((profile,index)=>({profile,index,score:proIds.has(profile.id)?index/EXTROVERT_REACH_BOOST:index})).sort((a,b)=>a.score-b.score).slice(0,DISCOVER_BATCH_SIZE).map(item=>item.profile);
 const profilesWithPhotoUrls=ranked.map(profile=>{const trust=trustMap.get(profile.id);const photos=[...(profile.profile_photos??[])].sort((a,b)=>Number(b.is_primary)-Number(a.is_primary)||a.display_order-b.display_order).slice(0,5).map(photo=>({...photo,url:getProfilePhotoUrl(photo.storage_path,1080)}));const sharedPhoto=getProfilePhotoUrl(trust?.profile_photo_path,1080);const context=profile.identity_type==="student"?`${profile.institution_name||"College / university"} · ${profile.department||"Student"} · ${profile.academic_year||"Current year"}`:profile.identity_type==="professional"?`${profile.job_title||"Professional"}${profile.employer_name?` · ${profile.employer_name}`:""}`:(profile.role_description||"Current role");const beyond=profile.gender==="woman"||beyondIds.has(profile.id);return {...profile,profile_photo_url:photos[0]?.url??sharedPhoto,profile_photos:photos,verification_status:trust?.verification_status??"not_verified",area_verification_status:trust?.area_verification_status??"not_verified",area_name:trust?.area_id?areaMap.get(trust.area_id)??null:null,bio:`${beyond?"Beyond · ":""}${context}${profile.bio?` — ${profile.bio}`:""}`};});
 return <DiscoverClient profiles={profilesWithPhotoUrls} isPro={Boolean(isPro)}/>;
}
