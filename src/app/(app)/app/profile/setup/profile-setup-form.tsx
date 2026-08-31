"use client";

import { useActionState, useEffect, useState, useMemo } from "react";
import { saveProfile, type ProfileFormState } from "./actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfilePhotoUploader } from "./components/profile-photo-uploader";
import { calculateAge } from "@/lib/utils";
import {
  Sparkles,
  MapPin,
  Heart,
  Coffee,
  Moon,
  Compass,
  MessageSquareHeart,
  GraduationCap,
  Search,
  PenTool,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const GENDER_OPTIONS = [
  { value: "man", label: "Man" },
  { value: "woman", label: "Woman" },
  { value: "other", label: "Other" },
];

const YEAR_OPTIONS = [
  { value: "1st-year", label: "1st Year (Freshman)" },
  { value: "2nd-year", label: "2nd Year (Sophomore)" },
  { value: "3rd-year", label: "3rd Year (Junior)" },
  { value: "4th-year", label: "4th Year (Senior)" },
  { value: "5th-year", label: "5th Year (Dual / Integrated)" },
  { value: "postgraduate", label: "Postgraduate / Master's" },
];

const CURATED_DEPARTMENTS = [
  "Computer Science & Engineering",
  "Information Technology / BCA / MCA",
  "Business & Management (BBA / MBA)",
  "Commerce, Finance & Economics",
  "Biotechnology & Life Sciences",
  "Mechanical & Automotive Engineering",
  "Civil & Environmental Engineering",
  "Electronics & Communication (ECE)",
  "Law & Legal Studies",
  "Design, Media & Animation",
  "Pharmacy & Health Sciences",
  "Humanities, English & Psychology",
  "Mathematics, Physics & Chemistry",
];

const RELATIONSHIP_GOALS = [
  { value: "Long-term", label: "Long-term", desc: "Something genuine" },
  { value: "short & Chill", label: "short & Chill", desc: "Good conversations, good vibes" },
  { value: "Study Buddy", label: "Study Buddy", desc: "Study together" },
  { value: "Friends & Connections", label: "Friends & Connections", desc: "Meet new people on campus" },
];

const RESIDENCY_OPTIONS = [
  { value: "Hostel", label: "Hostel", desc: "Campus resident" },
  { value: "Day Scholar", label: "Day Scholar", desc: "Daily commuter" },
  { value: "Off-Campus / PG / Flat", label: "Off-Campus / PG / Flat", desc: "Living off campus" },
];

const CURATED_HANGOUTS = [
  "Canteen",
  "Library",
  "outside mechanical department",
  "Sports Ground",
  "old school gym",
  "Labs",
];

// -------------------------------------------------------------
// EXACT BADGES & OPTIONS
// -------------------------------------------------------------

const ZODIAC_SIGNS = [
  { label: "Aries", icon: "♈" },
  { label: "Taurus", icon: "♉" },
  { label: "Gemini", icon: "♊" },
  { label: "Cancer", icon: "♋" },
  { label: "Leo", icon: "♌" },
  { label: "Virgo", icon: "♍" },
  { label: "Libra", icon: "♎" },
  { label: "Scorpio", icon: "♏" },
  { label: "Sagittarius", icon: "♐" },
  { label: "Capricorn", icon: "♑" },
  { label: "Aquarius", icon: "♒" },
  { label: "Pisces", icon: "♓" },
];

const SLEEP_HABITS = [
  { value: "Night Owl", label: "🌙 Night Owl", desc: "Usually up late" },
  { value: "Early Bird", label: "🌅 Early Bird", desc: "Usually up early" },
  { value: "Flexible", label: "⏱️ Flexible", desc: "Depends on the day" },
];

const CAFFEINE_PREFS = [
  { value: "Chai", label: "☕ Chai" },
  { value: "Cold Coffee", label: "🥤 Cold Coffee" },
  { value: "Energy Drinks", label: "⚡ Energy Drinks" },
  { value: "Water / Green Tea", label: "🍵 Water / Green Tea" },
];

const SUNDAY_VIBES = [
  { value: "Gaming & Movies", label: "🎮 Gaming & Movies" },
  { value: "Cafes & Exploring", label: "☕ Cafes & Exploring" },
  { value: "Side Projects & Coding", label: "💻 Side Projects & Coding" },
  { value: "Sleeping In", label: "😴 Sleeping In" },
];

const CURATED_PROMPTS = [
  "The quickest way to win me over at the canteen is...",
  "My go-to excuse for missing an 8:30 AM lecture is...",
  "Don't hate me if during group projects I...",
  "My unpopular campus opinion is...",
  "Best spot on campus to get peace and quiet is...",
  "If you want to study with me, you should know that...",
];

const INTERESTED_IN_OPTIONS = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "everyone", label: "Everyone" },
];

