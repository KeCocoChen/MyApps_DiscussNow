import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, LogOut } from "lucide-react";
import { toast } from "sonner";



export default function Profile() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["profile", user?.email],
    queryFn: () =>
      base44.entities.UserProfile.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const profile = profiles[0] || null;
  const [form, setForm] = useState({});

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name || "",
        bio: profile.bio || "",
        city: profile.city || "",
        interests: profile.interests || "",
        instagram: profile.instagram || "",
        twitter: profile.twitter || "",
        discord: profile.discord || "",
        linkedin: profile.linkedin || "",
        open_to_meetup: profile.open_to_meetup || false,
      });
    } else if (user) {
      setForm({
        display_name: user.full_name || "",
        bio: "",
        city: "",
        interests: "",
        instagram: "",
        twitter: "",
        discord: "",
        linkedin: "",
        open_to_meetup: false,
      });
    }
  }, [profile, user]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (profile) {
        return base44.entities.UserProfile.update(profile.id, data);
      }
      return base44.entities.UserProfile.create({
        ...data,
        user_email: user.email,
        discussions_joined: 0,
        talk_score: 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile saved!");
    },
  });

  const update = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Your Profile</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => base44.auth.logout()}
          className="text-muted-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" /> Sign out
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">About You</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Display Name</Label>
            <Input
              value={form.display_name || ""}
              onChange={(e) => update("display_name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              value={form.bio || ""}
              onChange={(e) => update("bio", e.target.value)}
              placeholder="A few words about yourself..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> City
              </Label>
              <Input
                value={form.city || ""}
                onChange={(e) => update("city", e.target.value)}
                placeholder="Where are you based?"
              />
            </div>
            <div className="space-y-2">
              <Label>Interests</Label>
              <Input
                value={form.interests || ""}
                onChange={(e) => update("interests", e.target.value)}
                placeholder="Art, tech, philosophy..."
              />
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <Label>Open to meeting up IRL</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Let others know you're open to coffee chats
              </p>
            </div>
            <Switch
              checked={form.open_to_meetup || false}
              onCheckedChange={(v) => update("open_to_meetup", v)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border bg-accent/40 p-4 text-sm text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">No direct messages here.</p>
        <p>discuss_now is about real-time conversation. If you click with someone, tell them during the discussion — that\'s the whole point.</p>
      </div>

      <Button
        onClick={() => saveMutation.mutate(form)}
        className="w-full"
        disabled={saveMutation.isPending}
      >
        {saveMutation.isPending ? "Saving..." : "Save profile"}
      </Button>
    </div>
  );
}