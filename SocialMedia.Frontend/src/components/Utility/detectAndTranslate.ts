// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

import convert3To1 from "iso-639-3-to-1";
import { franc } from "franc";
import axios from "axios";

export const detectAndTranslate = async (text: string, targetLang: string) => {
  try {
    // Step 1: Detect language using franc
    const langCode6393 = franc(text); // comes in at 639-3 Example: 'eng', 'fra', etc.

    if (langCode6393 === "und") {
      console.error("Could not detect language.");
      return;
    }

    console.log(`Detected ISO 639-3 code: ${langCode6393}`);

    // Step 2: Convert ISO 639-3 to ISO 639-1
    const langCode6391 = convert3To1(langCode6393); // Example: 'en', 'fr',

    if (!langCode6391) {
      console.error(`No ISO 639-1 mapping found for ${langCode6393}`);
      return;
    }

    console.log(`Converted to ISO 639-1 code: ${langCode6391}`);

    // Step 3: Use MyMemory API for translation
    const response = await axios.get(
      "https://api.mymemory.translated.net/get",
      {
        params: {
          q: text,
          langpair: `${langCode6391}|${targetLang}`, // Example: 'en|es'
        },
      }
    );

    // extracting results to return
    const translatedText = response.data.responseData.translatedText;
    console.log(`Translated text: ${translatedText}`);
    return translatedText;
  } catch (error) {
    console.error("Error during language detection or translation:", error);
  }
};
