"use client";

import { useActionState, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Sparkles, 
  Heart, 
  Camera, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  AlertCircle, 
  Loader2,
  Calendar,
  GraduationCap,
  Building2,
  Search
} from "lucide-react";
import { saveProfile, type ProfileFormState } from "./actions";
import { ProfilePhotoUploader } from "./components/profile-photo-uploader";

const GENDER_OPTIONS = [
  { value: "man", label: "Man", icon: "👨" },
  { value: "woman", label: "Woman", icon: "👩" },
  { value: "non-binary", label: "Non-binary", icon: "🧑" },
  { value: "other", label: "Other", icon: "✨" },
  { value: "prefer-not-to-say", label: "Prefer not to say", icon: "🔒" },
];

const YEAR_OPTIONS = [
  { value: "1st-year", label: "1st Year" },
  { value: "2nd-year", label: "2nd Year" },
  { value: "3rd-year", label: "3rd Year" },
  { value: "4th-year", label: "4th Year" },
  { value: "5th-year", label: "5th Year" },
  { value: "postgraduate", label: "Postgraduate" },
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
  existingPhotoUrl: string | null;
  existingPhotoPath: string | null;
  existingInterestIds: string[];
  existingPreferences: ExistingPreferences | null;
}

function deriveInterestedIn(arr: string[] | null | undefined): string {
  if (!arr || arr.length === 0) return "everyone";
  if (arr.includes("everyone") || (arr.includes("men") && arr.includes("women"))) return "everyone";
  return arr[0] ?? "everyone";
}

