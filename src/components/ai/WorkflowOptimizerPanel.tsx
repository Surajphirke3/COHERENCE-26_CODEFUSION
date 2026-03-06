// src/components/ai/WorkflowOptimizerPanel.tsx
'use client';

import React, { useState } from 'react';
import { Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StreamingMessage } from './StreamingMessage';
import { Skeleton } from '@/components/ui/skeleton';
import { useAI } from '@/lib/hooks/useAI';
import { useToast } from '@/contexts/toast-context';

interface WorkflowOptimizerPanelProps {
  campaignId?: string;
  workflowData?: unknown;
}

export function WorkflowOptimizerPanel({ campaignId, workflowData }: WorkflowOptimizerPanelProps) {
  const { addToast } = useToast();
  const { content, isStreaming, generate } = useAI();

  const handleAnalyze = () => {
    const prompt = `Analyze this outreach workflow and campaign metrics data. Provide numbered optimization suggestions.
    
Workflow: ${JSON.stringify(workflowData || 'No workflow data available')}
Campaign ID: ${campaignId || 'aggregate'}

Provide 5-7 specific, actionable optimization suggestions to improve reply rates and engagement.`;

    generate(prompt);
  };

  const handleApplySuggestion = () => {
    addToast('Coming soon — auto-apply is in development!', 'info');
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Zap size={14} className="text-ai" /> AI Workflow Optimizer
        </h3>
        <Button
          variant="ai"
          size="sm"
          icon={<Sparkles size={14} />}
          loading={isStreaming}
          onClick={handleAnalyze}
        >
          Analyze Workflow
        </Button>
      </div>

      {content ? (
        <div className="max-h-80 overflow-y-auto rounded-lg border border-border bg-white/2 p-4">
          <StreamingMessage content={content} isStreaming={isStreaming} />
          {!isStreaming && content && (
            <div className="mt-4 border-t border-border pt-3">
              <Button size="sm" variant="secondary" onClick={handleApplySuggestion}>
                Apply Suggestions
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-white/2 p-8 text-center">
          <p className="text-xs text-muted-foreground">
            Click &quot;Analyze Workflow&quot; to get AI-powered optimization suggestions
          </p>
        </div>
      )}
    </div>
  );
}
