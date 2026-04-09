"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  User as UserIcon, Lock, Camera, Save, LogOut, Shield,
  Zap, Flame, Trophy, BarChart3, BookOpen, ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { useStore } from "@/lib/store"
import { updateProfileAction } from "@/app/actions"
import { BackgroundEffect } from "@/components/ui/BackgroundEffect"
import { Modal } from "@/components/ui/Modal"
import { useGamification } from "@/hooks/useGamification"
import { useStreaks } from "@/hooks/useStreaks"
import Link from "next/link"

const AVATARS = [
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Goku&hair=short01,short02,short04,short16&accessoriesProbability=0",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Zoro&hair=short01,short02,short04,short16&accessoriesProbability=0",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Levi&hair=short01,short02,short04,short16&accessoriesProbability=0",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Saitama&hair=short01,short02,short04,short16&accessoriesProbability=0",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Luffy&hair=short01,short02,short04,short16&accessoriesProbability=0",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Jotaro&hair=short01,short02,short04,short16&accessoriesProbability=0",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Alucard&hair=short01,short02,short04,short16&accessoriesProbability=0",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Kenpachi&hair=short01,short02,short04,short16&accessoriesProbability=0",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Itachi&hair=short01,short02,short04,short16&accessoriesProbability=0",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Guts&hair=short01,short02,short04,short16&accessoriesProbability=0"
]

// ─── Section Wrapper ─────────────────────────────────────────────────
function SettingsSection({
  title, icon, children, delay = 0
}: {
  title: string; icon: React.ReactNode; children: React.ReactNode; delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden"
    >
      <div className="flex items-center gap-2.5 mb-6">
        {icon}
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white/60">{title}</h2>
      </div>
      {children}
    </motion.div>
  )
}

