
import { StyleOption, OriginOption, MaterialOption } from './types';

export const APP_NAME = "Luckystation";

export const UI_STRINGS = {
  en: {
    generate_tab: "🎨 Generate",
    altar_tab: "🙏 Altar",
    gallery_tab: "🎴 Gallery",
    analyze_tab: "👁️ Analyze",
    title_prefix: "Divine",
    title_suffix: "Image Generator",
    subtitle: "Type a name or upload an image to generate a sacred wallpaper.",
    input_label: "YOUR WISH / KEYWORD",
    input_placeholder: "E.g., 'Ganesha', 'Naga', 'Somdej Wat Rakang', 'Success'",
    upload_btn: "Upload Reference Image (Optional)",
    origin_label: "📍 SELECT ORIGIN (ART TRADITION)",
    style_label: "✨ SELECT MOOD & TONE",
    material_label: "✨ SELECT MATERIAL",
    generate_btn_idle: "Generate Mantra 🔮",
    generate_btn_loading: "Manifesting...",
    powered_by: "Powered by Gemini • Luckystation",
    
    // UPDATED ERROR MESSAGES
    error_msg: "❌ System Error.",
    error_msg_hint: "Tip: Check internet or try a shorter prompt.",
    safety_error_msg: "⚠️ Safety Block: The AI refused this prompt.\n💡 FIX: Try disabling 'Magic Mode' or remove sensitive words (violence, nudity).",
    quota_msg: "⚠️ Server Busy (Quota Exceeded).\n💡 FIX: Please wait 60 seconds before trying again.",
    apikey_msg: "⚠️ API Key / Permission Error.\n💡 FIX: Check your API Key configuration.",
    bad_req_msg: "⚠️ Invalid Request (400).\n💡 FIX: Prompt might be too long or invalid.",
    
    // Magic Toggle
    magic_mode_on: "Magic ON ✨",
    magic_mode_off: "Raw Mode ⚡",
    
    // Altar
    light_incense: "Light Incense",
    shake_siamsi: "Shake Siamsi",
    shaking: "Shaking...",
    offer_btn: "Offer",
    change_offering: "Change",
    shake_hint: "* Shake your phone to interact",
    no_deity: "No Deity Image (Please Generate First)",
    save_fortune: "Save Fortune",
    share_social: "Share on Social Media",

    // Gallery
    empty_gallery: "No Sacred Cards Yet",
    empty_gallery_sub: "Generate images to build your collection.",
    view_card: "View",
    delete_card: "Delete",
    confirm_delete: "Delete this sacred image?",

    // Analyze
    analyze_title: "Sacred Image Analysis",
    analyze_subtitle: "Upload a deity image to reverse-engineer its style.",
    tap_upload: "Tap to Upload Image",
    paste_url: "Paste image URL...",
    load_url: "Load",
    analyze_btn: "Analyze Style",
    scanning: "Scanning...",
    ai_analysis_title: "AI ANALYSIS",
    extracted_prompt: "Extracted Prompt",
    copy_btn: "📋 Copy",
    use_prompt_btn: "✨ Use This Prompt",

    // Result & Detail
    save_image: "Save Image",
    share_btn: "Share",
    delete_btn: "Delete",
    info_btn: "Prompt",
    remix_btn: "✨ Remix (Use Prompt)",
    prompt_details: "Sacred Formula (Prompt)",
    close_btn: "Close",

    // Loaders
    enhancing_title: "Enhancing Prompt...",
    enhancing_desc: "AI is adding spiritual details...",
    generating_title: "Generating Image...",
    generating_desc: "Manifesting your vision...",
  },
  th: {
    generate_tab: "🎨 สร้างภาพ",
    altar_tab: "🙏 ห้องพระ",
    gallery_tab: "🎴 คลังภาพ",
    analyze_tab: "👁️ แกะสูตร",
    title_prefix: "เนรมิต",
    title_suffix: "ภาพมงคลศักดิ์สิทธิ์",
    subtitle: "พิมพ์ชื่อเทพ หรือสิ่งที่ปรารถนา เพื่อสร้างวอลเปเปอร์มงคล",
    input_label: "คำอธิษฐาน / คีย์เวิร์ด",
    input_placeholder: "เช่น 'สมเด็จวัดระฆัง', 'พญานาค', 'พระพิฆเนศ', 'ความสำเร็จ'",
    upload_btn: "อัปโหลดรูปอ้างอิง (ไม่บังคับ)",
    origin_label: "📍 เลือกต้นกำเนิด (สไตล์ศิลปะ)",
    style_label: "✨ เลือกบรรยากาศ (Mood & Tone)",
    material_label: "✨ เลือกวัสดุ",
    generate_btn_idle: "เริ่มร่ายมนต์ 🔮",
    generate_btn_loading: "กำลังร่ายมนต์...",
    powered_by: "ขับเคลื่อนด้วย Gemini • Luckystation",
    
    // UPDATED ERROR MESSAGES
    error_msg: "❌ เกิดข้อผิดพลาดในระบบ",
    error_msg_hint: "คำแนะนำ: เช็คอินเทอร์เน็ต หรือลองเปลี่ยนคำ",
    safety_error_msg: "⚠️ ติดเงื่อนไขความปลอดภัย (Safety Block)\n💡 วิธีแก้: ลองปิดโหมด 'Magic (AI)' หรือลบคำที่ดูรุนแรง/ล่อแหลมออก",
    quota_msg: "⚠️ ระบบทำงานหนัก (Quota เต็ม)\n💡 วิธีแก้: กรุณารอ 1 นาที แล้วลองกดใหม่ครับ",
    apikey_msg: "⚠️ ปัญหาที่สิทธิ์การเข้าถึง (API Key/Permission)\n💡 วิธีแก้: ตรวจสอบการตั้งค่า API Key",
    bad_req_msg: "⚠️ คำสั่งไม่ถูกต้อง (400 Bad Request)\n💡 วิธีแก้: คำสั่งอาจยาวเกินไป หรือมีตัวอักษรแปลกปลอม",
    
    // Magic Toggle
    magic_mode_on: "เปิดมนตร์ (AI) ✨",
    magic_mode_off: "โหมดดิบ (Raw) ⚡",
    
    // Altar
    light_incense: "จุดธูปขอพร",
    shake_siamsi: "เขย่าเซียมซี",
    shaking: "กำลังเขย่า...",
    offer_btn: "ถวายของ",
    change_offering: "เปลี่ยนของ",
    shake_hint: "* เขย่ามือถือเพื่อเสี่ยงทาย",
    no_deity: "ยังไม่มีรูปองค์เทพ (กรุณาสร้างภาพก่อน)",
    save_fortune: "บันทึกคำทำนาย",
    share_social: "แชร์ลงโซเชียล",

    // Gallery
    empty_gallery: "ยังไม่มีการ์ดสะสม",
    empty_gallery_sub: "สร้างภาพมงคลเพื่อเริ่มสะสมแต้มบุญในสมุด",
    view_card: "ดูรูป",
    delete_card: "ลบ",
    confirm_delete: "ต้องการลบรูปมงคลนี้ใช่ไหม?",

    // Analyze
    analyze_title: "แกะสูตรพระเครื่อง/ศิลปะ",
    analyze_subtitle: "อัปโหลดรูปองค์เทพ เพื่อให้ AI วิเคราะห์สไตล์",
    tap_upload: "แตะเพื่ออัปโหลดรูป",
    paste_url: "วางลิงก์รูปภาพ...",
    load_url: "โหลด",
    analyze_btn: "วิเคราะห์พลังงาน",
    scanning: "กำลังสแกน...",
    ai_analysis_title: "ผลการวิเคราะห์",
    extracted_prompt: "สูตรคำสั่ง (Prompt)",
    copy_btn: "📋 คัดลอก",
    use_prompt_btn: "✨ ใช้สูตรนี้",

    // Result & Detail
    save_image: "บันทึกรูป",
    share_btn: "แชร์",
    delete_btn: "ลบรูป",
    info_btn: "ดูสูตร",
    remix_btn: "✨ ใช้สูตรนี้ (Remix)",
    prompt_details: "สูตรคำสั่ง (Prompt)",
    close_btn: "ปิด",

    // Loaders
    enhancing_title: "กำลังผูกดวง...",
    enhancing_desc: "AI กำลังขยายความศักดิ์สิทธิ์ให้คำขอของคุณ",
    generating_title: "กำลังเนรมิต...",
    generating_desc: "วาดภาพจากจินตนาการ...",
  }
};

