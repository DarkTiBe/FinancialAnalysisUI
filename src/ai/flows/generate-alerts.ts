// This file is machine-generated - edit with caution!

'use server';

/**
 * @fileOverview Generates actionable alerts and recommendations for critical stock insights.
 *
 * - generateAlerts - A function to generate stock alerts.
 * - GenerateAlertsInput - The input type for the generateAlerts function.
 * - GenerateAlertsOutput - The return type for the generateAlerts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAlertsInputSchema = z.object({
  ticker: z.string().describe('The stock ticker symbol to generate alerts for.'),
  analysisSummary: z
    .string() 
    .describe("A summary of the analysis of the stock, including contradictions, confirmations and confidence."),
});

export type GenerateAlertsInput = z.infer<typeof GenerateAlertsInputSchema>;

const GenerateAlertsOutputSchema = z.object({
  alerts: z.array(
    z.object({
      message: z.string().describe('The alert message.'),
      severity: z.enum(['critical', 'high', 'medium', 'low']).describe('The severity level of the alert.'),
      recommendation: z.string().describe('An actionable recommendation based on the alert.'),
    })
  ).describe('A list of actionable alerts and recommendations.')
});

export type GenerateAlertsOutput = z.infer<typeof GenerateAlertsOutputSchema>;

export async function generateAlerts(input: GenerateAlertsInput): Promise<GenerateAlertsOutput> {
  return generateAlertsFlow(input);
}

const generateAlertsPrompt = ai.definePrompt({
  name: 'generateAlertsPrompt',
  input: {schema: GenerateAlertsInputSchema},
  output: {schema: GenerateAlertsOutputSchema},
  prompt: `You are an AI assistant specialized in generating actionable stock trading alerts and recommendations.

  Based on the analysis summary provided for the stock ticker {{{ticker}}}, generate a list of alerts with actionable recommendations.

  Analysis Summary:
  {{analysisSummary}}

  Each alert should include a message, a severity level (critical, high, medium, or low), and an actionable recommendation.
  The alerts and recommendations should be based on the analysis summary, such as contradictory signals, significant confirmations, or low confidence.
  `,
});

const generateAlertsFlow = ai.defineFlow(
  {
    name: 'generateAlertsFlow',
    inputSchema: GenerateAlertsInputSchema,
    outputSchema: GenerateAlertsOutputSchema,
  },
  async input => {
    const {output} = await generateAlertsPrompt(input);
    return output!;
  }
);

