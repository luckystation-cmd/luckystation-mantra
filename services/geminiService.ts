
import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { StyleOption, OriginOption, MaterialOption, FortuneResult, Language } from "../types";

// --- AMULET DICTIONARY (Knowledge Base) ---
// Maps Thai keywords to strict English visual descriptions to ensure accuracy of amulet molds (Pim).
const AMULET_DICTIONARY: Record<string, string> = {
  // --- เบญจภาคี (Benjapakee) & Famous Amulets ---
  
  "วัดระฆัง": "Phra Somdej Wat Rakang (Pim Yai), the Emperor of Amulets. Rectangular sacred powder tablet. Deeply recessed bell-shaped arch (Sum Ruen Kaew). Buddha seated on a three-tiered base. The chest is broad and sturdy (Ok Phaye). Texture is dry, ancient, creamy white or pale yellow, showing distinctive natural cracking patterns (Taek Lai Nga) or traces of gold leaf and black lacquer.",
  "สมเด็จวัดระฆัง": "Phra Somdej Wat Rakang (Pim Yai), the Emperor of Amulets. Rectangular sacred powder tablet. Deeply recessed bell-shaped arch (Sum Ruen Kaew). Buddha seated on a three-tiered base. The chest is broad and sturdy (Ok Phaye). Texture is dry, ancient, creamy white or pale yellow, showing distinctive natural cracking patterns (Taek Lai Nga) or traces of gold leaf and black lacquer.",
  
  "พระสมเด็จ": "Rectangular amulet, Phra Somdej style. Sitting Buddha in meditation (Samadhi) pose on a three-tiered throne base. Smooth, rounded arch frame (ซุ้มครอบแก้ว). Minimalist, ancient powder texture with natural cracks (แตกลายงา). No facial features.",
  "สมเด็จ": "Rectangular amulet, Phra Somdej style. Sitting Buddha in meditation (Samadhi) pose on a three-tiered throne base. Smooth, rounded arch frame (ซุ้มครอบแก้ว). Minimalist, ancient powder texture with natural cracks (แตกลายงา). No facial features.",

  "พระร่วงรางปืน": "Ancient standing Buddha amulet, Khmer-Lopburi art style. Standing inside a tall, narrow, U-shaped arched frame resembling an antique gun barrel. Wearing heavy ancient royal attire, crown. Both hands raised in double Abhaya Mudra (ปางห้ามญาติ). Elongated body, very old metallic/leaden texture with reddish rust.",
  "พระร่วง": "Ancient standing Buddha amulet, Khmer-Lopburi art style. Standing inside a tall, narrow, U-shaped arched frame resembling an antique gun barrel. Wearing heavy ancient royal attire, crown. Both hands raised in double Abhaya Mudra (ปางห้ามญาติ). Elongated body, very old metallic/leaden texture with reddish rust.",

  "พระปิดตา": "Monk amulet figure sitting in full lotus posture. Using both hands to tightly cover the eyes (Pidta pose). Plump, robust, rounded body shape symbolizing wealth. No facial features visible. Smooth curves, sacred powder texture.",
  "ปิดตา": "Monk amulet figure sitting in full lotus posture. Using both hands to tightly cover the eyes (Pidta pose). Plump, robust, rounded body shape symbolizing wealth. No facial features visible. Smooth curves, sacred powder texture.",

  "พระนางพญา": "Triangular shaped amulet. Sitting Buddha in subduing Mara pose (ปางมารวิชัย). Broad shoulders, narrow waist, bulging chest (อกนูน). No facial details, smooth ancient clay texture.",
  "นางพญา": "Triangular shaped amulet. Sitting Buddha in subduing Mara pose (ปางมารวิชัย). Broad shoulders, narrow waist, bulging chest (อกนูน). No facial details, smooth ancient clay texture.",

  "พระซุ้มกอ": "Thumb-shaped amulet (ทรงหัวแม่มือ). Sitting Buddha in meditation pose within an ornate Thai Kanok pattern arch (ซุ้มกนก). Looks graceful, soft ancient clay texture.",
  "ซุ้มกอ": "Thumb-shaped amulet (ทรงหัวแม่มือ). Sitting Buddha in meditation pose within an ornate Thai Kanok pattern arch (ซุ้มกนก). Looks graceful, soft ancient clay texture.",

  "พระผงสุพรรณ": "Triangular amulet with cut top corners. Sitting Buddha in subduing Mara pose. Prominent chest, elongated face, ancient clay texture.",
  
  "หลวงพ่อเงิน": "Small cast statuette (รูปหล่อโบราณ) of an elderly plump monk (Luang Phor Ngern). Sitting smiling in meditation. Round face, bald head. Rough, ancient cast brass/bronze texture with natural patina stains (คราบเบ้า).",
  "วัดบางคลาน": "Small cast statuette (รูปหล่อโบราณ) of an elderly plump monk (Luang Phor Ngern). Sitting smiling in meditation. Round face, bald head. Rough, ancient cast brass/bronze texture with natural patina stains (คราบเบ้า).",

  "หลวงปู่ทวด": "Statue of elderly monk Luang Pu Thuat sitting in lotus position. Wears glasses (optional), draped in monk robes. Serene old face, distinct facial features. Black or dark texture.",
  "ปู่ทวด": "Statue of elderly monk Luang Pu Thuat sitting in lotus position. Wears glasses (optional), draped in monk robes. Serene old face, distinct facial features. Black or dark texture.",

  "ขุนแผน": "Pentagonal shaped amulet (ทรงห้าเหลี่ยม). Buddha sitting inside a house-like arch (ซุ้มเรือนแก้ว). Warrior-like elegance, charm and attraction vibes.",
  
  "ท้าวเวสสุวรรณ": "Giant Yaksha Demon God (Thao Wessuwan) standing holding a club. Fierce face, fangs, wearing golden armor and regalia. Powerful stance, giant aura.",
  
  "พญาครุฑ": "Garuda deity, half-man half-bird. Golden wings spread out, muscular human torso, bird head and beak, talons. Majestic and powerful.",
  
  "พญานาค": "Naga Serpent King. Multi-headed cobra hood, scales, mystical underwater or cave setting. Glowing eyes, divine aura."
};

