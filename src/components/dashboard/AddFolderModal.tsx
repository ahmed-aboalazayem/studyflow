"use client"

import * as React from "react"
import { Modal } from "@/components/ui/Modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

interface AddFolderModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddFolderModal({ isOpen, onClose }: AddFolderModalProps) {
  const [folderName, setFolderName] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const { createFolder } = useStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!folderName.trim()) return

    setLoading(true)
    try {
      await createFolder(folderName.trim())
      setFolderName("")
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Folder"
      description="Organize your courses into categories for a cleaner dashboard."
    >
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <Input
          placeholder="Folder Name (e.g. University, Personal, Web Dev)"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          className="bg-white/5 border-white/10 glass focus:border-primary/50 text-white"
          autoFocus
        />
        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-white/40 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !folderName.trim()}
            className="bg-primary hover:bg-primary/80 text-white font-bold"
          >
            {loading ? "Creating..." : "Create Folder"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
