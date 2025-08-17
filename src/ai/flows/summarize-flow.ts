'use server';
/**
 * @fileOverview A flow to summarize a given context using generative AI.
 *
 * - summarize - A function that handles the summarization process.
 * - SummarizeInput - The input type for the summarize function.
 * - SummarizeOutput - The return type for the summarize function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeInputSchema = z.object({
  context: z
    .string()
    .describe('The context to be summarized.'),
});
export type SummarizeInput = z.infer<typeof SummarizeInputSchema>;

const SummarizeOutputSchema = z.object({
  summary: z
    .string()
    .describe('The generated summary.'),
});
export type SummarizeOutput = z.infer<typeof SummarizeOutputSchema>;

export async function summarize(input: SummarizeInput): Promise<SummarizeOutput> {
  return summarizeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizePrompt',
  input: {schema: SummarizeInputSchema},
  output: {schema: SummarizeOutputSchema},
  prompt: `You are an AI assistant. Summarize the following context, highlighting key achievements and trophies if applicable:
  {{{context}}}
  Summary:`,
});

const summarizeFlow = ai.defineFlow(
  {
    name: 'summarizeFlow',
    inputSchema: SummarizeInputSchema,
    outputSchema: SummarizeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
