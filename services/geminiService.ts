/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI } from '@google/genai';

/**
 * Analyzes an image to determine if it matches the criteria for the GOAL predictor game.
 * @param base64ImageData The base64 encoded image data.
 * @returns A string "VALID" or "INVALID".
 */
export const analyzeImage = async (base64ImageData: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg', // Assuming jpeg, but could be dynamic
      data: base64ImageData,
    },
  };

  const textPart = {
    text: `Analyze the provided image. Strictly determine if it meets ALL of the following criteria:
1. It features two prominent male soccer players, typically recognizable figures like Messi, Neymar, or Ronaldo.
2. It includes a large, stylized text element "GOAL!".
3. It displays two distinct, colored, and opposing choice buttons. The text on these buttons should be related to scoring a goal, such as "Goal" and "No Goal", in any language (e.g., Arabic 'هدف' and 'لا هدف').
4. It shows a button for placing a bet (e.g., "Place Bet" or 'وضع الرهان').

Based on your analysis, respond with ONLY the word "VALID" if ALL criteria are met. Otherwise, respond with ONLY the word "INVALID". Do not provide any other explanation or text.`
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Using flash for speed
      contents: { parts: [imagePart, textPart] },
    });

    const resultText = response.text.trim().toUpperCase();

    if (resultText === 'VALID' || resultText === 'INVALID') {
      return resultText;
    } else {
      // The model didn't follow instructions, so we treat it as invalid.
      console.warn('Gemini response was not VALID or INVALID:', resultText);
      return 'INVALID';
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to analyze image with AI.');
  }
};