export function ProfileSetupForm({
  userId,
  interests,
  existingProfile,
  existingPhotoUrl,
  existingPhotoPath,
  existingInterestIds,
  existingPreferences,
}: ProfileSetupFormProps) {
  const [state, formAction, isPending] = useActionState<ProfileFormState, FormData>(
    saveProfile,
    {},
  );

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [displayName, setDisplayName] = useState(existingProfile?.display_name ?? "");
  const [dob, setDob] = useState(existingProfile?.date_of_birth ?? "");
  const [gender, setGender] = useState(existingProfile?.gender ?? "");
  const [department, setDepartment] = useState(existingProfile?.department ?? "");
  const [academicYear, setAcademicYear] = useState(existingProfile?.academic_year ?? "");
  const [bio, setBio] = useState(existingProfile?.bio ?? "");
  const [photoPath, setPhotoPath] = useState<string | null>(existingPhotoPath);
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set(existingInterestIds));
  const [interestedIn, setInterestedIn] = useState(deriveInterestedIn(existingPreferences?.interested_in));
  const [minAge, setMinAge] = useState(existingPreferences?.min_age ?? 18);
  const [maxAge, setMaxAge] = useState(existingPreferences?.max_age ?? 25);
  const [preferredDept, setPreferredDept] = useState(existingPreferences?.preferred_department ?? "");

  const [interestSearch, setInterestSearch] = useState("");

  function toggleInterest(id: string) {
    setSelectedInterests((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const fe = state.fieldErrors ?? {};

  const filteredInterests = interests.filter((i) =>
    i.name.toLowerCase().includes(interestSearch.toLowerCase())
  );

  const canAdvanceStep1 = displayName.trim() !== "" && dob !== "" && gender !== "" && department.trim() !== "" && academicYear !== "";

  return (
    <form action={formAction} className="relative pb-24 max-w-lg mx-auto w-full">
      
      {/* Step Indicator Header */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
            Step {step} of 3
          </span>
          <span className="text-xs font-semibold text-zinc-500">
            {step === 1 ? "Basic Info" : step === 2 ? "Photo & Bio" : "Preferences & Vibe"}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full bg-zinc-200/80 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-emerald-600 rounded-full"
            animate={{ width: step === 1 ? "33.3%" : step === 2 ? "66.6%" : "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Form Error Banner */}
      {state.error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-center gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{state.error}</span>
        </motion.div>
      )}

      {/* ================= STEP 1: BASICS ================= */}
      {step === 1 && (
        <motion.div
          key="step1"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          className="space-y-4"
        >
          <div className="rounded-3xl border border-zinc-200/90 bg-white/95 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-zinc-100">
              <User className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-zinc-900">Campus Identity</h2>
            </div>

            {/* Display Name */}
            <div className="space-y-1">
              <label htmlFor="display_name" className="text-[11px] font-semibold text-zinc-700">
                Display Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="display_name"
                name="display_name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
                required
                placeholder="How others will see you (e.g. Alex Sharma)"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 px-3.5 py-3 text-xs text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
              {fe.display_name && <p className="text-[10px] text-rose-600">{fe.display_name}</p>}
            </div>

            {/* Date of Birth */}
            <div className="space-y-1">
              <label htmlFor="date_of_birth" className="text-[11px] font-semibold text-zinc-700 flex items-center justify-between">
                <span>Date of Birth <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-zinc-400">18+ required</span>
              </label>
              <div className="relative">
                <input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 px-3.5 py-3 text-xs text-zinc-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              {fe.date_of_birth && <p className="text-[10px] text-rose-600">{fe.date_of_birth}</p>}
            </div>

            {/* Gender Chips */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-700">
                Gender Identity <span className="text-rose-500">*</span>
              </label>
              <input type="hidden" name="gender" value={gender} />
              <div className="grid grid-cols-2 gap-2">
                {GENDER_OPTIONS.map((g) => {
                  const isSelected = gender === g.value;
                  return (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setGender(g.value)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/80 text-emerald-700 shadow-2xs"
                          : "border-zinc-200 bg-zinc-50/70 text-zinc-700 hover:bg-zinc-100"
                      }`}
                    >
                      <span>{g.icon}</span>
                      <span className="truncate">{g.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
              {fe.gender && <p className="text-[10px] text-rose-600">{fe.gender}</p>}
            </div>

            {/* Department */}
            <div className="space-y-1">
              <label htmlFor="department" className="text-[11px] font-semibold text-zinc-700">
                Department / Program <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-zinc-400" />
                <input
                  id="department"
                  name="department"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  maxLength={100}
                  required
                  placeholder="e.g. BCA, B.Tech CSE, MBA"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 pl-9 pr-3.5 py-3 text-xs text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              {fe.department && <p className="text-[10px] text-rose-600">{fe.department}</p>}
            </div>

            {/* Academic Year Chips */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-700">
                Academic Year <span className="text-rose-500">*</span>
              </label>
              <input type="hidden" name="academic_year" value={academicYear} />
              <div className="grid grid-cols-3 gap-1.5">
                {YEAR_OPTIONS.map((y) => {
                  const isSelected = academicYear === y.value;
                  return (
                    <button
                      key={y.value}
                      type="button"
                      onClick={() => setAcademicYear(y.value)}
                      className={`py-2 px-1 rounded-xl border text-[11px] font-semibold text-center transition-all cursor-pointer ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-600 text-white shadow-2xs"
                          : "border-zinc-200 bg-zinc-50/70 text-zinc-700 hover:bg-zinc-100"
                      }`}
                    >
                      {y.label}
                    </button>
                  );
                })}
              </div>
              {fe.academic_year && <p className="text-[10px] text-rose-600">{fe.academic_year}</p>}
            </div>
          </div>
        </motion.div>
      )}

      {/* ================= STEP 2: PHOTO & BIO ================= */}
      {step === 2 && (
        <motion.div
          key="step2"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          className="space-y-4"
        >
          {/* Photo Uploader Card */}
          <div className="rounded-3xl border border-zinc-200/90 bg-white/95 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-zinc-100">
              <Camera className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-zinc-900">Campus Profile Photo</h2>
            </div>
            
            <ProfilePhotoUploader
              userId={userId}
              existingPhotoUrl={existingPhotoUrl}
              onPhotoUploaded={(path) => setPhotoPath(path)}
            />

            {photoPath && (
              <input type="hidden" name="photo_path" value={photoPath} />
            )}
          </div>

          {/* Bio Card */}
          <div className="rounded-3xl border border-zinc-200/90 bg-white/95 p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="bio" className="text-[11px] font-semibold text-zinc-700">
                Your Bio / Icebreaker
              </label>
              <span className="text-[10px] text-zinc-400">{bio.length}/500</span>
            </div>
            <textarea
              id="bio"
              name="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="What gets you excited on campus? Favorite chai spot, coding projects, sports, or exam season grind habits..."
              className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 leading-relaxed"
            />
            {fe.bio && <p className="text-[10px] text-rose-600">{fe.bio}</p>}
          </div>
        </motion.div>
      )}

      {/* ================= STEP 3: PREFERENCES & INTERESTS ================= */}
      {step === 3 && (
        <motion.div
          key="step3"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          className="space-y-4"
        >
          {/* Interests Card */}
          <div className="rounded-3xl border border-zinc-200/90 bg-white/95 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-zinc-900">Interests & Hobbies</h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {selectedInterests.size} selected
              </span>
            </div>

            {/* Search Filter */}
            {interests.length > 8 && (
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3 h-3 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Filter topics..."
                  value={interestSearch}
                  onChange={(e) => setInterestSearch(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 pl-8 pr-3 py-2 text-xs text-zinc-900 outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
              {filteredInterests.map((interest) => {
                const isSelected = selectedInterests.has(interest.id);
                return (
                  <button
                    key={interest.id}
                    type="button"
                    onClick={() => toggleInterest(interest.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-600 text-white shadow-2xs"
                        : "border-zinc-200 bg-zinc-50/80 text-zinc-700 hover:border-emerald-300 hover:bg-emerald-50/50"
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

            {fe.interests && <p className="text-[10px] text-rose-600">{fe.interests}</p>}
          </div>

          {/* Discovery Preferences Card */}
          <div className="rounded-3xl border border-zinc-200/90 bg-white/95 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-zinc-100">
              <Heart className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-zinc-900">Matching Preferences</h2>
            </div>

            {/* Interested In */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-700">
                Interested In <span className="text-rose-500">*</span>
              </label>
              <input type="hidden" name="interested_in" value={interestedIn} />
              <div className="grid grid-cols-3 gap-2">
                {INTERESTED_IN_OPTIONS.map((o) => {
                  const isSelected = interestedIn === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setInterestedIn(o.value)}
                      className={`py-2 px-1 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-600 text-white shadow-2xs"
                          : "border-zinc-200 bg-zinc-50/70 text-zinc-700 hover:bg-zinc-100"
                      }`}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
              {fe.interested_in && <p className="text-[10px] text-rose-600">{fe.interested_in}</p>}
            </div>

            {/* Age Range Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-zinc-700">
                  Target Age Range <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {minAge} - {maxAge} yrs
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-zinc-400">Min: {minAge}</span>
                  <input
                    type="range"
                    min={18}
                    max={maxAge}
                    value={minAge}
                    onChange={(e) => setMinAge(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <input type="hidden" name="min_age" value={minAge} />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400">Max: {maxAge}</span>
                  <input
                    type="range"
                    min={minAge}
                    max={35}
                    value={maxAge}
                    onChange={(e) => setMaxAge(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <input type="hidden" name="max_age" value={maxAge} />
                </div>
              </div>
            </div>

            {/* Preferred Department */}
            <div className="space-y-1">
              <label htmlFor="preferred_department" className="text-[11px] font-semibold text-zinc-700">
                Department Preference
              </label>
              <input
                id="preferred_department"
                name="preferred_department"
                type="text"
                value={preferredDept}
                onChange={(e) => setPreferredDept(e.target.value)}
                placeholder="Leave blank for any department"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* ================= PERSISTENT STICKY BOTTOM ACTIONS ================= */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-lg border-t border-zinc-200/80 z-40 max-w-lg mx-auto flex items-center gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep((prev) => (prev - 1) as 1 | 2)}
            className="flex-1 py-3.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 active:bg-zinc-200 text-zinc-700 text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        )}

        {step < 3 ? (
          <button
            type="button"
            disabled={step === 1 && !canAdvanceStep1}
            onClick={() => setStep((prev) => (prev + 1) as 2 | 3)}
            className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            Continue <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving Profile...
              </>
            ) : (
              <>
                Complete Setup <Check className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>

    </form>
  );
}