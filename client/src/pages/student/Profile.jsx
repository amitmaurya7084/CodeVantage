import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  User,
  GraduationCap,
  Sparkles,
  Link2,
  SlidersHorizontal,
  Camera,
  Github,
  Linkedin,
  Pencil,
  Loader2,
  X,
  Plus,
  Shield,
  ShieldCheck,
  Bell,
  Calendar,
  CheckCircle2,
  Building2,
  Home,
  ChevronRight,
  ExternalLink,
  Save,
  Users,
  Clock,
  Award,
  BookOpen,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Field from "../../components/ui/Field";
import { useAuth } from "../../context/AuthContext";
import { fetchDashboard } from "../../services/studentService";

const YEAR_OPTIONS = ["First Year", "Second Year", "Third Year", "Final Year", "Graduated"];

const TABS = [
  {
    id: "personal",
    label: "Personal Information",
    icon: User,
    description: "Update your basic information. Keep your details accurate.",
  },
  { id: "education", label: "Education", icon: GraduationCap, description: "Update your college and course details." },
  { id: "skills", label: "Skills", icon: Sparkles, description: "Add or remove the skills you want to showcase." },
  { id: "social", label: "Social Links", icon: Link2, description: "Link your GitHub and LinkedIn profiles." },
  {
    id: "preferences",
    label: "Preferences",
    icon: SlidersHorizontal,
    description: "Notification and account security information.",
  },
];

// Small brand icons for the skill chips (falls back to a plain chip when unknown).
const SKILL_ICONS = {
  react: "react",
  "node.js": "nodejs",
  node: "nodejs",
  mongodb: "mongodb",
  "express.js": "express",
  express: "express",
  javascript: "javascript",
  js: "javascript",
  html: "html5",
  html5: "html5",
  css: "css3",
  css3: "css3",
  "tailwind css": "tailwindcss",
  tailwind: "tailwindcss",
  git: "git",
  github: "github",
  python: "python",
  php: "php",
  mysql: "mysql",
  "vs code": "vscode",
};

function skillIconUrl(skill) {
  const key = SKILL_ICONS[skill.trim().toLowerCase()];
  return key ? `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${key}/${key}-original.svg` : null;
}

