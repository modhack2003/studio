'use server';

import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { summarize } from './summarize-flow';

const SummarizeUrlInputSchema = z.object({
  url: z.string().url(),
});

export const summarizeUrlFlow = ai.defineFlow(
  {
    name: 'summarizeUrlFlow',
    inputSchema: SummarizeUrlInputSchema,
    outputSchema: z.string(),
  },
  async ({ url }) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }
    const context = await response.text();
    
    const summary = await summarize({ context });
    
    return summary.summary;
  }
);
