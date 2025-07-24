'use server';

/**
 * @fileOverview Summarizes contradiction analysis from diverse sources using GenAI.
 *
 * - summarizeContradictions - A function that handles the summarization of contradiction analysis.
 * - SummarizeContradictionsInput - The input type for the summarizeContradictions function.
 * - SummarizeContradictionsOutput - The return type for the summarizeContradictions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeContradictionsInputSchema = z.object({
  ticker: z.string().describe('The stock ticker symbol to analyze.'),
  contradictionAnalysis: z
    .string()
    .describe('The contradiction analysis from diverse sources.'),
});
export type SummarizeContradictionsInput = z.infer<
  typeof SummarizeContradictionsInputSchema
>;

const SummarizeContradictionsOutputSchema = z.object({
  summary: z.string().describe('The summarized contradiction analysis.'),
});
export type SummarizeContradictionsOutput = z.infer<
  typeof SummarizeContradictionsOutputSchema
>;

export async function summarizeContradictions(
  input: SummarizeContradictionsInput
): Promise<SummarizeContradictionsOutput> {
  return summarizeContradictionsFlow(input);
}

const summarizeContradictionsPrompt = ai.definePrompt({
  name: 'summarizeContradictionsPrompt',
  input: {schema: SummarizeContradictionsInputSchema},
  output: {schema: SummarizeContradictionsOutputSchema},
  prompt: `Summarize the following contradiction analysis for the stock ticker {{{ticker}}}.

Contradiction Analysis:
{{{contradictionAnalysis}}}

Summary:`,
});

const summarizeContradictionsFlow = ai.defineFlow(
  {
    name: 'summarizeContradictionsFlow',
    inputSchema: SummarizeContradictionsInputSchema,
    outputSchema: SummarizeContradictionsOutputSchema,
  },
  async input => {
    const {output} = await summarizeContradictionsPrompt(input);
    return output!;
  }
);
