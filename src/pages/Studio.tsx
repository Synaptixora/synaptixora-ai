import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, Sparkles, Download, Loader2 } from "lucide-react";
import { MODELS, generateContentWithRetry } from "@/services/ai/gemini";

export default function Studio() {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<"idle" | "generating" | "complete" | "error">("idle");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    if (!prompt.trim()) return;
    setStatus("generating");
    setImageUrl(null);
    setError(null);

    try {
      const response = await generateContentWithRetry({
        model: MODELS.IMAGE,
        contents: {
          parts: [
            { text: prompt }
          ]
        },
      });

      let foundImage = false;
      if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || "image/png";
            setImageUrl(`data:${mimeType};base64,${base64EncodeString}`);
            foundImage = true;
            break;
          }
        }
      }

      if (foundImage) {
        setStatus("complete");
      } else {
        throw new Error("No image data found in the response.");
      }
    } catch (err: any) {
      console.error("Image generation failed", err);
      setError(err.message || "Failed to generate image.");
      setStatus("error");
    }
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `synaptixora-image-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-8">
      <header className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ImageIcon className="w-8 h-8 text-cyan-500" />
            Creative Studio
          </h1>
          <p className="text-white/60 mt-2">Generate high-quality images using the Vision Agent.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 bg-black/40 border-white/10 h-fit">
          <CardHeader>
            <CardTitle>Image Prompt</CardTitle>
            <CardDescription>Describe the image you want to generate in detail.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Prompt</label>
              <textarea 
                className="flex min-h-[120px] w-full rounded-md border border-white/20 bg-black/50 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 resize-none"
                placeholder="e.g., A futuristic cyberpunk city with flying cars, neon lights, and a rainy atmosphere, highly detailed, 8k resolution" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={status === "generating"}
              />
            </div>
            
            <Button 
              className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700 text-white" 
              onClick={generateImage}
              disabled={status === "generating" || !prompt.trim()}
            >
              {status === "generating" ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Generating...</span>
              ) : (
                <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Generate Image</span>
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
              {status === "complete" && imageUrl && (
                <Button variant="outline" size="sm" onClick={downloadImage} className="border-white/20 hover:bg-white/10">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex-1 p-6 flex items-center justify-center relative">
              {status === "idle" && !imageUrl && (
                <div className="flex flex-col items-center justify-center text-white/30 space-y-4">
                  <ImageIcon className="w-16 h-16" />
                  <p>Your generated image will appear here</p>
                </div>
              )}
              
              {status === "generating" && (
                <div className="flex flex-col items-center justify-center text-cyan-400 space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin" />
                  <p className="animate-pulse">Synthesizing pixels...</p>
                </div>
              )}

              {status === "complete" && imageUrl && (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img 
                    src={imageUrl} 
                    alt={prompt} 
                    className="max-w-full max-h-[600px] rounded-lg shadow-2xl shadow-cyan-500/20 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
