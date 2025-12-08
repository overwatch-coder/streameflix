"use client"

import { useState } from "react"
import { Copy, Check, Share2, Facebook, Twitter, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ShareModalProps {
  title: string
  url: string
}

export function ShareModal({ title, url }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const shareData = {
    title: "StreameFlix",
    text: `Check out ${title} on StreameFlix!`,
    url: url,
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.error("Error sharing:", err)
      }
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white">
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gray-950 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Share "{title}"</DialogTitle>
          <DialogDescription className="text-gray-400">
            Share this with your friends and family.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input
                id="link"
                defaultValue={url}
                readOnly
                className="bg-gray-900 border-gray-700 text-white h-9"
              />
            </div>
            <Button size="sm" onClick={handleCopy} className="px-3 bg-red-600 hover:bg-red-700">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             <Button variant="outline" className="w-full bg-[#1877F2] hover:bg-[#1877F2]/90 border-none text-white" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')}>
                <Facebook className="w-4 h-4 mr-2" /> Facebook
             </Button>
             <Button variant="outline" className="w-full bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 border-none text-white" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(url)}`, '_blank')}>
                <Twitter className="w-4 h-4 mr-2" /> Twitter
             </Button>
          </div>
          {typeof navigator !== 'undefined' && (
            <Button variant="secondary" onClick={handleNativeShare} className="w-full bg-gray-800 text-white hover:bg-gray-700">
              More Options
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
