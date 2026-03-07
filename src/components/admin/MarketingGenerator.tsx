"use client";

import { useState } from "react";
import {
  Sparkles,
  Copy,
  Loader2,
  MessageSquare,
  Mail,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function MarketingGenerator() {
  const [topic, setTopic] = useState("");
  const [type, setType] = useState("push");
  const [generatedCopy, setGeneratedCopy] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerate() {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setGeneratedCopy("");

    try {
      const res = await fetch("/api/ai/admin-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, type }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedCopy(data.copy);
      } else {
        toast.error("Failed to generate copy");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleCopy() {
    if (!generatedCopy) return;
    navigator.clipboard.writeText(generatedCopy);
    toast.success("Copied to clipboard!");
  }

  return (
    <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 rounded-card p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-indigo-600" />
        </div>
        <h3 className="font-heading text-lg">AI Marketing Generator</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Generate engaging promotional copy instantly.
      </p>

      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="w-[120px]">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="push">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" /> Push
                  </div>
                </SelectItem>
                <SelectItem value="sms">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> SMS
                  </div>
                </SelectItem>
                <SelectItem value="email">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input
            placeholder="e.g. 20% off all fresh organic berries"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="flex-1 bg-background"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleGenerate();
            }}
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!topic.trim() || isGenerating}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" /> Generate Copy
            </>
          )}
        </Button>

        {generatedCopy && (
          <div className="mt-4 p-4 bg-background border rounded-lg relative group animate-in fade-in slide-in-from-top-2">
            <p className="text-sm pr-8 whitespace-pre-wrap">{generatedCopy}</p>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
              onClick={handleCopy}
            >
              <Copy className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
