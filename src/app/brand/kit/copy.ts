/*
 * Slogans and AI prompts for the Brand tab. Same content as brand-kit/index.html and
 * brand-kit/AI-PROMPTS.md; update both when a line changes.
 */
export const STYLE_LINE = "warm sunlit palette of saffron orange (#EA580C), lemon yellow (#F5D83B), fresh leaf green (#1F7A3A) and cream (#FFF8E7), clean commercial photography, natural Indian skin tones, realistic, high detail, no text, no logos, no watermark";
export const NEGATIVE = "text, letters, logo, watermark, extra fingers, distorted hands, plastic skin, oversaturated, cartoonish, western setting";

export const SLOGANS: Record<string, [string, string][]> = {
  Hinglish: [["Jo paseene mein gaya, woh wapas.",""],["Pyaas se pehle, Taazu.",""],["Garmi ka desi jawab.",""],["Nimbu, namak, aur thoda science.",""],["Amdavad ka apna electrolyte.",""]],
  Gujarati: [["ગરમીમાં પણ તાજું.","Garmi ma pan taazu · fresh, even in the heat"],["અમદાવાદનું પોતાનું.","Amdavad nu potanu · Ahmedabad's own"],["પરસેવો ગયો? તાજું લો.","Parsevo gayo? Taazu lo · sweat gone? have Taazu"]],
  English: [["More than water.",""],["Put back what the heat takes.",""],["Fresh, even at 44°C.",""]],
  "Campaign lines": [["Garba ki raat lambi hai.","Navratri"],["Last over tak taazu.","Box cricket"],["Set ke beech, ek sip Taazu.","Gym"],["Kaam lamba, dhoop tez. Taazu saath.","Site workers"]],
};