// --- OFFLINE FORTUNES (Fallback for 429/Offline) ---
const OFFLINE_FORTUNES: Record<Language, FortuneResult[]> = {
  th: [
    { verse: "จิตตั้งมั่น อธิษฐาน ด้วยศรัทธา\nพรเมตตา มหาเทพ ประทานให้", prediction: "สิ่งที่หวังไว้กำลังจะสำเร็จผล ขอให้หมั่นทำความดี", lucky_numbers: "09, 99" },
    { verse: "เมฆหมอกจาง สว่างแจ้ง แห่งหนทาง\nความอ้างว้าง จักหายไป ในเร็ววัน", prediction: "อุปสรรคกำลังจะผ่านพ้น โอกาสใหม่ๆ กำลังเข้ามา", lucky_numbers: "14, 28" },
    { verse: "ทำดีได้ดี มีผล บุญส่งเสริม\nบารมีเพิ่ม พูนสุข ทุกสถาน", prediction: "ผลบุญที่ทำมาจะส่งผลให้มีความสุขความเจริญ", lucky_numbers: "55, 88" },
    { verse: "แม้นเหนื่อยยาก ลำบากกาย ในวันนี้\nวันข้างหน้า สุขขี มั่งมีทรัพย์", prediction: "ความพยายามจะไม่สูญเปล่า ความสำเร็จรออยู่ไม่ไกล", lucky_numbers: "36, 63" },
    { verse: "ดวงชะตา รุ่งโรจน์ โชติช่วงนัก\nคนรักทัก ผู้ใหญ่เอ็นดู ชูส่งเสริม", prediction: "จะเป็นที่รักของผู้คน ผู้ใหญ่จะให้การสนับสนุน", lucky_numbers: "24, 42" },
  ],
  en: [
    { verse: "Clouds disperse, the sun shines bright,\nGuiding you to future light.", prediction: "Obstacles are fading. New opportunities await.", lucky_numbers: "14, 28" },
    { verse: "Good deeds sown in faith and love,\nBring sweet blessings from above.", prediction: "Your kindness will return to you a hundredfold.", lucky_numbers: "55, 88" },
    { verse: "Though the climb is steep today,\nSuccess meets you on the way.", prediction: "Persistence is key. Victory is near.", lucky_numbers: "36, 63" },
    { verse: "Stars align and fortune calls,\nFavor rises, nothing falls.", prediction: "A stroke of good luck is coming your way.", lucky_numbers: "09, 99" },
    { verse: "With open heart and steady mind,\nTrue contentment you shall find.", prediction: "Focus on your inner peace, and wealth will follow.", lucky_numbers: "24, 42" }
  ]
};