function dateInputValue(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function Avatar({ student, onUpload, isUploading }) {
  const fileInputRef = useRef(null);
  const initials = (student?.fullName || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative h-28 w-28 sm:h-36 sm:w-36 flex-shrink-0">
      {student?.profilePictureUrl ? (
        <img
          src={student.profilePictureUrl}
          alt={student.fullName}
          className="h-full w-full rounded-full object-cover border-4 border-white shadow-card"
        />
      ) : (
        <div className="h-full w-full rounded-full border-4 border-white shadow-card bg-white text-brand flex items-center justify-center text-3xl font-bold">
          {initials}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        title="Upload profile picture (optional)"
        className="absolute bottom-1 right-1 h-9 w-9 rounded-full bg-brand text-white flex items-center justify-center border-2 border-white hover:bg-brand-dark transition-colors disabled:opacity-60"
      >
        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
      </button>
    </div>
  );
}

function PersonalInfoTab({ student, onSave, isEditing, setIsEditing }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      fullName: student?.fullName || "",
      phone: student?.phone || "",
      dateOfBirth: dateInputValue(student?.dateOfBirth),
      bio: student?.bio || "",
    },
  });

  const bioLength = (watch("bio") || "").length;

  useEffect(() => {
    reset({
      fullName: student?.fullName || "",
      phone: student?.phone || "",
      dateOfBirth: dateInputValue(student?.dateOfBirth),
      bio: student?.bio || "",
    });
  }, [student, reset]);

  async function onSubmit(values) {
    try {
      await onSave(values);
      toast.success("Profile updated.");
      setIsEditing(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't save changes.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Full Name" required error={errors.fullName}>
          <input
            className="input disabled:bg-slate-50 disabled:text-muted"
            disabled={!isEditing}
            {...register("fullName", { required: "Full name is required" })}
          />
        </Field>
        <Field label="Email Address" hint="Email can't be changed here.">
          <input className="input bg-slate-50 text-muted" value={student?.email || ""} disabled readOnly />
        </Field>
        <Field label="Phone Number" required error={errors.phone}>
          <input
            className="input disabled:bg-slate-50 disabled:text-muted"
            disabled={!isEditing}
            {...register("phone", { required: "Phone number is required" })}
          />
        </Field>
        <Field label="Date of Birth">
          <input
            type="date"
            className="input disabled:bg-slate-50 disabled:text-muted"
            disabled={!isEditing}
            {...register("dateOfBirth")}
          />
        </Field>
      </div>

      <Field
        label="About Yourself"
        hint={isEditing ? "Max 500 characters." : undefined}
      >
        <textarea
          rows={4}
          maxLength={500}
          className="input resize-none disabled:bg-slate-50 disabled:text-muted"
          disabled={!isEditing}
          placeholder="Tell us a bit about yourself..."
          {...register("bio", { maxLength: 500 })}
        />
        <p className="mt-1 text-right text-xs text-muted">{bioLength}/500</p>
      </Field>

      {isEditing && (
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              setIsEditing(false);
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </form>
  );
}

function EducationTab({ student, onSave, isEditing, setIsEditing }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      college: student?.college || "",
      course: student?.course || "",
      year: student?.year || "",
    },
  });

  useEffect(() => {
    reset({ college: student?.college || "", course: student?.course || "", year: student?.year || "" });
  }, [student, reset]);

  async function onSubmit(values) {
    try {
      await onSave(values);
      toast.success("Education details updated.");
      setIsEditing(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't save changes.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="College / University" required error={errors.college}>
          <input
            className="input disabled:bg-slate-50 disabled:text-muted"
            disabled={!isEditing}
            {...register("college", { required: "College / University is required" })}
          />
        </Field>
        <Field label="Course / Degree" required error={errors.course}>
          <input
            className="input disabled:bg-slate-50 disabled:text-muted"
            disabled={!isEditing}
            {...register("course", { required: "Course / Degree is required" })}
          />
        </Field>
        <Field label="Current Year">
          <select className="input disabled:bg-slate-50 disabled:text-muted" disabled={!isEditing} {...register("year")}>
            <option value="">Select...</option>
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {isEditing && (
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              setIsEditing(false);
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </form>
  );
}

function SkillsTab({ student, onSave }) {
  const [skills, setSkills] = useState(student?.skills || []);
  const [draft, setDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSkills(student?.skills || []);
  }, [student]);

  function addSkill(e) {
    e.preventDefault();
    const value = draft.trim();
    if (!value) return;
    if (skills.some((s) => s.toLowerCase() === value.toLowerCase())) {
      setDraft("");
      return;
    }
    if (skills.length >= 20) {
      toast.error("You can list at most 20 skills.");
      return;
    }
    setSkills((prev) => [...prev, value]);
    setDraft("");
  }

  function removeSkill(skill) {
    setSkills((prev) => prev.filter((s) => s !== skill));
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await onSave({ skills });
      toast.success("Skills updated.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't save skills.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <Field label="Add a skill" hint="Press Enter or tap + to add. Max 20 skills.">
        <form onSubmit={addSkill} className="flex gap-2">
          <input
            className="input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. React, Node.js, MongoDB"
          />
          <Button type="submit" variant="outline" className="flex-shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </form>
      </Field>

      <div className="flex flex-wrap gap-2">
        {skills.length === 0 && <p className="text-sm text-muted">No skills added yet.</p>}
        {skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand/10 text-brand px-3 py-1.5 text-sm font-medium"
          >
            {skill}
            <button type="button" onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`}>
              <X className="h-3.5 w-3.5 hover:text-brand-dark" />
            </button>
          </span>
        ))}
      </div>

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Save className="h-4 w-4" /> Save Skills
          </>
        )}
      </Button>
    </div>
  );
}

function SocialLinksTab({ student, onSave, isEditing, setIsEditing }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: { githubUrl: student?.githubUrl || "", linkedinUrl: student?.linkedinUrl || "" },
  });

  useEffect(() => {
    reset({ githubUrl: student?.githubUrl || "", linkedinUrl: student?.linkedinUrl || "" });
  }, [student, reset]);

  async function onSubmit(values) {
    try {
      await onSave(values);
      toast.success("Social links updated.");
      setIsEditing(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't save changes.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Field label="GitHub URL" error={errors.githubUrl}>
        <div className="flex items-center gap-2">
          <Github className="h-4 w-4 text-muted flex-shrink-0" />
          <input
            className="input disabled:bg-slate-50 disabled:text-muted"
            disabled={!isEditing}
            placeholder="https://github.com/yourname"
            {...register("githubUrl")}
          />
        </div>
      </Field>
      <Field label="LinkedIn URL" error={errors.linkedinUrl}>
        <div className="flex items-center gap-2">
          <Linkedin className="h-4 w-4 text-muted flex-shrink-0" />
          <input
            className="input disabled:bg-slate-50 disabled:text-muted"
            disabled={!isEditing}
            placeholder="https://linkedin.com/in/yourname"
            {...register("linkedinUrl")}
          />
        </div>
      </Field>

      {isEditing && (
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              setIsEditing(false);
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </form>
  );
}

function PreferencesTab() {
  // No backend-stored preferences yet (notification settings, etc. aren't part of
  // the Student model) — shown as read-only info rather than fake toggles that
  // would silently do nothing when clicked.
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 rounded-lg bg-surface border border-slate-100">
        <Bell className="h-5 w-5 text-brand flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-navy">Notification preferences</p>
          <p className="text-sm text-muted mt-0.5">
            Email notifications are sent for task reviews, payment approval, and certificate readiness. Granular
            controls aren't available yet.
          </p>
        </div>
      </div>
      <div className="flex items-start gap-3 p-4 rounded-lg bg-surface border border-slate-100">
        <Shield className="h-5 w-5 text-brand flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-navy">Password & security</p>
          <p className="text-sm text-muted mt-0.5">
            Use the "Forgot Password" link on the login page to change your password.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, tone }) {
  const tones = {
    brand: { tile: "bg-blue-50", icon: "bg-blue-100 text-brand" },
    success: { tile: "bg-green-50", icon: "bg-green-100 text-success" },
    warning: { tile: "bg-orange-50", icon: "bg-orange-100 text-orange-500" },
    purple: { tile: "bg-purple-50", icon: "bg-purple-100 text-purple-600" },
  };
  const t = tones[tone];
  return (
    <div className={`rounded-xl p-4 flex items-center gap-3 ${t.tile}`}>
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${t.icon}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-navy leading-none">{value}</p>
        <p className="text-xs text-muted mt-1.5">{label}</p>
      </div>
    </div>
  );
}

/** One row in the Social Links side card. */
function SocialRow({ icon, name, url }) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <p className="w-16 flex-shrink-0 text-sm font-medium text-navy">{name}</p>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-muted hover:text-brand"
        >
          <span className="truncate">{url}</span>
          <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-brand" aria-hidden="true" />
        </a>
      ) : (
        <span className="flex-1 rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-muted">Not added</span>
      )}
    </div>
  );
}

function Profile() {
  const { student, updateProfile, uploadProfilePicture } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDashboard()
      .then((data) =>
        setStats({
          totalProjects: data.student.program?.projectsCount ?? data.totalTasks ?? 0,
          completed: data.approvedCount ?? 0,
          pending: (data.totalTasks ?? 0) - (data.approvedCount ?? 0),
          certificates: data.student.certificateStatus === "generated" ? 1 : 0,
        })
      )
      .catch(() => setStats(null));
  }, []);

  async function handlePictureUpload(file) {
    setIsUploadingPicture(true);
    try {
      await uploadProfilePicture(file);
      toast.success("Profile picture updated.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't upload image.");
    } finally {
      setIsUploadingPicture(false);
    }
  }

  const memberSince = student?.createdAt
    ? new Date(student.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long" })
    : "—";

  const currentTab = TABS.find((t) => t.id === activeTab);

  return (
    <div>
      {/* Page header + breadcrumb */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-navy mb-1">My Profile</h1>
          <p className="text-muted">Manage your personal information, skills, and preferences.</p>
        </div>
        <nav className="flex items-center gap-2 text-sm text-muted" aria-label="Breadcrumb">
          <Home className="h-4 w-4 text-navy" aria-hidden="true" />
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <Link to="/student/dashboard" className="hover:text-brand">
            Dashboard
          </Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="font-medium text-brand">My Profile</span>
        </nav>
      </div>

      <div className="grid xl:grid-cols-[1.7fr,1fr] gap-6 items-start">
        {/* LEFT: profile card + tabs */}
        <div className="space-y-6 min-w-0">
          <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-100 via-blue-50 to-white p-6">
            {/* decorative waves */}
            <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-blue-200/50 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-white/70 blur-2xl" />

            <button
              type="button"
              onClick={() => {
                setActiveTab("personal");
                setIsEditing(true);
              }}
              className="relative z-10 mb-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand shadow-sm hover:bg-blue-50 sm:absolute sm:right-5 sm:top-5 sm:mb-0"
            >
              <Pencil className="h-4 w-4" /> Edit Profile
            </button>

            <div className="relative flex items-start gap-6 flex-wrap sm:flex-nowrap">
              <Avatar student={student} onUpload={handlePictureUpload} isUploading={isUploadingPicture} />
              <div className="min-w-0 flex-1 pt-1 sm:pr-32">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-navy">{student?.fullName}</h2>
                <p className="text-lg text-muted mt-0.5">{student?.course || "Course not set"}</p>
                <div className="flex items-center gap-5 mt-2 text-sm text-muted flex-wrap">
                  {student?.year && (
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="h-4 w-4" /> {student.year}
                    </span>
                  )}
                  {student?.college && (
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4" /> {student.college}
                    </span>
                  )}
                </div>
                {student?.bio && <p className="text-navy mt-3 max-w-xl">{student.bio}</p>}
                <div className="flex items-center gap-3 mt-4 flex-wrap">
                  {student?.githubUrl && (
                    <a
                      href={student.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-3.5 py-2 text-sm font-medium text-navy shadow-sm hover:border-brand"
                    >
                      <Github className="h-4 w-4" /> GitHub
                    </a>
                  )}
                  {student?.linkedinUrl && (
                    <a
                      href={student.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-3.5 py-2 text-sm font-medium text-navy shadow-sm hover:border-brand"
                    >
                      <Linkedin className="h-4 w-4 text-[#0A66C2]" /> LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="flex overflow-x-auto border-b border-slate-100 px-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsEditing(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-brand text-brand"
                      : "border-transparent text-muted hover:text-navy"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-6">
              <div className="rounded-xl border border-slate-100 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 text-brand">
                      <currentTab.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-bold text-navy">{currentTab?.label}</p>
                      <p className="text-xs text-muted">{currentTab?.description}</p>
                    </div>
                  </div>
                  {activeTab !== "skills" && activeTab !== "preferences" && !isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-dark"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                  )}
                </div>

                {activeTab === "personal" && (
                  <PersonalInfoTab
                    student={student}
                    onSave={updateProfile}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                  />
                )}
                {activeTab === "education" && (
                  <EducationTab
                    student={student}
                    onSave={updateProfile}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                  />
                )}
                {activeTab === "skills" && <SkillsTab student={student} onSave={updateProfile} />}
                {activeTab === "social" && (
                  <SocialLinksTab
                    student={student}
                    onSave={updateProfile}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                  />
                )}
                {activeTab === "preferences" && <PreferencesTab />}
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT: stats, skills, social links, account info */}
        <div className="space-y-6 min-w-0">
          {stats && (
            <Card className="p-4">
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={BookOpen} value={stats.totalProjects} label="Total Projects" tone="brand" />
                <StatCard icon={CheckCircle2} value={stats.completed} label="Completed Tasks" tone="success" />
                <StatCard icon={Clock} value={stats.pending} label="Pending Tasks" tone="warning" />
                <StatCard icon={Award} value={stats.certificates} label="Certificates Earned" tone="purple" />
              </div>
            </Card>
          )}

          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="flex items-center gap-2.5 font-bold text-navy">
                <Users className="h-5 w-5 text-brand" aria-hidden="true" /> Skills
              </p>
              <button onClick={() => setActiveTab("skills")} className="text-sm font-medium text-brand">
                Manage Skills
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(student?.skills || []).map((skill) => {
                const icon = skillIconUrl(skill);
                return (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-navy"
                  >
                    {icon && <img src={icon} alt="" className="h-4 w-4 object-contain" />}
                    {skill}
                  </span>
                );
              })}
              <button
                type="button"
                onClick={() => setActiveTab("skills")}
                className="inline-flex items-center gap-1 rounded-lg border border-dashed border-brand/50 px-2.5 py-1.5 text-xs font-medium text-brand hover:bg-blue-50"
              >
                <Plus className="h-3.5 w-3.5" /> Add Skill
              </button>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="flex items-center gap-2.5 font-bold text-navy">
                <Link2 className="h-5 w-5 text-brand" aria-hidden="true" /> Social Links
              </p>
              <button
                onClick={() => {
                  setActiveTab("social");
                  setIsEditing(true);
                }}
                className="text-sm font-medium text-brand"
              >
                Edit Links
              </button>
            </div>
            <div className="space-y-3">
              <SocialRow
                icon={<Github className="h-6 w-6 flex-shrink-0 text-navy" aria-hidden="true" />}
                name="GitHub"
                url={student?.githubUrl}
              />
              <SocialRow
                icon={
                  <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-[#0A66C2] text-white">
                    <Linkedin className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                }
                name="LinkedIn"
                url={student?.linkedinUrl}
              />
            </div>
          </Card>

          <Card className="p-5">
            <p className="flex items-center gap-2.5 font-bold text-navy mb-4">
              <ShieldCheck className="h-5 w-5 text-brand" aria-hidden="true" /> Account Information
            </p>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2.5 text-muted">
                  <Bell className="h-4 w-4" aria-hidden="true" /> Account Type
                </span>
                <span className="rounded-full bg-blue-100 text-brand px-3 py-1 text-xs font-medium">Student</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2.5 text-muted">
                  <Calendar className="h-4 w-4" aria-hidden="true" /> Member Since
                </span>
                <span className="font-medium text-navy">{memberSince}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2.5 text-muted">
                  <Shield className="h-4 w-4" aria-hidden="true" /> Account Status
                </span>
                <span className="rounded-full bg-green-100 text-success px-3 py-1 text-xs font-medium">
                  {student?.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Profile;