interface Interest {
  id: string;
  name: string;
}

interface ExistingProfile {
  display_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  department: string | null;
  academic_year: string | null;
  bio: string | null;
  campus_residency?: string | null;
  campus_hangout?: string | null;
  relationship_goal?: string | null;
  zodiac?: string | null;
  sleep_habit?: string | null;
  caffeine_pref?: string | null;
  weekend_vibe?: string | null;
  prompt_question?: string | null;
  prompt_answer?: string | null;
}

interface ExistingPreferences {
  interested_in: string[] | null;
  min_age: number | null;
  max_age: number | null;
  preferred_department: string | null;
}

interface ProfileSetupFormProps {
  userId: string;
  interests: Interest[];
  existingProfile: ExistingProfile | null;
  existingPhotoUrls: string[];
  existingPhotoPaths: string[];
  existingInterestIds: string[];
  existingPreferences: ExistingPreferences | null;
}

function deriveInterestedIn(arr: string[] | null | undefined): string {
  if (!arr || arr.length === 0) return "";
  if (arr.includes("everyone") || (arr.includes("men") && arr.includes("women"))) {
    return "everyone";
  }
  return arr[0] ?? "";
}

export function ProfileSetupForm({
  userId,
  interests,
  existingProfile,
  existingPhotoUrls,
  existingPhotoPaths,
  existingInterestIds,
  existingPreferences,
}: ProfileSetupFormProps) {
  const [state, formAction, isPending] = useActionState<ProfileFormState, FormData>(
    saveProfile,
    {},
  );

  const [displayName, setDisplayName] = useState(existingProfile?.display_name ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(existingProfile?.date_of_birth ?? "");
  const [gender, setGender] = useState(existingProfile?.gender ?? "");
  const [academicYear, setAcademicYear] = useState(existingProfile?.academic_year ?? "");
  const [bio, setBio] = useState(existingProfile?.bio ?? "");

  const [department, setDepartment] = useState(existingProfile?.department ?? "");
  const [deptSearch, setDeptSearch] = useState("");
  const [isCustomDept, setIsCustomDept] = useState(
    Boolean(existingProfile?.department && !CURATED_DEPARTMENTS.includes(existingProfile.department))
  );

  const [campusHangout, setCampusHangout] = useState(existingProfile?.campus_hangout ?? "");
  const [isCustomHangout, setIsCustomHangout] = useState(
    Boolean(existingProfile?.campus_hangout && !CURATED_HANGOUTS.includes(existingProfile.campus_hangout))
  );

  const [campusResidency, setCampusResidency] = useState(existingProfile?.campus_residency ?? "");
  const [relationshipGoal, setRelationshipGoal] = useState(existingProfile?.relationship_goal ?? "");
  const [zodiac, setZodiac] = useState(existingProfile?.zodiac ?? "");
  const [sleepHabit, setSleepHabit] = useState(existingProfile?.sleep_habit ?? "");
  const [caffeinePref, setCaffeinePref] = useState(existingProfile?.caffeine_pref ?? "");
  const [weekendVibe, setWeekendVibe] = useState(existingProfile?.weekend_vibe ?? "");

  const initialPrompt = existingProfile?.prompt_question ?? CURATED_PROMPTS[0];
  const [isCustomPrompt, setIsCustomPrompt] = useState(
    Boolean(existingProfile?.prompt_question && !CURATED_PROMPTS.includes(existingProfile.prompt_question))
  );
  const [promptQuestion, setPromptQuestion] = useState(initialPrompt);
  const [promptAnswer, setPromptAnswer] = useState(existingProfile?.prompt_answer ?? "");

  const [interestSearch, setInterestSearch] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(
    new Set(existingInterestIds),
  );

  const [interestedIn, setInterestedIn] = useState(
    deriveInterestedIn(existingPreferences?.interested_in)
  );
  const [minAge, setMinAge] = useState(existingPreferences?.min_age ?? 17);
  const [maxAge, setMaxAge] = useState(existingPreferences?.max_age ?? 60);
  const [photoPaths, setPhotoPaths] = useState<string[]>(existingPhotoPaths);
  const [formNotice, setFormNotice] = useState<string | null>(null);
  const [openVibes, setOpenVibes] = useState(true);

  useEffect(() => {
    const firstFieldError = Object.values(state.fieldErrors ?? {})[0];
    setFormNotice(state.error ?? firstFieldError ?? null);
  }, [state.error, state.fieldErrors]);

  const filteredDepartments = useMemo(() => {
    if (!deptSearch.trim()) return CURATED_DEPARTMENTS;
    return CURATED_DEPARTMENTS.filter((d) =>
      d.toLowerCase().includes(deptSearch.toLowerCase())
    );
  }, [deptSearch]);

  const filteredInterests = useMemo(() => {
    if (!interestSearch.trim()) return interests;
    return interests.filter((item) =>
      item.name.toLowerCase().includes(interestSearch.toLowerCase())
    );
  }, [interestSearch, interests]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (dateOfBirth) {
      const parts = dateOfBirth.split("-").map((p) => Number.parseInt(p, 10));
      const [year, month, day] = parts as [number, number, number];
      const age = calculateAge(new Date(year, month - 1, day));

      if (age !== null && age < 17) {
        event.preventDefault();
        setFormNotice("You must be at least 17 years old to use DateBu.");
        document.getElementById("date_of_birth")?.focus();
      }
    }
  }

  function toggleInterest(id: string) {
    setSelectedInterests((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-6 font-sans">
      {formNotice && (
        <div
          role="alert"
          className="fixed inset-x-4 top-5 z-50 mx-auto max-w-lg rounded-2xl border border-rose-200 bg-white p-4 text-xs font-semibold text-rose-700 shadow-xl"
        >
          <div className="flex items-start justify-between gap-3">
            <span>{formNotice}</span>
            <button
              type="button"
              aria-label="Dismiss message"
              onClick={() => setFormNotice(null)}
              className="text-lg leading-none text-rose-400 hover:text-rose-600 cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* 1. PHOTO DECK */}
      <Card className="p-5">
        <ProfilePhotoUploader
          userId={userId}
          existingPhotoUrls={existingPhotoUrls}
          existingPhotoPaths={existingPhotoPaths}
          onPhotosUploaded={setPhotoPaths}
        />
        {photoPaths.map((path) => (
          <input key={path} type="hidden" name="photo_paths" value={path} />
        ))}
      </Card>

      {/* 2. CORE IDENTITY & DEPARTMENT */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-emerald-600" /> Basic Student Identity
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label htmlFor="display_name" className="mb-1 block text-xs font-semibold text-foreground">
              Display Name <span className="text-destructive">*</span>
            </label>
            <input
              id="display_name"
              name="display_name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              required
              placeholder="Your first name or nickname"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="gender" className="mb-1 block text-xs font-semibold text-foreground">
              Gender <span className="text-destructive">*</span>
            </label>
            <select
              id="gender"
              name="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none focus:border-emerald-500"
            >
              <option value="">Select gender</option>
              {GENDER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label htmlFor="date_of_birth" className="mb-1 block text-xs font-semibold text-foreground">
              Date of Birth <span className="text-destructive">*</span>
            </label>
            <input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="academic_year" className="mb-1 block text-xs font-semibold text-foreground">
              Batch / Academic Year <span className="text-destructive">*</span>
            </label>
            <select
              id="academic_year"
              name="academic_year"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none focus:border-emerald-500"
            >
              <option value="">Select batch year</option>
              {YEAR_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Searchable / Custom Department */}
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-foreground">
              Department / Major <span className="text-destructive">*</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setIsCustomDept(!isCustomDept);
                if (!isCustomDept) setDepartment("");
              }}
              className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              <PenTool className="w-3 h-3" />
              {isCustomDept ? "Pick from list" : "✍️ Type custom department"}
            </button>
          </div>

          {isCustomDept ? (
            <input
              type="text"
              name="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
              maxLength={80}
              placeholder="e.g. B.Tech Cyber Security & Forensics"
              className="w-full rounded-xl border border-emerald-500 bg-emerald-50/20 px-3.5 py-2.5 text-xs outline-none"
            />
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search faculty or course..."
                  value={deptSearch}
                  onChange={(e) => setDeptSearch(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background pl-8 pr-3 py-2 text-xs outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 rounded-xl bg-muted/30 border border-border/50">
                {filteredDepartments.map((dept) => (
                  <button
                    type="button"
                    key={dept}
                    onClick={() => setDepartment(dept)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all text-left cursor-pointer ${
                      department === dept
                        ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                        : "border-border bg-background hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
              <input type="hidden" name="department" value={department} />
            </div>
          )}
        </div>
      </Card>

      {/* 3. CAMPUS INTENT & RESIDENCY */}
      <Card className="p-5 space-y-5">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500" /> Campus Intent & Lifestyle
        </h2>

        {/* What are you looking for? */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground">What are you looking for?</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {RELATIONSHIP_GOALS.map((goal) => {
              const selected = relationshipGoal === goal.value;
              return (
                <button
                  type="button"
                  key={goal.value}
                  onClick={() => setRelationshipGoal(goal.value)}
                  className={`flex flex-col text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                    selected
                      ? "border-rose-500 bg-rose-50/60 ring-1 ring-rose-500 shadow-2xs"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <span className={`text-xs font-bold ${selected ? "text-rose-900" : "text-foreground"}`}>
                    {goal.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">{goal.desc}</span>
                </button>
              );
            })}
          </div>
          <input type="hidden" name="relationship_goal" value={relationshipGoal} />
        </div>

        {/* Where do you stay? */}
        <div className="space-y-2 pt-3 border-t border-border">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Where do you stay?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {RESIDENCY_OPTIONS.map((item) => {
              const selected = campusResidency === item.value;
              return (
                <button
                  type="button"
                  key={item.value}
                  onClick={() => setCampusResidency(item.value)}
                  className={`flex flex-col text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                    selected
                      ? "border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600 shadow-2xs"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <span className={`text-xs font-bold ${selected ? "text-emerald-950" : "text-foreground"}`}>
                    {item.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</span>
                </button>
              );
            })}
          </div>
          <input type="hidden" name="campus_residency" value={campusResidency} />
        </div>

        {/* Favorite campus spot */}
        <div className="space-y-2 pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5 text-amber-600" /> Favorite campus spot
            </label>
            <button
              type="button"
              onClick={() => {
                setIsCustomHangout(!isCustomHangout);
                if (!isCustomHangout) setCampusHangout("");
              }}
              className="text-[11px] font-bold text-amber-700 hover:underline cursor-pointer"
            >
              {isCustomHangout ? "Pick from list" : "✍️ Add your own"}
            </button>
          </div>

          {isCustomHangout ? (
            <input
              type="text"
              value={campusHangout}
              onChange={(e) => setCampusHangout(e.target.value)}
              placeholder="Type your favorite spot..."
              maxLength={80}
              className="w-full rounded-xl border border-amber-400 bg-amber-50/20 px-3.5 py-2.5 text-xs outline-none"
            />
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {CURATED_HANGOUTS.map((spot) => (
                <button
                  type="button"
                  key={spot}
                  onClick={() => setCampusHangout(spot)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    campusHangout === spot
                      ? "border-amber-500 bg-amber-50 text-amber-900 shadow-2xs font-semibold"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {spot}
                </button>
              ))}
            </div>
          )}
          <input type="hidden" name="campus_hangout" value={campusHangout} />
        </div>
      </Card>

      {/* 4. CONVERSATION STARTER PROMPT */}
      <Card className="p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <MessageSquareHeart className="w-4 h-4 text-indigo-500" /> Icebreaker & Prompt Card
          </h2>
          <button
            type="button"
            onClick={() => {
              setIsCustomPrompt(!isCustomPrompt);
              if (!isCustomPrompt) setPromptQuestion("");
              else setPromptQuestion(CURATED_PROMPTS[0]);
            }}
            className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <PenTool className="w-3 h-3" />
            {isCustomPrompt ? "Choose template" : "✍️ Write custom prompt"}
          </button>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-foreground mb-1 block">
            {isCustomPrompt ? "Your Custom Prompt Question" : "Selected Prompt Question"}
          </label>
          {isCustomPrompt ? (
            <input
              type="text"
              value={promptQuestion}
              onChange={(e) => setPromptQuestion(e.target.value)}
              placeholder="e.g. You should only message me if..."
              maxLength={120}
              className="w-full rounded-xl border border-indigo-400 bg-indigo-50/20 px-3.5 py-2.5 text-xs outline-none"
            />
          ) : (
            <select
              value={promptQuestion}
              onChange={(e) => setPromptQuestion(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none focus:border-indigo-500"
            >
              {CURATED_PROMPTS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          )}
          <input type="hidden" name="prompt_question" value={promptQuestion} />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-foreground mb-1 block">Your Answer</label>
          <textarea
            value={promptAnswer}
            name="prompt_answer"
            onChange={(e) => setPromptAnswer(e.target.value)}
            maxLength={300}
            rows={2}
            placeholder="Write something witty, authentic, or funny..."
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-indigo-500"
          />
          <div className="flex justify-end text-[10px] text-muted-foreground">
            <span>{promptAnswer.length}/300</span>
          </div>
        </div>

        <div>
          <label htmlFor="bio" className="mb-1 block text-[11px] font-semibold text-foreground">
            About Me / Short Bio (Optional)
          </label>
          <textarea
            id="bio"
            name="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={400}
            rows={2}
            placeholder="Any extra details you'd like classmates to know..."
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-emerald-500"
          />
        </div>
      </Card>

      {/* 5. BADGES: ZODIAC, SLEEP, DAILY DRINKS, SUNDAY */}
      <Card className="p-5 space-y-4">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setOpenVibes(!openVibes)}
        >
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" /> Badges & Habits
          </h2>
          <button type="button" className="text-muted-foreground">
            {openVibes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {openVibes && (
          <div className="space-y-4 pt-2 border-t border-border">
            {/* Zodiac */}
            <div>
              <label className="text-[11px] font-semibold text-foreground block mb-1.5">Zodiac</label>
              <div className="flex flex-wrap gap-1.5">
                {ZODIAC_SIGNS.map((item) => (
                  <button
                    type="button"
                    key={item.label}
                    onClick={() => setZodiac(zodiac === item.label ? "" : item.label)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      zodiac === item.label
                        ? "border-purple-500 bg-purple-50 text-purple-900 font-semibold shadow-2xs"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
              <input type="hidden" name="zodiac" value={zodiac} />
            </div>

            {/* Sleep Schedule & Daily Drinks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[11px] font-semibold text-foreground block mb-1.5">
                  <Moon className="w-3 h-3 inline mr-1 text-blue-500" /> Sleep Schedule
                </label>
                <div className="flex flex-col gap-1.5">
                  {SLEEP_HABITS.map((h) => (
                    <button
                      type="button"
                      key={h.value}
                      onClick={() => setSleepHabit(sleepHabit === h.value ? "" : h.value)}
                      className={`flex flex-col text-left px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                        sleepHabit === h.value
                          ? "border-blue-500 bg-blue-50 text-blue-900 font-semibold"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="text-xs font-bold">{h.label}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">{h.desc}</span>
                    </button>
                  ))}
                </div>
                <input type="hidden" name="sleep_habit" value={sleepHabit} />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-foreground block mb-1.5">
                  <Coffee className="w-3 h-3 inline mr-1 text-orange-500" /> Daily Drinks
                </label>
                <div className="flex flex-col gap-1.5">
                  {CAFFEINE_PREFS.map((f) => (
                    <button
                      type="button"
                      key={f.value}
                      onClick={() => setCaffeinePref(caffeinePref === f.value ? "" : f.value)}
                      className={`px-3 py-2 rounded-xl text-left text-xs font-medium border transition-all cursor-pointer ${
                        caffeinePref === f.value
                          ? "border-orange-500 bg-orange-50 text-orange-900 font-semibold"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <input type="hidden" name="caffeine_pref" value={caffeinePref} />
              </div>
            </div>

            {/* Sunday */}
            <div>
              <label className="text-[11px] font-semibold text-foreground block mb-1.5">
                <Compass className="w-3 h-3 inline mr-1 text-teal-600" /> Sunday
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SUNDAY_VIBES.map((v) => (
                  <button
                    type="button"
                    key={v.value}
                    onClick={() => setWeekendVibe(weekendVibe === v.value ? "" : v.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      weekendVibe === v.value
                        ? "border-teal-500 bg-teal-50 text-teal-900 font-semibold"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
              <input type="hidden" name="weekend_vibe" value={weekendVibe} />
            </div>
          </div>
        )}
      </Card>

      {/* 6. SEARCHABLE INTERESTS */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Interests & Hobbies</h2>
          <span className="text-[11px] text-muted-foreground font-semibold">
            {selectedInterests.size} Selected
          </span>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search hobbies, sports, music..."
            value={interestSearch}
            onChange={(e) => setInterestSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-background pl-8 pr-3 py-2 text-xs outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1 rounded-xl bg-muted/20 border border-border/40">
          {filteredInterests.map((interest) => {
            const selected = selectedInterests.has(interest.id);
            return (
              <button
                key={interest.id}
                type="button"
                onClick={() => toggleInterest(interest.id)}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  selected
                    ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                {interest.name}
              </button>
            );
          })}
        </div>

        {Array.from(selectedInterests).map((id) => (
          <input key={id} type="hidden" name="interests" value={id} />
        ))}
      </Card>

      {/* 7. DISCOVERY PREFERENCES */}
      <Card className="p-5 space-y-3.5">
        <h2 className="text-sm font-bold text-foreground">Discovery Settings</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="interested_in" className="mb-1 block text-xs font-semibold text-foreground">
              Show Me <span className="text-destructive">*</span>
            </label>
            <select
              id="interested_in"
              name="interested_in"
              value={interestedIn}
              onChange={(e) => setInterestedIn(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-emerald-500"
            >
              <option value="">Select preference</option>
              {INTERESTED_IN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="min_age" className="mb-1 block text-xs font-semibold text-foreground">
              Min Age <span className="text-destructive">*</span>
            </label>
            <input
              id="min_age"
              name="min_age"
              type="number"
              min={17}
              max={60}
              value={minAge}
              onChange={(e) => setMinAge(Number.parseInt(e.target.value, 10) || 17)}
              required
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none"
            />
          </div>

          <div>
            <label htmlFor="max_age" className="mb-1 block text-xs font-semibold text-foreground">
              Max Age <span className="text-destructive">*</span>
            </label>
            <input
              id="max_age"
              name="max_age"
              type="number"
              min={17}
              max={60}
              value={maxAge}
              onChange={(e) => setMaxAge(Number.parseInt(e.target.value, 10) || 60)}
              required
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none"
            />
          </div>
        </div>
      </Card>

      {/* SUBMIT BUTTON */}
      <div className="flex justify-end pb-8">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isPending}
          className="rounded-2xl px-8 py-3.5 text-xs font-bold shadow-md shadow-emerald-600/20"
        >
          {isPending ? "Saving Profile..." : "Save Profile & Finish"}
        </Button>
      </div>
    </form>
  );
}