export default function SettingsPage() {
  const { user: authUser, checkSession, logout } = useAuth()
  const { deleteAccount, courses } = useStore()
  const { xp, levelInfo } = useGamification()
  const { streak } = useStreaks()

  const [saving, setSaving] = React.useState(false)
  const [isReading, setIsReading] = React.useState(false)
  const [imageUrl, setImageUrl] = React.useState("")
  const [showDeleteModal, setShowDeleteModal] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [modal, setModal] = React.useState<{ isOpen: boolean; title: string; description: string; type: "success" | "error" | "info" }>({
    isOpen: false, title: "", description: "", type: "info"
  })

  React.useEffect(() => {
    if (authUser?.imageUrl) setImageUrl(authUser.imageUrl)
  }, [authUser])

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      const res = await deleteAccount()
      if (res.error) {
        setModal({ isOpen: true, title: "Deletion Failed", description: res.error, type: "error" })
      }
    } catch {
      setModal({ isOpen: true, title: "Deletion Failed", description: "Something went wrong.", type: "error" })
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setModal({ isOpen: true, title: "File Too Large", description: "Please choose an image smaller than 2MB.", type: "error" })
      return
    }
    setIsReading(true)
    const reader = new FileReader()
    reader.onloadend = () => { setImageUrl(reader.result as string); setIsReading(false) }
    reader.onerror = () => { setIsReading(false); setModal({ isOpen: true, title: "Read Error", description: "Failed to read file.", type: "error" }) }
    reader.readAsDataURL(file)
  }

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    formData.set('imageUrl', imageUrl)
    const result = await updateProfileAction(formData)
    setSaving(false)
    if ('success' in result) {
      setModal({ isOpen: true, title: "Profile Updated!", description: "Your changes have been saved.", type: "success" })
      checkSession()
    } else {
      setModal({ isOpen: true, title: "Update Failed", description: result.error || "Failed to update.", type: "error" })
    }
  }

  // Loading state
  if (!authUser) {
    return (
      <main className="relative min-h-screen pt-24 pb-12">
        <BackgroundEffect />
        <div className="container mx-auto px-4 max-w-3xl relative z-10 animate-pulse">
          <div className="space-y-2 mb-12">
            <div className="h-10 w-48 bg-white/10 rounded-xl" />
            <div className="h-5 w-64 bg-white/5 rounded-lg" />
          </div>
          <div className="glass border border-white/10 rounded-3xl p-8 space-y-8">
            <div className="flex items-center gap-8">
              <div className="w-32 h-32 rounded-3xl bg-white/5" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-white/5" />
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map(i => <div key={i} className="w-10 h-10 rounded-xl bg-white/5" />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  const { current: currentLevel } = levelInfo
  const totalCourses = courses.length
  const totalCompleted = courses.filter(c => c.progress >= 100).length

  return (
    <main className="relative min-h-screen pt-24 pb-12">
      <BackgroundEffect />

      <div className="container mx-auto px-4 max-w-3xl relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-gradient tracking-tighter mb-2">Settings</h1>
          <p className="text-foreground/40 text-lg">Manage your profile, track your stats, and secure your account.</p>
        </motion.div>

        <div className="space-y-6">

          {/* ── SECTION 1: Your Stats (from DB) ── */}
          <SettingsSection title="Your Stats" icon={<BarChart3 className="w-4 h-4 text-emerald-400" />} delay={0}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* XP */}
              <div className="relative bg-black/30 border border-white/5 rounded-2xl p-4 text-center overflow-hidden group hover:border-primary/30 transition-all">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 blur-2xl rounded-full pointer-events-none" />
                <Zap className="w-5 h-5 mx-auto mb-2" style={{ color: currentLevel.color }} />
                <p className="text-2xl font-black text-white tabular-nums">{xp.toLocaleString()}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">Total XP</p>
              </div>
              {/* Level */}
              <div className="relative bg-black/30 border border-white/5 rounded-2xl p-4 text-center overflow-hidden group hover:border-primary/30 transition-all">
                <div className="absolute top-0 right-0 w-16 h-16 blur-2xl rounded-full pointer-events-none" style={{ backgroundColor: `${currentLevel.color}20` }} />
                <Trophy className="w-5 h-5 mx-auto mb-2" style={{ color: currentLevel.color }} />
                <p className="text-2xl font-black" style={{ color: currentLevel.color }}>{currentLevel.level}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">{currentLevel.name}</p>
              </div>
              {/* Streak */}
              <div className="relative bg-black/30 border border-white/5 rounded-2xl p-4 text-center overflow-hidden group hover:border-orange-500/30 transition-all">
                <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 blur-2xl rounded-full pointer-events-none" />
                <Flame className="w-5 h-5 mx-auto mb-2 text-orange-400" />
                <p className="text-2xl font-black text-white tabular-nums">{streak}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">Day Streak</p>
              </div>
              {/* Courses */}
              <div className="relative bg-black/30 border border-white/5 rounded-2xl p-4 text-center overflow-hidden group hover:border-blue-500/30 transition-all">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-2xl rounded-full pointer-events-none" />
                <BookOpen className="w-5 h-5 mx-auto mb-2 text-blue-400" />
                <p className="text-2xl font-black text-white tabular-nums">{totalCompleted}/{totalCourses}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">Courses Done</p>
              </div>
            </div>

            {/* Level progress */}
            <div className="mt-5 bg-black/20 border border-white/5 rounded-2xl p-4">
              <div className="flex justify-between items-center text-xs font-bold text-white/40 mb-2">
                <span>Level {currentLevel.level} — {currentLevel.name}</span>
                <span>{levelInfo.next ? `${levelInfo.progressPercent}% → ${levelInfo.next.name}` : "MAX LEVEL"}</span>
              </div>
              <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: currentLevel.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${levelInfo.progressPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Quick links */}
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/progress" className="flex items-center gap-2 text-xs font-bold text-white/40 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl border border-white/5 transition-all">
                <BarChart3 className="w-3.5 h-3.5" /> View Full Progress <ChevronRight className="w-3 h-3" />
              </Link>
              <Link href="/map" className="flex items-center gap-2 text-xs font-bold text-emerald-400/70 hover:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-500/10 transition-all">
                <Trophy className="w-3.5 h-3.5" /> Adventure Map <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </SettingsSection>

          {/* ── SECTION 2: Profile Identity ── */}
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <SettingsSection title="Profile Identity" icon={<Shield className="w-4 h-4 text-primary" />} delay={0.1}>
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Avatar */}
                <div className="relative group shrink-0">
                  <div className="w-28 h-28 rounded-3xl overflow-hidden border-2 border-primary/20 bg-black/40 relative shadow-[0_0_30px_rgba(255,31,31,0.1)]">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary/20">
                        <UserIcon className="w-12 h-12" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white backdrop-blur-sm"
                    >
                      <Camera className="w-6 h-6" />
                      <span className="text-[10px] font-bold uppercase">Upload</span>
                    </button>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                </div>

                {/* Avatar grid */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-foreground/40 mb-3 font-black uppercase tracking-[0.2em]">Choose an Avatar</p>
                  <div className="grid grid-cols-5 gap-3">
                    {AVATARS.map((avatar, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageUrl(avatar)}
                        className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all ${
                          imageUrl === avatar ? 'border-primary ring-4 ring-primary/20 scale-110' : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <img src={avatar} alt={`Avatar ${idx}`} width={40} height={40} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Name fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6 pt-6 border-t border-white/5">
                <div>
                  <label className="block text-[10px] font-black text-foreground/40 mb-2 uppercase tracking-[0.2em]">Display Name</label>
                  <Input
                    name="displayName"
                    defaultValue={authUser?.displayName || ""}
                    placeholder="e.g. Alex Study"
                    className="bg-black/20 border-white/10 h-12 text-white focus:border-primary/50 transition-all rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-foreground/40 mb-2 uppercase tracking-[0.2em]">Username</label>
                  <Input
                    defaultValue={authUser?.username}
                    disabled
                    className="bg-black/40 border-white/5 h-12 text-white/40 cursor-not-allowed rounded-xl"
                  />
                  <p className="text-[10px] text-foreground/20 mt-1 px-1">Cannot be changed</p>
                </div>
              </div>
            </SettingsSection>

            {/* ── SECTION 3: Security ── */}
            <SettingsSection title="Security" icon={<Lock className="w-4 h-4 text-amber-400" />} delay={0.15}>
              <div>
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">New Password</label>
                <Input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-black/20 border-white/10 h-12 rounded-xl max-w-md"
                />
                <p className="text-[10px] text-foreground/30 px-1 mt-2 italic">Leave blank to keep your current password.</p>
              </div>
            </SettingsSection>

            {/* Save + Logout row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-4"
            >
              <Button
                type="submit"
                disabled={saving || isReading}
                className="flex-1 h-14 text-lg font-black bg-primary hover:bg-primary/90 shadow-[0_0_30px_rgba(255,31,31,0.2)] rounded-2xl transition-all active:scale-95"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" />
                    Saving…
                  </div>
                ) : isReading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" />
                    Processing…
                  </div>
                ) : (
                  <>
                    Save Changes
                    <Save className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={() => logout()}
                variant="glass"
                className="h-14 px-8 border border-white/5 hover:border-red-500/30 hover:bg-red-500/5 text-white/40 hover:text-red-500 rounded-2xl transition-all"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </motion.div>
          </form>

          {/* ── SECTION 4: Danger Zone ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-6"
          >
            <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-red-500">Danger Zone</h3>
                <p className="text-sm text-foreground/40">Once you delete your account, there is no going back. All courses, progress, and XP will be lost.</p>
              </div>
              <Button
                type="button"
                variant="glass"
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-2xl h-12 px-6 font-bold shrink-0"
              >
                Delete Account
              </Button>
            </div>
          </motion.div>

        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
        title={modal.title}
        description={modal.description}
        type={modal.type}
      />
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account?"
        description="Are you sure you want to delete your account? All your courses, progress, and data will be permanently removed. This action cannot be undone."
        type="error"
        actionText={deleting ? "Deleting..." : "Delete Permanently"}
        onAction={handleDeleteAccount}
      />
    </main>
  )
}