/**
 * Enhances a simple user input into a complex, "Sai Mu" style prompt.
 * Accepts 'language' to generate the blessing in the correct language.
 */
export const enhancePrompt = async (
  userInput: string, 
  style: StyleOption, 
  origin: OriginOption, 
  hasReferenceImage: boolean,
  material?: MaterialOption,
  language: Language = 'th'
): Promise<{ prompt: string, blessing: string, fontStyleTag?: string }> => {
  if (!process.env.API_KEY) {
     throw new Error("API_KEY_ERROR: Missing API Key.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 1. LOOKUP AMULET DICTIONARY
  // Scan input for known amulet keywords to get a precise visual description.
  let explicitVisualReference = "";
  // Check against dictionary keys. We iterate to find if the user input contains any key.
  for (const [key, desc] of Object.entries(AMULET_DICTIONARY)) {
    if (userInput.includes(key)) {
      explicitVisualReference = desc;
      break; // Stop at first match to prioritize the most specific definition found
    }
  }

  try {
    const systemInstruction = `
      **Role:** Divine Digital Artist & Prompt Engineer (Specialist in Thai/Asian Sacred Art).

      **Objective:** Construct a high-fidelity image generation prompt based on User Inputs and strict Visual Rules.

      **SAFETY PROTOCOL (STRICT):**
      - The output prompt MUST be Safe For Work (SFW).
      - NO nudity, NO sexual content, NO gore, NO excessive violence.
      - If the user asks for something sensitive (e.g. "Love spell", "Charming oil"), sanitize it to be artistic, symbolic, and magical (e.g. "Glowing pink aura", "Flowers") instead of explicit.
      - Do not use words like "blood", "kill", "naked", "erotic".

      **INPUTS:**
      - [Keyword]: "${userInput}"
      - [Explicit Visual Reference]: "${explicitVisualReference}" (From Internal Amulet Dictionary)
      - [Style]: "${style.name}" (ID: ${style.id})
      - [Origin]: "${origin.name}"
      - [Material]: "${material ? material.name : 'N/A'}"
      - [Target Language]: "${language}"

      **LOGIC FLOW (Follow strictly to build the 'prompt'):**

      **STEP A: Base Style Definition (The Atmosphere)**
      - IF [Style] ID is "chibi-pastel": Start with "Cute Chibi style, big head small body, pastel colors, soft lighting, 2D vector illustration, white outline sticker style."
      - IF [Style] ID is "artmulet": Start with "3D Digital Sculpture, Sacred Amulet style, ZBrush sculpt, Octane Render, hyper-realistic material, dramatic studio lighting, solid black background, centered composition."
      - IF [Style] ID is "sacred-deity" OR "luckystation": Start with "Majestic Deity Portrait, celestial aura, glowing magical effects, highly detailed, 8K resolution, cinematic composition."
      - ELSE: Use the provided [Style] description: "${style.promptModifier}".

      **STEP B: Culture/Origin Injection**
      - IF [Origin] includes "Thai": Add "Traditional Thai Art style, Kanok patterns, intricate gold ornaments."
      - IF [Origin] includes "Indian": Add "Indian Art style, vibrant Bollywood colors, heavy jewelry, deep spiritual atmosphere."
      - IF [Origin] includes "Chinese": Add "Chinese Deity style, silk robes, jade textures, Wuxia atmosphere."
      - ELSE: Add context based on [Origin]: "${origin.promptModifier}".

      **STEP C: VISUAL REFERENCE & CORRECTION RULES (CRITICAL)**
      - **RULE 1 (AMULET DICTIONARY):** IF [Explicit Visual Reference] is NOT empty, YOU MUST USE IT as the core physical description of the main subject. This overrides generic interpretations of the [Keyword]. 
        - Example: If Reference is "Rectangular amulet...", do not generate a human figure, generate a rectangular tablet.
      - **RULE 2 (Subject Specifics):**
        - **"Luesi", "Por Gae", "Hermit" (ฤาษี/พ่อแก่):** "Old hermit with long white beard, wearing a TIGER SKIN HAT (pointed shape) and TIGER SKIN ROBES. Must have a vertical THIRD EYE on the forehead."
        - **"Garuda" (ครุฑ):** "Lord Vishnu (Blue skin) riding on Garuda (Golden/Red skin). Vishnu sits on Garuda's shoulders. Garuda uses his talons to grasp a Green Naga serpent."
        - **"Brahma" (พระพรหม):** "Four faces (3 visible), multiple arms, but ONLY TWO LEGS. Sitting posture."
      - **RULE 3 (Material):** If [Material] is provided ("${material ? material.name : ''}"), apply it to the main subject: "${material ? material.promptModifier : ''}".

      **STEP D: Blessing & Font Logic**
      - **Blessing:** Generate a short, auspicious blessing in [Target Language].
      - **Font Tag:**
        - IF [Style] ID is "chibi-pastel": Set "font_style_tag" to "chibi".
        - ELSE: Set "font_style_tag" to "standard".

      **Output Format:**
      Return JSON with 'prompt', 'blessing', and 'font_style_tag'.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate prompt for keyword: "${userInput}"`,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.75,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prompt: { type: Type.STRING },
            blessing: { type: Type.STRING },
            font_style_tag: { type: Type.STRING, enum: ["thai_traditional", "chinese_brush", "indian_sacred", "chibi", "standard"] }
          },
          required: ["prompt", "blessing", "font_style_tag"]
        }
      }
    });

    const text = response.text || "{}";
    const json = JSON.parse(text);

    return {
      prompt: json.prompt || `${origin.promptModifier}, ${style.promptModifier}, ${explicitVisualReference || userInput}, masterpiece`,
      blessing: json.blessing || (language === 'th' ? "โชคดีมีชัย" : "Divine Blessings"),
      fontStyleTag: json.font_style_tag || "standard"
    };

  } catch (error: any) {
    // Graceful handling of Quota Limits or Rate Limits
    const errString = (error.message || "") + (error.toString() || "");
    
    // Check if it's a critical error we want to bubble up (like API Key)
    if (errString.includes('API_KEY') || errString.includes('403') || errString.includes('UNAUTHENTICATED')) {
        throw new Error("API_KEY_ERROR: The system cannot find a valid API Key.");
    }
    // Check for 429
    if (errString.includes('429') || errString.includes('RESOURCE_EXHAUSTED')) {
        throw new Error("QUOTA_ERROR: Server busy.");
    }

    console.warn("Enhance Prompt Error (Using Fallback):", errString);

    // Fallback Logic
    // Even in fallback, we use the Dictionary description if available
    const fallbackSubject = explicitVisualReference ? `${explicitVisualReference} (${userInput})` : userInput;
    const materialStr = material ? material.promptModifier : "";
    
    return {
      prompt: `${style.promptModifier}, ${origin.promptModifier}, ${fallbackSubject}, ${materialStr}, sacred, divine aura, 8k, masterpiece`,
      blessing: language === 'th' ? "โชคดีมีชัย" : "Divine Blessings",
      fontStyleTag: "standard"
    };
  }
};

