import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Library, Search, Tag, FileText, Clock, ExternalLink } from "lucide-react";

export default function Vault() {
  const [search, setSearch] = useState("");

  const savedItems = [
    {
      id: 1,
      title: "React Performance Optimization Strategy",
      summary: "A comprehensive guide on using useMemo, useCallback, and React.memo effectively to reduce unnecessary re-renders in large applications.",
      tags: ["React", "Performance", "Frontend"],
      date: "2 hours ago",
      agent: "System Architect Agent"
    },
    {
      id: 2,
      title: "Q3 Marketing Campaign Copy",
      summary: "Three variations of email copy targeting enterprise clients for the new AI features launch, emphasizing ROI and security.",
      tags: ["Marketing", "Copywriting", "Email"],
      date: "1 day ago",
      agent: "Marketing Copy Agent"
    },
    {
      id: 3,
      title: "Python Data Analysis Script",
      summary: "Pandas script to clean, normalize, and visualize customer churn data using matplotlib and seaborn.",
      tags: ["Python", "Data Science", "Pandas"],
      date: "3 days ago",
      agent: "Data Analyst Agent"
    },
    {
      id: 4,
      title: "Startup Pitch Deck Outline",
      summary: "A 10-slide structure for a seed-stage AI startup, focusing on the problem statement, unique value proposition, and go-to-market strategy.",
      tags: ["Startup", "Pitch", "Business"],
      date: "1 week ago",
      agent: "Idea Generation Agent"
    }
  ];

  const filteredItems = savedItems.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) || 
    item.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-8">
      <header className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Library className="w-8 h-8 text-emerald-500" />
            Knowledge Vault
          </h1>
          <p className="text-white/60 mt-2">Semantic search and auto-tagged repository of your AI-generated assets.</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto w-full space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input 
            placeholder="Search by keyword, semantic meaning, or tag..." 
            className="pl-12 h-14 bg-black/40 border-white/10 text-base rounded-xl focus-visible:ring-emerald-500/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <span className="text-sm font-medium text-white/40 mr-2">Popular Tags:</span>
          {["React", "Python", "Marketing", "Startup", "Data Science", "Frontend"].map(tag => (
            <button 
              key={tag}
              onClick={() => setSearch(tag)}
              className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors whitespace-nowrap"
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map(item => (
            <Card key={item.id} className="bg-black/40 border-white/5 hover:border-emerald-500/30 transition-colors group cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-lg leading-tight group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </CardTitle>
                  <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-emerald-400 shrink-0" />
                </div>
                <CardDescription className="flex items-center gap-2 text-xs mt-2">
                  <Clock className="w-3.5 h-3.5" /> {item.date}
                  <span className="w-1 h-1 rounded-full bg-white/20 mx-1"></span>
                  <span className="text-emerald-400/80">{item.agent}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/70 line-clamp-2 mb-4">
                  {item.summary}
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-medium text-emerald-300 uppercase tracking-wider">
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white/80">No results found</h3>
            <p className="text-white/50 text-sm mt-1">Try adjusting your search terms or tags.</p>
          </div>
        )}
      </div>
    </div>
  );
}
