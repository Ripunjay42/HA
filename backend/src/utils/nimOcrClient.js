import ApiError from './ApiError.js';
import { chatComplete } from './nimChatClient.js';

const OCR_ENDPOINT = 'https://ai.api.nvidia.com/v1/cv/nvidia/nemotron-ocr-v2';

const runOcr = async (base64Image) => {
  const apiKey = process.env.NVIDIA_NIM_API_KEY;
  if (!apiKey) throw new ApiError(500, 'Handwriting recognition is not configured');

  const res = await fetch(OCR_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: [{ type: 'image_url', url: `data:image/jpeg;base64,${base64Image}` }],
      merge_levels: ['paragraph'],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new ApiError(502, `Handwriting recognition failed: ${res.status} ${detail}`.slice(0, 300));
  }

  const data = await res.json();
  const textBlocks = data?.data?.[0]?.text_detections || [];
  // Stray marks/smudges on the page can get misread as short, low-confidence
  // fragments (e.g. a spurious "2%") -- drop anything the model itself isn't
  // reasonably sure about so it never reaches the doctor's review screen.
  const CONFIDENCE_THRESHOLD = 0.5;
  return textBlocks
    .filter((block) => (block.text_prediction?.confidence ?? 1) >= CONFIDENCE_THRESHOLD)
    .map((block) => block.text_prediction?.text)
    .filter(Boolean)
    .join('\n');
};

// OCR output from handwriting is often choppy (broken lines, misread
// characters, missing punctuation) -- run it through the LLM to produce
// clean, grammatically-correct prose before showing it to the doctor for
// review. Falls back to the raw OCR text if the correction call fails, so a
// chat-endpoint hiccup never blocks the doctor from seeing something.
const correctGrammar = async (rawText) => {
  if (!rawText.trim()) return rawText;

  const corrected = await chatComplete([
    {
      role: 'system',
      content: 'You correct OCR output from a doctor\'s handwritten prescription. Fix ONLY spelling, grammar, '
        + 'punctuation, and line breaks in the given text. Do not add, expand, interpret, rephrase, or explain '
        + 'anything -- do not add abbreviation expansions, notes, headers, or any text that was not in the '
        + 'original. If the LAST line is a short isolated fragment (a lone number, symbol, or percentage) that '
        + 'is disconnected from the medicine/dosage/instruction lines above it, delete that trailing line -- it '
        + 'is OCR noise from a smudge or stray mark, not part of the prescription. Reply with ONLY the '
        + 'corrected version of the text, nothing else.',
    },
    { role: 'user', content: rawText },
  ], { maxTokens: 400 }).catch(() => null);

  return corrected?.trim() || rawText;
};

// Recognizes handwritten/printed text in a base64-encoded image using
// NVIDIA NIM's hosted OCR model, then grammar-corrects it via the LLM.
export const recognizeHandwriting = async (base64Image) => {
  const rawText = await runOcr(base64Image);
  return correctGrammar(rawText);
};
