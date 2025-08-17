'use server';
/**
 * @fileOverview A flow to fetch achievements, including trophies, from a GitHub profile using generative AI.
 *
 * - githubAchievementsFetch - A function that handles fetching achievements from a GitHub profile.
 * - GithubAchievementsFetchInput - The input type for the githubAchievementsFetch function.
 * - GithubAchievementsFetchOutput - The return type for the githubAchievementsFetch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GithubAchievementsFetchInputSchema = z.object({
  githubProfileUrl: z
    .string()
    .describe('The URL of the GitHub profile to fetch achievements from.'),
});
export type GithubAchievementsFetchInput = z.infer<typeof GithubAchievementsFetchInputSchema>;

const GithubAchievementsFetchOutputSchema = z.object({
  achievements: z
    .string()
    .describe('A summary of the achievements and trophies from the GitHub profile.'),
});
export type GithubAchievementsFetchOutput = z.infer<typeof GithubAchievementsFetchOutputSchema>;

export async function githubAchievementsFetch(input: GithubAchievementsFetchInput): Promise<GithubAchievementsFetchOutput> {
  return githubAchievementsFetchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'githubAchievementsFetchPrompt',
  input: {schema: GithubAchievementsFetchInputSchema},
  output: {schema: GithubAchievementsFetchOutputSchema},
  prompt: `You are an AI assistant specializing in summarizing GitHub profiles.
  Your task is to extract and summarize the achievements and trophies from the provided GitHub profile.
  Provide a concise summary of the user's achievements, highlighting key accomplishments and any trophies or awards they have received.

  GitHub Profile URL: {{{githubProfileUrl}}}
  Summary:`,
});

const githubAchievementsFetchFlow = ai.defineFlow(
  {
    name: 'githubAchievementsFetchFlow',
    inputSchema: GithubAchievementsFetchInputSchema,
    outputSchema: GithubAchievementsFetchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
