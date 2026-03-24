"use client"

import * as React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Settings, User as UserIcon, Lock, Camera, Save, LogOut, CheckCircle2, Database, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { useStore } from "@/lib/store"
import { updateProfileAction } from "@/app/actions"
import { BackgroundEffect } from "@/components/ui/BackgroundEffect"
import { Modal } from "@/components/ui/Modal"
import { LoadingState } from "@/components/ui/LoadingState"

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

export default function SettingsPage() {
  const { user: authUser, checkSession, logout } = useAuth()
  const { deleteAccount } = useStore()
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [imageUrl, setImageUrl] = React.useState("")
  const [showDeleteModal, setShowDeleteModal] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [modal, setModal] = React.useState<{ isOpen: boolean; title: string; description: string; type: "success" | "error" | "info" }>({
    isOpen: false,
    title: "",
    description: "",
    type: "info"
  })

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      const res = await deleteAccount()
      if (res.error) {
        setModal({
          isOpen: true,
          title: "Deletion Failed",
          description: res.error,
          type: "error"
        })
      }
    } catch (err) {
      console.error("Failed to delete account", err)
      setModal({
        isOpen: true,
        title: "Deletion Failed",
        description: "Something went wrong while deleting your account.",
        type: "error"
      })
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  React.useEffect(() => {
    if (authUser) {
      if (authUser.imageUrl) setImageUrl(authUser.imageUrl)
      setLoading(false)
    }
  }, [authUser])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setModal({
        isOpen: true,
        title: "File Too Large",
        description: "Please choose an image smaller than 2MB.",
        type: "error"
      })
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setImageUrl(reader.result as string)
    }
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
      setModal({
        isOpen: true,
        title: "Profile Updated!",
        description: "Your profile changes have been saved successfully.",
        type: "success"
      })
      checkSession()
    } else {
      setModal({
        isOpen: true,
        title: "Update Failed",
        description: result.error || "Failed to update profile.",
        type: "error"
      })
    }
  }

  if (loading && !authUser) {
     return (
       <main className="relative min-h-screen pt-24 pb-12">
         <BackgroundEffect />
         <div className="container mx-auto px-4 max-w-2xl relative z-10 animate-pulse">
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
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-white/5" />
                  <div className="h-12 w-full bg-white/5 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-white/5" />
                  <div className="h-12 w-full bg-white/5 rounded-xl" />
                </div>
              </div>
            </div>
         </div>
       </main>
     )
  }

  return (
    <main className="relative min-h-screen pt-24 pb-12">
      <BackgroundEffect />
      
      <div className="container mx-auto px-4 max-w-2xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-gradient tracking-tighter mb-2">Settings</h1>
              <p className="text-foreground/40">Manage your profile, security, and preferences.</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="glass border border-white/10 rounded-3xl p-8 space-y-8">
              {/* Profile Picture Section */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold uppercase tracking-widest text-white/60">Profile Identity</span>
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-primary/20 bg-black/40 relative shadow-[0_0_30px_rgba(255,31,31,0.1)]">
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
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      className="hidden" 
                      accept="image/*"
                    />
                  </div>

                  <div className="flex-1">
                    <p className="text-[10px] text-foreground/40 mb-3 font-black uppercase tracking-[0.2em]">Choose a Powerful Avatar</p>
                    <div className="grid grid-cols-5 sm:grid-cols-5 gap-3">
                      {AVATARS.map((avatar, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setImageUrl(avatar)}
                          className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all hover:scale-110 active:scale-95 ${
                            imageUrl === avatar ? 'border-primary ring-4 ring-primary/20' : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          <img src={avatar} alt={`Avatar ${idx}`} width={40} height={40} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
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
                </div>
              </div>

              {/* Security */}
              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold uppercase tracking-widest text-white/60">Security</span>
                </div>
                
                <div className="grid gap-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">New Password</label>
                  <Input 
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="bg-black/20 border-white/10 h-12 rounded-xl"
                  />
                  <p className="text-[10px] text-foreground/30 px-1 italic">Leave blank if you don't want to change it</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={saving}
                className="flex-1 h-14 text-lg font-black bg-primary hover:bg-primary/90 shadow-[0_0_30px_rgba(255,31,31,0.2)] rounded-3xl transition-all hover:scale-[1.02] active:scale-95"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                    Saving...
                  </div>
                ) : (
                  <>
                    Save Profile
                    <Save className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
              <Button 
                type="button"
                onClick={() => logout()}
                variant="glass"
                className="h-14 px-8 border border-white/5 hover:border-red-500/30 hover:bg-red-500/5 text-white/40 hover:text-red-500 rounded-3xl transition-all"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="pt-12 border-t border-white/5">
              <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-red-500">Danger Zone</h3>
                  <p className="text-sm text-foreground/40">Once you delete your account, there is no going back. Please be certain.</p>
                </div>
                <Button 
                  type="button"
                  variant="glass"
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-2xl h-12 px-6 font-bold"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
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
