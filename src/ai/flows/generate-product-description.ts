'use server';

/**
 * @fileOverview Generates compelling and SEO-optimized product descriptions for AC units.
 *
 * - generateProductDescription - A function that generates a product description.
 * - GenerateProductDescriptionInput - The input type for the generateProductDescription function.
 * - GenerateProductDescriptionOutput - The return type for the generateProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductDescriptionInputSchema = z.object({
  brand: z.string().describe('The brand of the AC unit.'),
  model: z.string().describe('The model of the AC unit.'),
  capacity: z.string().describe('The cooling capacity of the AC unit (e.g., 1.5 Ton).'),
  features: z.string().describe('Key features of the AC unit, separated by commas.'),
  condition: z.string().describe('The condition of the AC unit (e.g., New, Used).'),
});
export type GenerateProductDescriptionInput = z.infer<typeof GenerateProductDescriptionInputSchema>;

const GenerateProductDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated product description for the AC unit.'),
});
export type GenerateProductDescriptionOutput = z.infer<typeof GenerateProductDescriptionOutputSchema>;

export async function generateProductDescription(
  input: GenerateProductDescriptionInput
): Promise<GenerateProductDescriptionOutput> {
  return generateProductDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductDescriptionPrompt',
  input: {schema: GenerateProductDescriptionInputSchema},
  output: {schema: GenerateProductDescriptionOutputSchema},
  prompt: `You are an expert copywriter specializing in writing compelling and SEO-optimized product descriptions for AC units.

  Generate a product description for the following AC unit, focusing on its key features and benefits. Optimize the description for search engines by including relevant keywords.

  Brand: {{{brand}}}
  Model: {{{model}}}
  Capacity: {{{capacity}}}
  Features: {{{features}}}
  Condition: {{{condition}}}

  Description:`,
});

const generateProductDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: GenerateProductDescriptionInputSchema,
    outputSchema: GenerateProductDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