export type Prompt = { t: string; u: string; ar: string; p: string; ref?: boolean; noStyle?: boolean };
export const PROMPTS: { g: string; d: string; items: Prompt[] }[] = [
  {g:"Product shots",d:"Bottle aur ingredients ki photos: website, menu card, WhatsApp catalogue ke liye.",items:[
    {t:"A1 · Hero bottle",u:"Catalogue, launch post",ar:"4:5",p:"Studio product photo of a small 250 ml clear PET bottle filled with a pale, slightly cloudy lemon-yellow drink, bright orange cap, plain cream wrap-around label, cold condensation droplets on the bottle, standing on crushed ice with fresh lemon halves, a few mint leaves and pink rock salt crystals, solid saffron-orange background, crisp hard summer light with a sharp shadow"},
    {t:"A2 · Ingredients flat lay",u:"\"Andar kya hai\" post",ar:"1:1",p:"Top-down flat lay on cream linen: a glass of cloudy chilled nimbu-pani, sliced lemons, a small brass bowl of pink rock salt, roasted cumin seeds, mint leaves, ice cubes, soft morning sunlight, Indian kitchen feel, lots of empty space on the left for text"},
    {t:"A3 · Asli bottle scene mein",u:"ChatGPT / Gemini: pehle bottle photo upload karo",ar:"4:5",ref:true,p:"Use the attached bottle exactly as it is. Do not change its shape, label, colours or text. Place it on a wooden table at a box-cricket turf at night, floodlights behind, cold condensation on the bottle, shallow depth of field, players blurred in the background. Photorealistic."},
    {t:"A4 · Gym fridge",u:"Retailer pitch, post",ar:"4:5",p:"Front view of a small glass-door beverage cooler at a gym reception in India, filled with rows of small bottles with orange caps and pale yellow drink, cool light inside the fridge, warm light outside, a hand reaching for one bottle"},
  ]},
  {g:"Lifestyle · awareness",d:"Inke upar ready creatives wala text lagao, ya naye posts banao.",items:[
    {t:"B1 · Box cricket raat mein",u:"\"Match ke baad sirf paani?\"",ar:"4:5",p:"Young Indian men in casual sportswear playing box cricket on an illuminated rooftop turf in Ahmedabad at night, one player taking a break and drinking from a small bottle, sweat on his forehead, floodlights, candid cinematic sports photography"},
    {t:"B2 · Gym break",u:"Gym partners ke posts",ar:"4:5",p:"Indian woman in her twenties resting between sets at a neighbourhood gym, towel on her shoulder, drinking from a small chilled bottle, light sweat, warm tungsten light, candid documentary style, space at the top for text"},
    {t:"B3 · Sabarmati Riverfront runners",u:"Running clubs, marathon",ar:"4:5",p:"Group of Indian runners on the Sabarmati Riverfront promenade in Ahmedabad at sunrise, one runner paused and drinking, golden light, light heat haze over the river, wide shot, energetic and hopeful"},
    {t:"B4 · Site worker break",u:"Hindi poster, contractors",ar:"4:5",p:"Construction worker in Ahmedabad sitting in the shade of a building under construction during a midday break, wearing a yellow helmet and reflective vest, drinking from a small bottle, bright harsh sun outside the shade, dignified documentary portrait, respectful, eye level"},
    {t:"B5 · Delivery rider",u:"Summer campaign",ar:"4:5",p:"Food delivery rider on a scooter parked under a neem tree on a hot Ahmedabad afternoon, helmet on the mirror, drinking from a small chilled bottle, heat shimmer on the road behind, candid street photography"},
    {t:"B6 · Navratri garba",u:"Navratri station post",ar:"4:5",p:"Garba dancers in colourful chaniya choli and kediyu dancing in circles at a lit garba ground in Gujarat at night, motion blur of swirling skirts, dandiya sticks, string lights; in the foreground a small table with chilled drinks in paper cups on ice"},
    {t:"B7 · Amdavad ki garmi",u:"44°C post ka background",ar:"4:5",p:"Narrow pol street in old Ahmedabad at noon in peak summer, blazing sun, heat shimmer, carved wooden houses, strong short shadows, almost empty street, sun flare in the top right, vivid orange tones, lots of empty sky for text"},
    {t:"B8 · Paseena macro",u:"\"Paseena sirf paani nahi\" background",ar:"4:5",p:"Extreme close-up macro of sweat droplets on a sun-tanned forearm, fine white salt traces where the sweat has dried, shallow depth of field, warm orange backlight"},
  ]},
  {g:"Illustration aur mascot",d:"Fact carousels, stickers aur packaging pattern ke liye.",items:[
    {t:"C1 · Mascot \"Boondu\"",u:"Stickers, kids-friendly posts",ar:"1:1",p:"Flat vector mascot: a cheerful water-drop character with a lemon-slice belly, small arms giving a thumbs up, bold rounded shapes, thick clean outlines, saffron orange drop, lemon-yellow slice, cream highlights, white background, sticker style"},
    {t:"C2 · Fact carousel illustration",u:"Jo log nahi jaante series",ar:"4:5",p:"Flat vector infographic illustration of a person jogging with small drops of sweat leaving the body, each drop containing a tiny salt crystal, simple rounded shapes, orange, lemon yellow, green and cream palette, plenty of empty space for text, no text"},
    {t:"C3 · Pattern",u:"Cup sleeves, packaging, banners",ar:"1:1",p:"Seamless repeating pattern of lemon slices, water drops and small suns, flat vector, saffron orange, lemon yellow and leaf green on a cream background, playful but tidy spacing"},
  ]},
  {g:"Mockups",d:"Ready creatives ko inke andar lagao, taaki post mein asli jaisa dikhe.",items:[
    {t:"D1 · Counter standee",u:"A4 poster dikhane ke liye",ar:"4:5",p:"Photorealistic mockup of a blank A4 acrylic counter standee on a gym reception desk next to a small drinks cooler, soft daylight, the standee faces the camera straight on so a poster can be placed on it"},
    {t:"D2 · Turf wall poster",u:"Retailer pitch",ar:"4:5",p:"Photorealistic mockup of a blank A3 poster taped on a painted wall beside a box-cricket turf entrance at night, floodlight spill, straight-on view"},
    {t:"D3 · Phone mockup",u:"Instagram grid preview",ar:"9:16",p:"Photorealistic phone mockup held in a hand outdoors in bright sunlight, screen blank and facing the camera, Indian street background softly blurred"},
  ]},
  {g:"Logo exploration",d:"Sirf ideas ke liye. Final logo clean vector (logos/ folder ki SVG) hi rahe, aur trademark check ke baad.",items:[
    {t:"E1 · Drop + lemon",u:"Concept A ke variations",ar:"1:1",noStyle:true,p:"Minimal flat vector logo mark: a water drop containing a lemon slice, saffron orange and lemon yellow, geometric, bold, works at small sizes, centered on white, no text"},
    {t:"E2 · t-wave app icon",u:"Concept C ke variations",ar:"1:1",noStyle:true,p:"Minimal flat vector logo mark: a lowercase letter t whose crossbar is a wave, with a small yellow drop beside it, inside an orange rounded square app icon, no other text"},
    {t:"E3 · Badge",u:"Seal ke variations",ar:"1:1",noStyle:true,p:"Circular badge logo for a beverage brand from Ahmedabad: a drop and a sun inside a ring, flat vector, orange and cream, vintage stamp style, leave the ring empty (no text)"},
  ]},
  {g:"Video · Reels",d:"Veo, Kling, Runway ya Sora. 9:16, 5 se 8 second.",items:[
    {t:"F1 · Lemon splash",u:"Reel opener",ar:"9:16 · 5s",p:"Slow motion: a lemon slice and a pinch of pink rock salt drop into a glass of cold pale-yellow drink, splash and bubbles, bright saffron-orange backdrop, crisp studio light"},
    {t:"F2 · Garmi se taazu",u:"Summer reel",ar:"9:16 · 8s",p:"Hot Ahmedabad street at noon with heat shimmer, camera pushes in on a young man wiping sweat, he opens a cold small bottle with an orange cap, condensation drips, he smiles, warm colours turning slightly cooler"},
    {t:"F3 · Garba break",u:"Navratri reel",ar:"9:16 · 6s",p:"Night garba ground, dancers spinning in colourful clothes, cut to a dancer stepping out of the circle, laughing, taking a cup of chilled drink from a stall, festive lights, handheld camera"},
  ]},
];