export const ORIGINS: OriginOption[] = [
  { 
    id: 'thai', 
    name: 'Thai Art', 
    name_th: 'ไทย (Thai Art)',
    promptModifier: 'Thai Contemporary Art style (Neo-Traditional), **Mystical atmosphere with glowing Golden Thai Yantra (Sak Yant) scripts floating in background**, 3D volumetric depth, soft shading, hyper-realistic divine skin texture, intricate gold Lai Thai patterns, glorious Ayutthaya temple aesthetics, floating in celestial space, NOT flat 2D mural, dimensional lighting', 
    flag: '🇹🇭',
    flagCode: 'th'
  },
  { 
    id: 'india', 
    name: 'Indian Art', 
    name_th: 'อินเดีย (Indian Art)',
    promptModifier: 'Indian Art in Raja Ravi Varma style combined with Modern Digital Devotional Art. Hyper-realistic oil painting aesthetic, glowing divine skin, incredibly detailed gold jewelry, soft cinematic lighting, magical atmosphere, vibrant and rich colors', 
    flag: '🇮🇳',
    flagCode: 'in'
  },
  { 
    id: 'china', 
    name: 'Chinese Art', 
    name_th: 'จีน (Chinese Art)',
    promptModifier: 'Chinese Traditional Gongbi and Ink Wash painting style, golden dragon motifs, Feng Shui aesthetics, Jade textures, Imperial Palace atmosphere', 
    flag: '🇨🇳',
    flagCode: 'cn'
  },
  { 
    id: 'japan', 
    name: 'Japanese Art', 
    name_th: 'ญี่ปุ่น (Japanese Art)',
    promptModifier: 'Japanese Traditional Ukiyo-e art style, woodblock print aesthetics, cherry blossom atmosphere, Zen minimalism, elegant Shinto shrine details', 
    flag: '🇯🇵',
    flagCode: 'jp'
  },
  { 
    id: 'nepal', 
    name: 'Tibetan Art', 
    name_th: 'ทิเบต (Tibetan Art)',
    promptModifier: 'Nepalese Traditional Thangka art style, highly detailed mandala backgrounds, Tibetan buddhism aesthetics, deep spiritual tones, Himalayan heritage', 
    flag: '🇳🇵',
    flagCode: 'np'
  },
];