/**
 * Cleans raw input to remove UI/Instructional text often found in copy-pastes
 * e.g., "Pixlr...", "Toggle button", "Click here"
 */
const cleanRawInput = (input: string): string => {
  let cleaned = input;
  
  // 1. Remove common UI instruction phrases (Case insensitive)
  const junkPhrases = [
    "click the flag", "toggle button", "make private", "generated by", 
    "image generator", "secure to create", "confidential", "review flagged content",
    "unsuitable images", "peace of mind", "community is safe", "pixlr", "app", 
    "interface", "screenshot", "button", "menu"
  ];
  
  junkPhrases.forEach(phrase => {
    const regex = new RegExp(phrase, 'gi');
    cleaned = cleaned.replace(regex, "");
  });
  
  return cleaned.replace(/\s+/g, ' ').trim();
};

/**
 * Constructs a prompt directly without using an LLM (Raw Mode).
 * Used when "Magic Enhance" is OFF or as a fallback.
 */
export const quickConstructPrompt = (
  userInput: string,
  style: StyleOption,
  origin: OriginOption,
  material?: MaterialOption,
  language: Language = 'th'
): { prompt: string, blessing: string, fontStyleTag: string } => {
  // 0. Safety Clean (The "Pixlr" Fix)
  const cleanedInput = cleanRawInput(userInput);
  const effectiveInput = cleanedInput.length > 0 ? cleanedInput : userInput; 

  // 1. Dictionary Lookup
  let explicitVisualReference = "";
  for (const [key, desc] of Object.entries(AMULET_DICTIONARY)) {
    if (effectiveInput.includes(key)) {
      explicitVisualReference = desc;
      break;
    }
  }

  // 2. Base Subject
  const subject = explicitVisualReference ? `${explicitVisualReference} (${effectiveInput})` : effectiveInput;
  
  // 3. Material
  const materialStr = material ? `, ${material.promptModifier}` : "";
  
  // 4. Style Logic
  let prefix = "";
  if (style.id === 'chibi-pastel') prefix = "Cute Chibi style, big head small body, pastel colors, soft lighting, 2D vector illustration, white outline sticker style, ";
  else if (style.id === 'artmulet') prefix = "3D Digital Sculpture, Sacred Amulet style, ZBrush sculpt, Octane Render, hyper-realistic material, dramatic studio lighting, solid black background, centered composition, ";
  else prefix = `${style.promptModifier}, `;

  const originStr = origin.id === 'thai' ? "Traditional Thai Art style, Kanok patterns, intricate gold ornaments" : origin.promptModifier;

  const finalPrompt = `${prefix}${originStr}, ${subject}${materialStr}, masterpiece, 8k, high quality, sharp focus`;

  // 5. Static Blessing
  const blessing = language === 'th' ? "โชคดีมีชัย" : "Divine Blessings";

  // 6. Font Tag
  const fontStyleTag = style.id === 'chibi-pastel' ? "chibi" : "standard";

  return {
    prompt: finalPrompt,
    blessing,
    fontStyleTag
  };
};

