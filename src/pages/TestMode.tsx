import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Zap, Database, Bot, CheckCircle2, XCircle, Loader2, Play } from "lucide-react";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { executeAgent } from "@/services/ai/agents";
import { AVAILABLE_AGENTS } from "@/services/ai/router";

interface TestResult {
  name: string;
  status: "pending" | "success" | "error";
  responseTime?: number;
  error?: string;
}

export default function TestMode() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    const tests: TestResult[] = [
      { name: "Database Connection", status: "pending" },
      ...AVAILABLE_AGENTS.slice(0, 3).map(agent => ({ name: `Agent: ${agent}`, status: "pending" as const }))
    ];
    setResults(tests);

    // Test DB
    const dbStart = performance.now();
    try {
      await getDoc(doc(db, "test", "connection"));
      const dbEnd = performance.now();
      updateResult("Database Connection", "success", dbEnd - dbStart);
    } catch (e) {
      updateResult("Database Connection", "error", undefined, e instanceof Error ? e.message : "Unknown error");
    }

    // Test Agents
    for (const agent of AVAILABLE_AGENTS.slice(0, 3)) {
      const agentStart = performance.now();
      try {
        await executeAgent(agent, "Hello, are you working?");
        const agentEnd = performance.now();
        updateResult(`Agent: ${agent}`, "success", agentEnd - agentStart);
      } catch (e) {
        updateResult(`Agent: ${agent}`, "error", undefined, e instanceof Error ? e.message : "Unknown error");
      }
    }
    setIsRunning(false);
  };

  const updateResult = (name: string, status: "success" | "error", responseTime?: number, error?: string) => {
    setResults(prev => prev.map(r => r.name === name ? { ...r, status, responseTime, error } : r));
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-8">
      <header className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Wrench className="w-8 h-8 text-amber-500" />
            System Test Mode
          </h1>
          <p className="text-white/60 mt-2">Automatically check API, agent, and database connectivity and response times.</p>
        </div>
        <Button onClick={runTests} disabled={isRunning} className="bg-amber-600 hover:bg-amber-700 text-white">
          {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
          Run System Tests
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {results.map(result => (
          <Card key={result.name} className="bg-black/40 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{result.name}</CardTitle>
              {result.status === "pending" ? <Loader2 className="w-4 h-4 animate-spin text-white/20" /> :
               result.status === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> :
               <XCircle className="w-4 h-4 text-red-500" />}
            </CardHeader>
            <CardContent>
              {result.responseTime && <p className="text-2xl font-bold">{result.responseTime.toFixed(0)} ms</p>}
              {result.error && <p className="text-sm text-red-400">{result.error}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