export const STYLES: StyleOption[] = [
  {
    id: 'luckystation',
    name: 'Luckystation (Signature)',
    name_th: 'ลัคกี้สเตชั่น (เอกลักษณ์)',
    description: 'Unique, elegant, magical aura.',
    description_th: 'สวยหรู ดูแพง มีมนต์ขลัง',
    promptModifier: 'Luckystation Signature Style, The pinnacle of Divine Digital Art, Hyper-realistic 3D volumetric rendering, Glowing golden aura, Crystal-clear divine skin, Floating magical particles and Yantra scripts, Cinematic lighting with god rays, Dreamy pastel and gold color palette, Soft focus background, Masterpiece, 8k, Unreal Engine 5 style, High Gloss finish',
    icon: '💎',
    color: 'from-indigo-400 via-purple-500 to-pink-500'
  },
  {
    id: 'standard',
    name: 'Standard (Realistic)',
    name_th: 'มาตรฐาน (สมจริง)',
    description: 'Sharp focus, natural light, photorealistic.',
    description_th: 'ภาพถ่ายสมจริง แสงธรรมชาติ คมชัด',
    promptModifier: 'Hyper-realistic photography style, Natural lighting, 8k resolution, Highly detailed, Sharp focus, True to life colors, Cinematic composition, Depth of field, Photorealistic, Professional photography, Clear image, No special effects, No heavy artistic filter',
    icon: '📷',
    color: 'from-slate-500 to-zinc-600'
  },
  {
    id: 'sak-yant',
    name: 'Sak Yant (Tattoo)',
    name_th: 'ลายสักยันต์ (Sak Yant)',
    description: 'Black ink, sacred geometry, powerful.',
    description_th: 'ลายเส้นยันต์ไทย ขลัง ทรงพลัง',
    promptModifier: 'Traditional Thai Sak Yant tattoo design, Black ink on white background, 2D flat vector line art, Ancient Khmer script patterns, Unalome symbols, Geometric yantra structure, Tattoo flash style, No shading, High contrast, clean lines',
    icon: '✒️',
    color: 'from-slate-600 to-stone-800'
  },
  {
    id: 'sacred-deity',
    name: 'Golden Deity',
    name_th: 'เทพเจ้าทองคำ',
    description: 'Radiant skin, celestial aura, grand.',
    description_th: 'ผิวกายทองคำ เปล่งประกาย บารมีสูงส่ง',
    promptModifier: 'Sacred Deity seated on grand lotus throne, radiant golden aura, intricate jewelry, ethereal celestial background with clouds and light rays, Three-dimensional depth, soft volumetric lighting, hyper-realistic, 8k, masterpiece',
    icon: '✨',
    color: 'from-yellow-400 to-amber-600'
  },
  {
    id: 'chibi-pastel',
    name: 'Cute Chibi',
    name_th: 'เบบี้คิวท์ (Chibi)',
    description: 'Adorable, pastel colors, soft.',
    description_th: 'น่ารักปุ๊กปิ๊ก สีพาสเทล สดใส',
    promptModifier: 'Super cute Chibi style, Baby version, Big sparkling eyes, Soft pastel colors (Pink, Blue, Lavender), Flat Vector Illustration, Fluffy clouds background, Kawaii aesthetic, 2D art, dreamy atmosphere',
    icon: '👼',
    color: 'from-pink-300 to-purple-300'
  },
  {
    id: 'artmulet',
    name: 'Artmulet (Amulet)',
    name_th: 'อาร์ตมูเล็ต (วัตถุมงคล)',
    description: '3D sculpture, macro shot, sacred metal.',
    description_th: 'งานปั้น 3D เหมือนจริง เนื้อโลหะศักดิ์สิทธิ์',
    promptModifier: 'Macro photography of a sacred golden amulet, high-relief 3D sculpture, chiaroscuro studio lighting with rim light to reveal details, sharp details, depth of field, pure black background, sacred collectible, dimensional, realistic material rendering',
    icon: '🗿',
    color: 'from-slate-400 to-amber-200'
  },
  {
    id: 'thai-literature',
    name: 'Literature Art',
    name_th: 'จิตรกรรมไทย (Literature)',
    description: 'Classic mural style, intricate lines.',
    description_th: 'ลายเส้นจิตรกรรมฝาผนัง วิจิตรบรรจง',
    promptModifier: 'Thai literature art style, Ramakien mural painting aesthetics, delicate gold sharp lines, intricate ancient Thai patterns, exquisite craftsmanship, classic masterpiece, sharp details, high detailed',
    icon: '📜',
    color: 'from-pink-500 to-rose-700'
  },
  {
    id: 'mystic-forest',
    name: 'Mystic Forest',
    name_th: 'ป่าหิมพานต์ (Mystic)',
    description: 'Magical woods, glowing plants, deep.',
    description_th: 'ป่าลึกลับ พืชเรืองแสง มนตร์ตรา',
    promptModifier: 'Mystical forest setting, bioluminescent plants, ancient mystical trees, deep green and purple tones, magical fog, mysterious atmosphere, ultra-detailed nature',
    icon: '🌿',
    color: 'from-emerald-400 to-teal-700'
  },
  {
    id: 'dark-sorcery',
    name: 'Dark Sorcery',
    name_th: 'มนตร์ดำ (Dark Arts)',
    description: 'Black magic, shadows, glowing runes.',
    description_th: 'สายดาร์ก ดุดัน น่าเกรงขาม',
    promptModifier: 'Dark mystical arts, **Heavy floating Thai Sak Yant runes in gold and red**, black magic atmosphere, smoke and shadows, obsidian textures, dramatic rim lighting, ominous and powerful',
    icon: '🌑',
    color: 'from-purple-500 to-indigo-900'
  },
  {
    id: 'naga-king',
    name: 'Naga King',
    name_th: 'นาคราช (Naga)',
    description: 'Iridescent scales, underwater palace.',
    description_th: 'เกล็ดสีรุ้ง วังบาดาล ทรงอำนาจ',
    promptModifier: 'Majestic Naga King or Dragon, iridescent scales, flowing water elements, underwater palace background, glowing eyes, divine aura, mythical art style',
    icon: '🐉',
    color: 'from-cyan-400 to-blue-700'
  },
  {
    id: 'lucky-charm',
    name: 'Clay Charm',
    name_th: 'พระเนื้อดิน (Clay)',
    description: 'Ancient clay, gold leaf, macro.',
    description_th: 'เนื้อดินเผาโบราณ ปิดทอง ขลัง',
    promptModifier: 'Macro photography of a sacred amulet, cracked clay texture, gold leaf application, ancient inscriptions, soft bokeh background, spiritual energy',
    icon: '🔮',
    color: 'from-orange-400 to-red-600'
  }
];

