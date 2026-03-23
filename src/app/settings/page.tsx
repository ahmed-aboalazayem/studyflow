"use client"

import * as React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Settings, User as UserIcon, Lock, Camera, Save, LogOut, CheckCircle2, Database, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { updateProfileAction, fixDatabaseSchema } from "@/app/actions"
import { BackgroundEffect } from "@/components/ui/BackgroundEffect"
import { Modal } from "@/components/ui/Modal"
import { LoadingState } from "@/components/ui/LoadingState"

const AVATARS = [
  "https://api.dicebear.com/9.x/lorelei/svg?seed=Aria",
  "https://api.dicebear.com/9.x/lorelei/svg?seed=Leo",
  "https://api.dicebear.com/9.x/lorelei/svg?seed=Luna",
  "https://api.dicebear.com/9.x/lorelei/svg?seed=Milo",
  "https://api.dicebear.com/9.x/lorelei/svg?seed=Zoe",
  "https://api.dicebear.com/9.x/lorelei/svg?seed=Jasper",
  "https://api.dicebear.com/9.x/lorelei/svg?seed=Maya",
]

export default function SettingsPage() {
  const { user: authUser, checkSession, logout } = useAuth()
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [imageUrl, setImageUrl] = React.useState("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [modal, setModal] = React.useState<{ isOpen: boolean; title: string; description: string; type: "success" | "error" | "info" }>({
    isOpen: false,
    title: "",
    description: "",
    type: "info"
  })

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

  const handleFix = async () => {
    setLoading(true)
    const res = await fixDatabaseSchema()
    if (res.success) {
      setModal({
        isOpen: true,
        title: "Database Repaired!",
        description: "Missing columns have been added manually. You can now use all profile features.",
        type: "success"
      })
    } else {
      setModal({
        isOpen: true,
        title: "Repair Failed",
        description: res.error || "Something went wrong while fixing the database.",
        type: "error"
      })
    }
    setLoading(false)
  }

  if (loading && !authUser) {
     return (
       <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
         <BackgroundEffect />
         <LoadingState />
       </div>
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
            <Button 
              onClick={handleFix}
              variant="glass" 
              size="sm"
              className="border-primary/20 text-primary/60 hover:text-primary hover:border-primary/40 bg-primary/5 rounded-xl text-[10px] font-black uppercase tracking-widest h-8"
            >
              <Database className="w-3.5 h-3.5 mr-1.5" />
              Fix Database
            </Button>
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
                        <Image src={imageUrl} alt="Profile" fill className="object-cover" />
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
                    <p className="text-[10px] text-foreground/40 mb-3 font-black uppercase tracking-[0.2em]">Choose from our avatar collection</p>
                    <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                      {AVATARS.map((avatar, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setImageUrl(avatar)}
                          className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all hover:scale-110 active:scale-95 ${
                            imageUrl === avatar ? 'border-primary ring-4 ring-primary/20' : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          <Image src={avatar} alt={`Avatar ${idx}`} width={40} height={40} />
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
    </main>
  )
}
