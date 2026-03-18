import { useCallback, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  Connection,
  Edge,
  Node,
  Panel,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Network, Play, Loader2, Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const initialNodes: Node[] = [
  { 
    id: 'user', 
    position: { x: 350, y: 50 }, 
    data: { label: 'User Input' }, 
    type: 'input', 
    style: { background: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: '8px', padding: '10px', width: 150, textAlign: 'center' as const } 
  },
  { 
    id: 'router', 
    position: { x: 350, y: 150 }, 
    data: { label: 'Router Agent' }, 
    style: { background: '#312e81', color: '#fff', border: '1px solid #4f46e5', borderRadius: '8px', padding: '10px', width: 150, textAlign: 'center' as const } 
  },
  { 
    id: 'code', 
    position: { x: 100, y: 300 }, 
    data: { label: 'Code Agent' }, 
    style: { background: '#1e3a8a', color: '#fff', border: '1px solid #3b82f6', borderRadius: '8px', padding: '10px', width: 150, textAlign: 'center' as const } 
  },
  { 
    id: 'research', 
    position: { x: 350, y: 300 }, 
    data: { label: 'Research Agent' }, 
    style: { background: '#14532d', color: '#fff', border: '1px solid #22c55e', borderRadius: '8px', padding: '10px', width: 150, textAlign: 'center' as const } 
  },
  { 
    id: 'creative', 
    position: { x: 600, y: 300 }, 
    data: { label: 'Creative Agent' }, 
    style: { background: '#701a75', color: '#fff', border: '1px solid #d946ef', borderRadius: '8px', padding: '10px', width: 150, textAlign: 'center' as const } 
  },
  { 
    id: 'evaluator', 
    position: { x: 350, y: 450 }, 
    data: { label: 'Evaluator Agent' }, 
    style: { background: '#7f1d1d', color: '#fff', border: '1px solid #ef4444', borderRadius: '8px', padding: '10px', width: 150, textAlign: 'center' as const } 
  },
  { 
    id: 'output', 
    position: { x: 350, y: 550 }, 
    data: { label: 'Final Output' }, 
    type: 'output', 
    style: { background: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: '8px', padding: '10px', width: 150, textAlign: 'center' as const } 
  },
];

const defaultEdgeStyle = { stroke: '#555', strokeWidth: 1, opacity: 0.5 };
const defaultMarkerEnd = { type: MarkerType.ArrowClosed, color: '#555' };

const initialEdges: Edge[] = [
  { id: 'e-user-router', source: 'user', target: 'router', animated: false, style: defaultEdgeStyle, markerEnd: defaultMarkerEnd },
  { id: 'e-router-code', source: 'router', target: 'code', animated: false, style: defaultEdgeStyle, markerEnd: defaultMarkerEnd },
  { id: 'e-router-research', source: 'router', target: 'research', animated: false, style: defaultEdgeStyle, markerEnd: defaultMarkerEnd },
  { id: 'e-router-creative', source: 'router', target: 'creative', animated: false, style: defaultEdgeStyle, markerEnd: defaultMarkerEnd },
  { id: 'e-code-evaluator', source: 'code', target: 'evaluator', animated: false, style: defaultEdgeStyle, markerEnd: defaultMarkerEnd },
  { id: 'e-research-evaluator', source: 'research', target: 'evaluator', animated: false, style: defaultEdgeStyle, markerEnd: defaultMarkerEnd },
  { id: 'e-creative-evaluator', source: 'creative', target: 'evaluator', animated: false, style: defaultEdgeStyle, markerEnd: defaultMarkerEnd },
  { id: 'e-evaluator-output', source: 'evaluator', target: 'output', animated: false, style: defaultEdgeStyle, markerEnd: defaultMarkerEnd },
];

export default function VisualFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [prompt, setPrompt] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [savedWorkflows, setSavedWorkflows] = useState<{name: string, nodes: Node[], edges: Edge[]}[]>([]);
  const [workflowName, setWorkflowName] = useState("");

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, style: defaultEdgeStyle, markerEnd: defaultMarkerEnd } as Edge, eds)),
    [setEdges],
  );

  const routePrompt = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('code') || lower.includes('react') || lower.includes('bug') || lower.includes('error') || lower.includes('function')) return 'code';
    if (lower.includes('image') || lower.includes('video') || lower.includes('draw') || lower.includes('create') || lower.includes('poem') || lower.includes('story')) return 'creative';
    return 'research';
  };

  const simulateFlow = async () => {
    if (!prompt.trim() || isSimulating) return;
    setIsSimulating(true);
    
    const target = routePrompt(prompt);
    const colorMap: Record<string, string> = { code: '#3b82f6', research: '#22c55e', creative: '#d946ef' };
    const targetColor = colorMap[target] || '#22c55e';

    // Reset all edges
    setEdges(eds => eds.map(e => ({ ...e, animated: false, style: defaultEdgeStyle, markerEnd: defaultMarkerEnd })));

    const highlightEdge = (id: string, color: string) => {
      setEdges(eds => eds.map(e => e.id === id ? { ...e, animated: true, style: { stroke: color, strokeWidth: 2, opacity: 1 }, markerEnd: { type: MarkerType.ArrowClosed, color: color } } : e));
    };

    // Step 1: User to Router
    highlightEdge('e-user-router', '#fff');
    await new Promise(r => setTimeout(r, 1000));

    // Step 2: Router to Target
    highlightEdge(`e-router-${target}`, targetColor);
    await new Promise(r => setTimeout(r, 1000));

    // Step 3: Target to Evaluator
    highlightEdge(`e-${target}-evaluator`, targetColor);
    await new Promise(r => setTimeout(r, 1000));

    // Step 4: Evaluator to Output
    highlightEdge('e-evaluator-output', '#ef4444');
    
    setTimeout(() => {
      setIsSimulating(false);
    }, 1000);
  };

  const saveWorkflow = () => {
    if (!workflowName.trim()) return;
    setSavedWorkflows(prev => [...prev, { name: workflowName, nodes, edges }]);
    setWorkflowName("");
  };

  const loadWorkflow = (index: number) => {
    const wf = savedWorkflows[index];
    setNodes(wf.nodes);
    setEdges(wf.edges);
  };

  const deleteWorkflow = (index: number) => {
    setSavedWorkflows(prev => prev.filter((_, i) => i !== index));
  };

  const addCustomAgent = () => {
    const newNode: Node = {
      id: `custom-${Date.now()}`,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 200 + 200 },
      data: { label: 'Custom Agent' },
      style: { background: '#0f766e', color: '#fff', border: '1px solid #14b8a6', borderRadius: '8px', padding: '10px', width: 150, textAlign: 'center' as const }
    };
    setNodes(nds => [...nds, newNode]);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 space-y-6">
      <header className="flex items-center justify-between border-b border-white/10 pb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Network className="w-8 h-8 text-indigo-500" />
            Workflow Engine
          </h1>
          <p className="text-white/60 mt-2">Design, simulate, and save multi-step agent pipelines.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={addCustomAgent} variant="outline" className="border-white/10 bg-black/40 hover:bg-white/10 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Agent
          </Button>
        </div>
      </header>
      
      <div className="flex-1 rounded-xl border border-white/10 overflow-hidden bg-black/40 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          colorMode="dark"
        >
          <Panel position="top-left" className="bg-black/80 border border-white/10 p-4 rounded-lg shadow-xl w-80 backdrop-blur-sm m-4 flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Simulate Pipeline</h3>
              <div className="space-y-3">
                <textarea 
                  className="w-full h-20 bg-black/50 border border-white/20 rounded-md p-2 text-sm text-white resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Enter a prompt to test the flow..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isSimulating}
                />
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" 
                  onClick={simulateFlow}
                  disabled={isSimulating || !prompt.trim()}
                >
                  {isSimulating ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Executing...</>
                  ) : (
                    <><Play className="w-4 h-4 mr-2" /> Run Pipeline</>
                  )}
                </Button>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <h3 className="text-sm font-semibold text-white mb-2">Save Workflow</h3>
              <div className="flex gap-2">
                <input 
                  type="text"
                  className="flex-1 bg-black/50 border border-white/20 rounded-md p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Workflow Name"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                />
                <Button onClick={saveWorkflow} size="icon" className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0">
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {savedWorkflows.length > 0 && (
              <div className="border-t border-white/10 pt-4">
                <h3 className="text-sm font-semibold text-white mb-2">Saved Workflows</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {savedWorkflows.map((wf, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white/5 rounded-md p-2 border border-white/5">
                      <button onClick={() => loadWorkflow(idx)} className="text-sm text-white/80 hover:text-white truncate flex-1 text-left">
                        {wf.name}
                      </button>
                      <button onClick={() => deleteWorkflow(idx)} className="text-red-400 hover:text-red-300 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Panel>

          <Controls className="bg-black/50 border-white/10 fill-white" />
          <MiniMap 
            nodeColor={(node) => {
              switch (node.id) {
                case 'router': return '#4f46e5';
                case 'code': return '#3b82f6';
                case 'research': return '#22c55e';
                case 'creative': return '#d946ef';
                case 'evaluator': return '#ef4444';
                default: return node.style?.background as string || '#333';
              }
            }}
            maskColor="rgba(0, 0, 0, 0.7)"
            className="bg-black/50 border-white/10"
          />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#333" />
        </ReactFlow>
      </div>
    </div>
  );
}