export const MATERIALS: MaterialOption[] = [
  {
    id: 'gold',
    name: 'Solid Gold',
    name_th: 'ทองคำแท้ (Solid Gold)',
    promptModifier: 'Real Solid 24k Gold material, highly polished surface, intense specular highlights, realistic metallic reflection, heavy gold weight, expensive craftsmanship, not plastic, not yellow paint, authentic gold texture, divine wealth aesthetic',
    color: 'from-yellow-300 to-yellow-600'
  },
  {
    id: 'bronze',
    name: 'Aged Bronze',
    name_th: 'สัมฤทธิ์โบราณ (Bronze)',
    promptModifier: 'Dark Bronze material with Green Patina (verdigris) in crevices, ancient weathered metal, sacred oxidized texture, antique finish',
    color: 'from-amber-700 to-stone-800'
  },
  {
    id: 'silver',
    name: 'Sterling Silver',
    name_th: 'เงินแท้ (Silver)',
    promptModifier: 'Polished Sterling Silver, mystical cool tone, intricate engraving details, moonlight reflection',
    color: 'from-slate-300 to-slate-500'
  },
  {
    id: 'jade',
    name: 'Green Jade',
    name_th: 'หยกเขียว (Jade)',
    promptModifier: 'Translucent Green Jade, sub-surface scattering, glowing from within, smooth polished stone, serenity',
    color: 'from-emerald-400 to-emerald-700'
  },
  {
    id: 'black-metal',
    name: 'Black Metal',
    name_th: 'นิลกาฬ (Black Metal)',
    promptModifier: 'Matte Black Metal, Obsidian, gold leaf accents, powerful dark aura, aggressive styling',
    color: 'from-gray-700 to-black'
  },
  {
    id: 'mixed',
    name: '3K (Mixed)',
    name_th: 'สามกษัตริย์ (3K)',
    promptModifier: 'Mixed Gold Silver and Rose Gold (3 Kings), tri-color metallic, intricate luxury detail',
    color: 'from-yellow-200 via-pink-300 to-slate-300'
  }
];

export const ASPECT_RATIOS = [
  { label: 'Wallpaper (9:16)', value: '9:16', visualClass: 'w-3.5 h-6' }
];
