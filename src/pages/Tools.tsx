import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wrench, Code2, Bug, Search, Lightbulb, FileText, PenTool, LineChart, Calculator } from "lucide-react";

export default function Tools() {
  const tools = [
    { name: "Code Generator", icon: Code2, desc: "Generate boilerplate, components, or full scripts in any language.", color: "text-blue-400", bg: "bg-blue-500/10" },
    { name: "Debug Assistant", icon: Bug, desc: "Paste error logs or broken code for instant analysis and fixes.", color: "text-red-400", bg: "bg-red-500/10" },
    { name: "Research Assistant", icon: Search, desc: "Deep dive into topics with citations and structured summaries.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { name: "Startup Idea Lab", icon: Lightbulb, desc: "Brainstorm, validate, and structure new business concepts.", color: "text-amber-400", bg: "bg-amber-500/10" },
    { name: "Resume Builder", icon: FileText, desc: "Optimize your CV for ATS systems and specific job descriptions.", color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { name: "Essay Writer", icon: PenTool, desc: "Draft, edit, and refine long-form content with academic rigor.", color: "text-purple-400", bg: "bg-purple-500/10" },
    { name: "Data Analyzer", icon: LineChart, desc: "Upload CSVs for instant statistical analysis and visualizations.", color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { name: "Math Solver", icon: Calculator, desc: "Step-by-step solutions for complex mathematical equations.", color: "text-rose-400", bg: "bg-rose-500/10" },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-8">
      <header className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Wrench className="w-8 h-8 text-amber-500" />
            AI Tool Ecosystem
          </h1>
          <p className="text-white/60 mt-2">Direct access to specialized, single-purpose AI utilities.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tools.map((tool, i) => (
          <Card key={i} className="bg-black/40 border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
            <CardHeader className="pb-2">
              <div className={`w-10 h-10 rounded-lg ${tool.bg} border border-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <tool.icon className={`w-5 h-5 ${tool.color}`} />
              </div>
              <CardTitle className="text-lg">{tool.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white/50 leading-relaxed">
                {tool.desc}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