/**
 * Generates an image based on the prompt.
 */
export const generateImage = async (
  prompt: string, 
  aspectRatio: "9:16" = "9:16",
  referenceImageBase64?: string,
  styleId?: string
): Promise<string> => {
  if (!process.env.API_KEY) {
      throw new Error("API_KEY_ERROR: Missing API Key.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Base Negative Prompt (Safety & Quality Guardrails)
  // UPDATED: Aggressive exclusions for UI elements (The Pixlr Fix)
  let negativeConstraints = "Distorted face, extra legs, extra fingers, fused limbs, bad anatomy, blurry, watermark, text, low quality, cropped, missing limbs, floating limbs, disconnected limbs, mutation, ugly, disgusting, amputation, User Interface, UI, Mobile App, Screen, Screenshot, Website, Buttons, Menu, Navigation Bar, Pop-up, Error Message, Notification, Text Overlay, Copyright info, Toggle, Icons, Status bar, nudity, sexually explicit, nsfw, gore, blood";

  const promptLower = prompt.toLowerCase();

  // SPECIAL CORRECTION RULES (Negative Prompt Injection)
  if (promptLower.includes('vishnu') || promptLower.includes('garuda') || promptLower.includes('krut') || promptLower.includes('narayana')) {
      negativeConstraints += ", Vishnu having wings, angel wings, blue Garuda, blue bird man";
  }

  // Style-specific negative constraints
  if (styleId === 'sak-yant') {
    const isPhaYant = promptLower.includes('pha yant') || promptLower.includes('fabric');
    const isGold = promptLower.includes('gold') || promptLower.includes('golden');
    if (isPhaYant || isGold) {
        negativeConstraints += ", 3D render, realistic human skin, messy sketch, cartoon, anime face";
    } else {
        negativeConstraints += ", Shading, gradient, 3D render, realistic photo, gray colors, messy sketch, realistic skin texture, 3D modeling";
    }
  }
  
  // Specific fix for Amulets (Artmulet style)
  if (styleId === 'artmulet') {
     negativeConstraints += ", human skin, living person, cartoon, anime, bright colorful background, holding hands, fingers";
  }

  const finalPrompt = "Generate a high-quality image of: " + prompt + " \n\nNegative Constraints/Exclusions: " + negativeConstraints;

  try {
    const parts: any[] = [];
    if (referenceImageBase64) {
      const mimeMatch = referenceImageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
      let mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
      if (mimeType === 'image/jpg') mimeType = 'image/jpeg';
      const base64Data = referenceImageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
      parts.push({ inlineData: { mimeType: mimeType, data: base64Data } });
    }
    parts.push({ text: finalPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: parts },
      config: {
        systemInstruction: "You are a professional digital artist. Generate high-quality images. Do not generate text in the image.",
        imageConfig: { aspectRatio: aspectRatio },
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        ]
      }
    });

    const candidate = response.candidates?.[0];
    if (!candidate) throw new Error("API returned no candidates.");
    
    // Explicitly Check for Safety Block or Filtered Content
    if (candidate.finishReason === 'SAFETY' || candidate.finishReason === 'RECITATION') {
        throw new Error("SAFETY_BLOCK: The AI refused to generate this image due to safety guidelines.");
    }

    if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    // If no parts found but no explicit finishReason safety error, it might still be a safety filter returning empty content
    throw new Error("SAFETY_BLOCK: The generated image was filtered out.");

  } catch (error) {
    console.error("Image generation failed:", error);
    throw error;
  }
};

