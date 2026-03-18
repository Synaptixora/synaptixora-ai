import { useState, useRef, useEffect } from "react";
import { useStore, Attachment } from "@/store/useStore";
import { orchestrateTask, OrchestrationState } from "@/services/ai/orchestrator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Bot, User, Activity, Brain, ShieldCheck, Zap, Layers, ChevronDown, ChevronUp, Mic, Paperclip, Image as ImageIcon, Sparkles, X, FileText, GraduationCap, Code2, Target, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";

export default function Workspace() {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showGenMenu, setShowGenMenu] = useState(false);
  const [responseMode, setResponseMode] = useState<'beginner' | 'pro'>('pro');
  const [autonomousMode, setAutonomousMode] = useState(false);
  const [autoDocMode, setAutoDocMode] = useState(false);
  
  const { messages, addMessage, updateMessageState } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachments(prev => [...prev, {
            name: file.name,
            type: file.type || 'application/octet-stream',
            data: event.target!.result as string
          }]);
        }
      };
      reader.readAsDataURL(file);
    });
    // Reset input
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // In a real app, stop SpeechRecognition here
    } else {
      setIsRecording(true);
      // Simulate speech recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        
        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join('');
          setInput(transcript);
        };
        
        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
        
        recognition.start();
      } else {
        // Fallback simulation
        setTimeout(() => {
          setInput(prev => prev + " (Simulated voice input) ");
          setIsRecording(false);
        }, 2000);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && attachments.length === 0) return;

    const userMsg = input.trim();
    const currentAttachments = [...attachments];
    
    setInput("");
    setAttachments([]);
    setShowGenMenu(false);

    // Add user message
    addMessage({ role: "user", content: userMsg, attachments: currentAttachments });

    // Add system placeholder message
    const systemMsgId = Math.random().toString(36).substring(7);
    useStore.setState((state) => ({
      messages: [
        ...state.messages,
        {
          id: systemMsgId,
          role: "system",
          content: "",
          timestamp: Date.now(),
          orchestrationState: {
            status: "idle",
            prompt: userMsg,
          }
        }
      ]
    }));

    // Start orchestration
    try {
      let promptPrefix = `[${responseMode.toUpperCase()} MODE] `;
      if (autonomousMode) promptPrefix = `[AUTONOMOUS GOAL] ` + promptPrefix;
      if (autoDocMode) promptPrefix = `[AUTO-DOC ENABLED] ` + promptPrefix;

      await orchestrateTask(
        `${promptPrefix}${userMsg}`, 
        currentAttachments, 
        (stateUpdate) => {
          useStore.getState().updateMessageState(systemMsgId, stateUpdate);
        }
      );
    } catch (error) {
      console.error("Orchestration failed", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="px-6 py-4 border-b border-white/10 bg-black/20 backdrop-blur-md flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Intelligence Workspace</h1>
          <p className="text-sm text-white/50">Multi-Agent Orchestration Active</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Smart Response Modes */}
          <div className="flex items-center bg-black/40 rounded-lg p-1 border border-white/10 hidden md:flex">
            <button
              onClick={() => setResponseMode('beginner')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                responseMode === 'beginner' ? 'bg-indigo-500/20 text-indigo-300' : 'text-white/50 hover:text-white/80'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Beginner
            </button>
            <button
              onClick={() => setResponseMode('pro')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                responseMode === 'pro' ? 'bg-violet-500/20 text-violet-300' : 'text-white/50 hover:text-white/80'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Pro
            </button>
          </div>

          {/* Autonomous Mode Toggle */}
          <button
            onClick={() => setAutonomousMode(!autonomousMode)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors hidden sm:flex ${
              autonomousMode 
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                : 'bg-black/40 border-white/10 text-white/50 hover:text-white/80'
            }`}
          >
            <Target className="w-4 h-4" />
            Autonomous Goal
          </button>

          {/* Auto Doc Toggle */}
          <button
            onClick={() => setAutoDocMode(!autoDocMode)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors hidden lg:flex ${
              autoDocMode 
                ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400' 
                : 'bg-black/40 border-white/10 text-white/50 hover:text-white/80'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Auto-Doc
          </button>

          <div className="flex items-center gap-2 ml-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-medium text-emerald-500 uppercase tracking-wider hidden sm:inline">System Online</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-600/20 border border-indigo-500/30 flex items-center justify-center mb-4">
              <Brain className="w-10 h-10 text-indigo-400" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome to Synaptixora</h2>
            <p className="text-white/60 text-lg">
              Enter a prompt to initialize the Cognitive Router. The system will automatically decompose your request, assign specialized agents, and synthesize the optimal response.
            </p>
            <div className="grid grid-cols-2 gap-4 w-full mt-8">
              {[
                "Build a full-stack app and explain it",
                "Solve this math problem step by step",
                "Generate startup ideas and validate them",
                "Create a UI design for a fintech app"
              ].map((demo, i) => (
                <Card key={i} className="cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setInput(demo)}>
                  <CardContent className="p-4 text-sm text-white/80">
                    "{demo}"
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'system' && (
                <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-indigo-400" />
                </div>
              )}
              
              <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-5 py-3 shadow-md' : 'w-full'}`}>
                {msg.role === 'user' ? (
                  <div className="space-y-3">
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {msg.attachments.map((att, i) => (
                          <div key={i} className="flex items-center gap-2 bg-black/20 rounded-lg p-2 max-w-[200px]">
                            {att.type.startsWith('image/') ? (
                              <img src={att.data} alt={att.name} className="w-10 h-10 object-cover rounded-md" />
                            ) : (
                              <div className="w-10 h-10 bg-white/10 rounded-md flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5 text-white/70" />
                              </div>
                            )}
                            <span className="text-xs truncate text-white/90">{att.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {msg.content && <p className="text-sm leading-relaxed">{msg.content}</p>}
                  </div>
                ) : (
                  <SystemMessage state={msg.orchestrationState!} />
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-white/70" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-xl relative">
        <div className="max-w-4xl mx-auto">
          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachments.map((att, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg p-1.5 pr-3 relative group">
                  {att.type.startsWith('image/') ? (
                    <img src={att.data} alt="preview" className="w-8 h-8 object-cover rounded" />
                  ) : (
                    <div className="w-8 h-8 bg-indigo-500/20 rounded flex items-center justify-center">
                      <FileText className="w-4 h-4 text-indigo-300" />
                    </div>
                  )}
                  <span className="text-xs max-w-[100px] truncate text-white/80">{att.name}</span>
                  <button 
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Generative Options Popover */}
          <AnimatePresence>
            {showGenMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-4 mb-2 w-64 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
              >
                <div className="p-2 space-y-1">
                  <div className="text-xs font-semibold text-white/40 uppercase tracking-wider px-2 py-1">Generative Options</div>
                  <button onClick={() => { setInput("Generate a high-quality image of..."); setShowGenMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg text-sm text-left transition-colors">
                    <ImageIcon className="w-4 h-4 text-emerald-400" /> Image Generation
                  </button>
                  <button onClick={() => { setInput("Write a complete React component for..."); setShowGenMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg text-sm text-left transition-colors">
                    <Zap className="w-4 h-4 text-amber-400" /> Code Generation
                  </button>
                  <button onClick={() => { setInput("Summarize the attached document focusing on..."); setShowGenMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg text-sm text-left transition-colors">
                    <FileText className="w-4 h-4 text-indigo-400" /> Document Summary
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:ring-1 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50 transition-all">
            
            {/* Hidden Inputs */}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
            <input type="file" ref={imageInputRef} onChange={handleFileChange} accept="image/*" className="hidden" multiple />

            {/* Left Actions */}
            <div className="flex items-center gap-1 pb-1">
              <Button type="button" size="icon" variant="ghost" className="h-10 w-10 hover:bg-white/10 text-white/60 hover:text-white rounded-xl" onClick={() => setShowGenMenu(!showGenMenu)}>
                <Sparkles className="w-5 h-5" />
              </Button>
              <Button type="button" size="icon" variant="ghost" className="h-10 w-10 hover:bg-white/10 text-white/60 hover:text-white rounded-xl" onClick={() => fileInputRef.current?.click()}>
                <Paperclip className="w-5 h-5" />
              </Button>
              <Button type="button" size="icon" variant="ghost" className="h-10 w-10 hover:bg-white/10 text-white/60 hover:text-white rounded-xl" onClick={() => imageInputRef.current?.click()}>
                <ImageIcon className="w-5 h-5" />
              </Button>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={autonomousMode ? "Enter high-level goal (e.g., 'Build a full-stack app')..." : "Initialize cognitive task..."}
              className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none resize-none text-base py-3 px-2 focus:outline-none focus:ring-0 text-white placeholder:text-white/30"
              rows={1}
            />

            {/* Right Actions */}
            <div className="flex items-center gap-1 pb-1">
              <Button 
                type="button" 
                size="icon" 
                variant="ghost" 
                className={`h-10 w-10 rounded-xl transition-colors ${isRecording ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300' : 'hover:bg-white/10 text-white/60 hover:text-white'}`}
                onClick={toggleRecording}
              >
                <Mic className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`} />
              </Button>
              <Button 
                type="submit" 
                size="icon" 
                className="h-10 w-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md"
                disabled={!input.trim() && attachments.length === 0}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function SystemMessage({ state }: { state: OrchestrationState }) {
  const [expanded, setExpanded] = useState(false);

  if (state.status === "idle" || state.status === "routing") {
    return (
      <div className="flex items-center gap-3 text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 w-fit">
        <Activity className="w-5 h-5 animate-pulse" />
        <span className="text-sm font-medium">Cognitive Router analyzing intent...</span>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm">
        System Error: {state.error}
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {/* Smart Prompt DNA Analyzer Card */}
      {state.route && (
        <Card className="bg-black/40 border-white/5 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 px-4 py-2 border-b border-white/5 flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
            <div className="flex items-center gap-2 text-xs font-medium text-indigo-300 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              Prompt DNA & Routing
            </div>
            {expanded ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
          </div>
          
          <AnimatePresence>
            {expanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-white/40 mb-1">Intent</div>
                    <div className="text-sm font-medium">{state.route.intent}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/40 mb-1">Domain</div>
                    <div className="text-sm font-medium">{state.route.domain}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/40 mb-1">Complexity</div>
                    <div className="text-sm font-medium capitalize flex items-center gap-1">
                      {state.route.complexity_level === 'high' && <Zap className="w-3 h-3 text-amber-400" />}
                      {state.route.complexity_level}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-white/40 mb-1">Confidence</div>
                    <div className="text-sm font-medium text-emerald-400">{(state.route.confidence_score * 100).toFixed(0)}%</div>
                  </div>
                  <div className="col-span-2 md:col-span-4">
                    <div className="text-xs text-white/40 mb-2">Assigned Swarm Agents</div>
                    <div className="flex flex-wrap gap-2">
                      {state.route.agents_selected.map(agent => (
                        <span key={agent} className="px-2.5 py-1 rounded-md bg-indigo-500/20 border border-indigo-500/30 text-xs text-indigo-200">
                          {agent}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}

      {/* Execution Status */}
      {state.status === "executing" && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 w-fit">
            <Brain className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-medium">Agent Swarm executing tasks in parallel...</span>
          </div>
          {/* Simulated Real-Time Activity Tracker */}
          <div className="flex flex-col gap-1.5 ml-4 mt-2">
            {state.route?.agents_selected.map((agent, idx) => (
              <div key={agent} className="flex items-center gap-2 text-xs text-white/60">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" style={{ animationDelay: `${idx * 0.2}s` }} />
                <span>{agent} Agent is processing data...</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evaluation Status */}
      {state.status === "evaluating" && (
        <div className="flex items-center gap-3 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 w-fit">
          <ShieldCheck className="w-5 h-5 animate-pulse" />
          <span className="text-sm font-medium">Critic Agent evaluating and synthesizing outputs...</span>
        </div>
      )}

      {/* Final Output */}
      {state.status === "complete" && state.evaluation && (
        <div className="space-y-4">
          <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-headings:text-white prose-a:text-indigo-400">
            <ReactMarkdown>{state.evaluation.final_synthesized_response}</ReactMarkdown>
          </div>
          
          {/* Self-Evaluation Metrics */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Self-Evaluation Metrics</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricCard label="Accuracy" score={state.evaluation.accuracy} />
              <MetricCard label="Clarity" score={state.evaluation.clarity} />
              <MetricCard label="Completeness" score={state.evaluation.completeness} />
              <MetricCard label="Efficiency" score={state.evaluation.efficiency} />
            </div>
            {expanded && (
              <div className="mt-3 text-xs text-white/50 bg-white/5 p-3 rounded-lg border border-white/5">
                <span className="font-semibold text-white/70">Critic Feedback:</span> {state.evaluation.feedback}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, score }: { label: string, score: number }) {
  const getColor = (s: number) => {
    if (s >= 90) return "text-emerald-400";
    if (s >= 70) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <div className="bg-black/30 border border-white/5 rounded-lg p-3 flex flex-col gap-1">
      <span className="text-[10px] text-white/50 uppercase tracking-wider">{label}</span>
      <div className="flex items-end gap-1.5">
        <span className={`text-lg font-bold leading-none font-mono ${getColor(score)}`}>{score}</span>
        <span className="text-xs text-white/30 mb-0.5">/100</span>
      </div>
    </div>
  );
}
