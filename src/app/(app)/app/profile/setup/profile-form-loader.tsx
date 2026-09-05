"use client";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

interface Interest{id:string;name:string}
interface ExistingProfile{bio:string|null;campus_residency?:string|null;campus_hangout?:string|null;relationship_goal?:string|null;zodiac?:string|null;sleep_habit?:string|null;caffeine_pref?:string|null;weekend_vibe?:string|null;prompt_question?:string|null;prompt_answer?:string|null}
interface ExistingPreferences{interested_in:string[]|null;min_age:number|null;max_age:number|null;preferred_department:string|null}
interface Identity{displayName:string;dateOfBirth:string;gender:string;department:string|null;academicYear:string|null;identityType:string;institutionName:string|null;fieldOfStudy:string|null;jobTitle:string|null;employerName:string|null;roleDescription:string|null;areaName?:string}
interface Props{userId:string;interests:Interest[];existingProfile:ExistingProfile|null;existingPhotoUrls:string[];existingPhotoPaths:string[];existingInterestIds:string[];existingPreferences:ExistingPreferences|null;identity:Identity}
const LazyDatingProfileForm=dynamic(()=>import("./dating-profile-form").then(m=>m.DatingProfileForm),{ssr:false,loading:()=> <div className="flex min-h-40 items-center justify-center rounded-3xl border border-zinc-200 bg-white"><Loader2 className="h-5 w-5 animate-spin text-emerald-600" aria-label="Loading profile editor"/></div>});
export function ProfileFormLoader(props:Props){return <LazyDatingProfileForm {...props}/>}