/**
 * Analyzes an image. 
 * Accepts 'language' to return analysis in the correct language.
 */
export const reverseEngineerPrompt = async (
    base64Image: string, 
    language: Language = 'th'
): Promise<{ prompt: string, analysis: string }> => {
  if (!process.env.API_KEY) throw new Error("API_KEY_ERROR");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    **Role:** Expert Art Historian & Reverse Prompt Engineer.

    **Task:**
    Analyze the provided image and generate:
    1. A detailed English text prompt for AI image generation.
    2. A short, professional [Target Language] summary of the art style, material, and subject.

    **[LANGUAGE PROTOCOL]**
    - **IF Target = 'th' (Thai):** Start analysis with "วิเคราะห์พบ: ...". Use formal Thai art terms.
    - **IF Target = 'en' (English):** Start analysis with "Analysis: ...". Use expert art vocabulary (e.g., "Gilded bronze", "Chiaroscuro lighting").

    **Output Format:**
    Return JSON format only.
  `;

  try {
     const mimeMatch = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
     let mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
     if (mimeType === 'image/jpg') mimeType = 'image/jpeg';
     const base64Data = base64Image.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

     const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Data } },
          { text: `Analyze this image. Target Language: ${language}` }
        ]
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prompt: { type: Type.STRING },
            analysis: { type: Type.STRING }
          },
          required: ["prompt", "analysis"]
        }
      }
    });

    const text = response.text || "{}";
    const json = JSON.parse(text);

    return {
      prompt: json.prompt || "Could not analyze image.",
      analysis: json.analysis || (language === 'th' ? "ไม่สามารถวิเคราะห์ภาพได้" : "Unable to analyze image.")
    };

  } catch (error) {
    console.error("Reverse engineering failed:", error);
    throw new Error("Failed to analyze image.");
  }
};

/**
 * Generates an Daily Fortune (Siamsi).
 * Accepts 'language' to generate the prediction in the correct language.
 */
export const getDailyFortune = async (
    promptDescription: string, 
    language: Language = 'th'
): Promise<FortuneResult> => {
  if (!process.env.API_KEY) {
      // Offline fallback immediate if no key
      const list = OFFLINE_FORTUNES[language];
      return list[Math.floor(Math.random() * list.length)];
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    **Role:** Divine Oracle & Astrologer.

    **Objective:**
    Generate a short, auspicious daily fortune (Siamsi) based on the [Deity].

    **[LANGUAGE PROTOCOL]**
    - **IF Target = 'th' (Thai):** 
       - Verse: 2-line Thai rhyme. 
       - Prediction: Encouraging Thai prediction.
    - **IF Target = 'en' (English):**
       - Verse: A short 2-line spiritual poem/rhyme in English. (e.g., "Stars align for you today / Fortunes come without delay").
       - Prediction: Clear, mystical English prediction.

    **Tone:** Sacred, Encouraging, Poetic.

    **Output Format (JSON):**
    {
      "verse": "string",
      "prediction": "string",
      "lucky_numbers": "string"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `[Deity]: "${promptDescription}" \n [Target Language]: "${language}"`,
      config: {
        systemInstruction: systemInstruction,
        temperature: 1.0, 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verse: { type: Type.STRING },
            prediction: { type: Type.STRING },
            lucky_numbers: { type: Type.STRING }
          },
          required: ["verse", "prediction", "lucky_numbers"]
        }
      }
    });

    const text = response.text || "{}";
    const json = JSON.parse(text);

    return {
      verse: json.verse || (language === 'th' ? "ขอพรพระให้คุ้มครอง" : "Blessings fall like gentle rain"),
      prediction: json.prediction || (language === 'th' ? "วันนี้เป็นวันดีของคุณ" : "Today brings new opportunities."),
      lucky_numbers: json.lucky_numbers || "99, 108"
    };

  } catch (error: any) {
    // Handling 429 Quota Exceeded silently by providing an offline fortune
    const errString = (error.message || "") + (error.toString() || "");
    if (errString.includes('429') || errString.includes('quota') || errString.includes('RESOURCE_EXHAUSTED')) {
        console.warn("Quota exceeded for Fortune. Using Offline Fortune.");
        const list = OFFLINE_FORTUNES[language];
        // Pick a random offline fortune
        return list[Math.floor(Math.random() * list.length)];
    }

    console.error("Fortune generation failed:", error);
    
    // Generic fallback
    return {
      verse: language === 'th' ? "ความพยายามอยู่ที่ไหน\nความสำเร็จอยู่ที่นั่น" : "Where effort goes,\nSuccess flows.",
      prediction: language === 'th' ? "ให้หมั่นทำความดี" : "Keep good faith, miracles happen.",
      lucky_numbers: "09"
    };
  }
};
