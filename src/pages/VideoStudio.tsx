import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video as VideoIcon, Sparkles, Download, Loader2, Key } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { MODELS } from "@/services/ai/gemini";

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function VideoStudio() {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<"idle" | "generating" | "complete" | "error">("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>("Initializing director's chair...");

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    if (window.aistudio) {
      try {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } catch (e) {
        console.error("Failed to check API key", e);
      }
    }
  };

  const handleSelectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setHasKey(true);
      } catch (e) {
        console.error("Failed to open select key dialog", e);
      }
    }
  };

  const loadingMessages = [
    "Setting up the scene...",
    "Lighting the set...",
    "Directing the actors...",
    "Rendering frames...",
    "Adding special effects...",
    "Polishing the final cut...",
    "This usually takes a few minutes..."
  ];

  useEffect(() => {
    if (status === "generating") {
      let i = 0;
      setLoadingMessage(loadingMessages[0]);
      const interval = setInterval(() => {
        i = (i + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[i]);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const generateVideo = async () => {
    if (!prompt.trim()) return;
    setStatus("generating");
    setVideoUrl(null);
    setError(null);

    try {
      // Check API key again just in case
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        if (!selected) {
          setHasKey(false);
          throw new Error("Please select a paid API key first.");
        }
      }

      const apiKey = (process.env.API_KEY || process.env.GEMINI_API_KEY) as string;
      const ai = new GoogleGenAI({ apiKey });

      let operation = await ai.models.generateVideos({
        model: MODELS.VIDEO,
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({operation: operation});
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      
      if (!downloadLink) {
        throw new Error("No video URI returned from the operation.");
      }

      const response = await fetch(downloadLink, {
        method: 'GET',
        headers: {
          'x-goog-api-key': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.statusText}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setVideoUrl(objectUrl);
      setStatus("complete");

    } catch (err: any) {
      console.error("Video generation failed", err);
      if (err.message?.includes("Requested entity was not found")) {
         setHasKey(false);
         setError("API Key session expired or invalid. Please select your API key again.");
      } else {
         setError(err.message || "Failed to generate video.");
      }
      setStatus("error");
    }
  };

  const downloadVideo = () => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `synaptixora-video-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-8">
      <header className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <VideoIcon className="w-8 h-8 text-fuchsia-500" />
            Video Studio
          </h1>
          <p className="text-white/60 mt-2">Generate high-quality videos using the Veo model.</p>
        </div>
        {!hasKey && (
          <Button onClick={handleSelectKey} className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white">
            <Key className="w-4 h-4 mr-2" />
            Select API Key
          </Button>
        )}
      </header>

      {!hasKey ? (
        <Card className="bg-black/40 border-fuchsia-500/30">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
            <Key className="w-12 h-12 text-fuchsia-400 mb-2" />
            <h2 className="text-xl font-semibold text-white">Paid API Key Required</h2>
            <p className="text-white/70 max-w-md">
              Video generation requires a paid Google Cloud project API key. Please select your key to continue.
              <br />
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-fuchsia-400 hover:underline mt-2 inline-block">Learn more about billing</a>
            </p>
            <Button onClick={handleSelectKey} className="mt-4 bg-fuchsia-600 hover:bg-fuchsia-700 text-white">
              Select API Key
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 bg-black/40 border-white/10 h-fit">
            <CardHeader>
              <CardTitle>Video Prompt</CardTitle>
              <CardDescription>Describe the video you want to generate in detail.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Prompt</label>
                <textarea 
                  className="flex min-h-[120px] w-full rounded-md border border-white/20 bg-black/50 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 resize-none"
                  placeholder="e.g., A neon hologram of a cat driving at top speed, cinematic lighting, 1080p" 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={status === "generating"}
                />
              </div>
              
              <Button 
                className="w-full mt-4 bg-fuchsia-600 hover:bg-fuchsia-700 text-white" 
                onClick={generateVideo}
                disabled={status === "generating" || !prompt.trim()}
              >
                {status === "generating" ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Generating...</span>
                ) : (
                  <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Generate Video</span>
                )}
              </Button>

              {error && (
                <div className="mt-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <Card className="bg-black/40 border-white/10 h-full min-h-[500px] flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5">
                <CardTitle className="text-lg">Generated Result</CardTitle>
                {status === "complete" && videoUrl && (
                  <Button variant="outline" size="sm" onClick={downloadVideo} className="border-white/20 hover:bg-white/10">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
              </CardHeader>
              <CardContent className="flex-1 p-6 flex items-center justify-center relative">
                {status === "idle" && !videoUrl && (
                  <div className="flex flex-col items-center justify-center text-white/30 space-y-4">
                    <VideoIcon className="w-16 h-16" />
                    <p>Your generated video will appear here</p>
                  </div>
                )}
                
                {status === "generating" && (
                  <div className="flex flex-col items-center justify-center text-fuchsia-400 space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin" />
                    <p className="animate-pulse text-lg font-medium text-center max-w-sm">{loadingMessage}</p>
                    <p className="text-sm text-fuchsia-400/60 mt-2">Video generation can take a few minutes.</p>
                  </div>
                )}

                {status === "complete" && videoUrl && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <video 
                      src={videoUrl} 
                      controls 
                      autoPlay 
                      loop
                      className="max-w-full max-h-[600px] rounded-lg shadow-2xl shadow-fuchsia-500/20"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
