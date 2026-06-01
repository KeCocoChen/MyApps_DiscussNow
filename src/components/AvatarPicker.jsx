import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Check, Crown } from "lucide-react";
import { base44 } from "@/api/base44Client";

const PRESET_AVATARS = [
  "https://media.base44.com/images/public/6a1d1f0b92a437a5210e58cc/834036759_generated_image.png",
  "https://media.base44.com/images/public/6a1d1f0b92a437a5210e58cc/41fdff0af_generated_image.png",
  "https://media.base44.com/images/public/6a1d1f0b92a437a5210e58cc/88c7919d4_generated_image.png",
  "https://media.base44.com/images/public/6a1d1f0b92a437a5210e58cc/e8031a93c_generated_image.png",
  "https://media.base44.com/images/public/6a1d1f0b92a437a5210e58cc/4d33b1fb5_generated_image.png",
  "https://media.base44.com/images/public/6a1d1f0b92a437a5210e58cc/e6b305576_generated_image.png",
];

function AvatarGrid({ avatars, currentAvatar, onSelect }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {avatars.map((url) => (
        <button
          key={url}
          onClick={() => onSelect(url)}
          className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
            currentAvatar === url
              ? "border-primary scale-105"
              : "border-transparent hover:border-primary/40"
          }`}
        >
          <img src={url} alt="avatar option" className="w-full h-full object-cover" />
          {currentAvatar === url && (
            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-primary drop-shadow" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

export default function AvatarPicker({
  open,
  onClose,
  currentAvatar,
  onSelect,
  customAvatars = [],
  onUploadComplete,
  isPremium,
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    // Keep max 6 — oldest one out when limit reached
    const updated = [...customAvatars, file_url].slice(-6);
    onUploadComplete(file_url, updated);
    setUploading(false);
    e.target.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Choose your avatar</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-1">
          {/* Presets */}
          <div>
            <p className="text-sm font-medium mb-3">Presets</p>
            <AvatarGrid
              avatars={PRESET_AVATARS}
              currentAvatar={currentAvatar}
              onSelect={onSelect}
            />
          </div>

          {/* Custom uploads (premium) */}
          {isPremium ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">
                  Your uploads{" "}
                  <span className="text-muted-foreground font-normal">
                    ({customAvatars.length}/6)
                  </span>
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="gap-1.5 text-xs h-7"
                >
                  <Upload className="w-3 h-3" />
                  {uploading ? "Uploading..." : "Upload new"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                />
              </div>
              {customAvatars.length > 0 ? (
                <>
                  {customAvatars.length === 6 && (
                    <p className="text-xs text-muted-foreground mb-2">
                      Limit reached — uploading a new one will remove the oldest.
                    </p>
                  )}
                  <AvatarGrid
                    avatars={customAvatars}
                    currentAvatar={currentAvatar}
                    onSelect={onSelect}
                  />
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No uploads yet.</p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl bg-accent/50 border border-accent p-4">
              <Crown className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Premium feature</p>
                <p className="text-xs text-muted-foreground">
                  Upgrade to upload up to 6 custom avatars.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}