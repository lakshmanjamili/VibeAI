export interface PromptTemplate {
  id: string;
  category: string;
  model: string;
  title: string;
  description: string;
  prompt: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  expectedOutput?: string;
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // ========== GEMINI CHAT TEMPLATES ==========
  {
    id: 'gemini_chat_1',
    category: 'chat',
    model: 'gemini_chat',
    title: 'Professional Email Writer',
    description: 'Generate professional emails for various business contexts',
    prompt: `You are a professional email writer. Help me write a [type of email] about [topic].

Context: [Brief context about the situation]
Recipient: [Who will receive this email]
Tone: [Formal/Semi-formal/Friendly]
Key Points to Include:
- [Point 1]
- [Point 2]
- [Point 3]

Please write a clear, concise email that is professional yet approachable.`,
    tags: ['business', 'email', 'professional', 'communication'],
    difficulty: 'beginner',
    expectedOutput: 'A well-structured professional email',
  },
  {
    id: 'gemini_chat_2',
    category: 'chat',
    model: 'gemini_chat',
    title: 'Code Review Assistant',
    description: 'Get detailed code reviews with suggestions for improvement',
    prompt: `Please review the following code and provide detailed feedback:

\`\`\`[language]
[Your code here]
\`\`\`

Focus on:
1. Code quality and readability
2. Performance optimizations
3. Security considerations
4. Best practices for [language/framework]
5. Potential bugs or edge cases
6. Suggestions for refactoring

Provide specific examples of improvements where applicable.`,
    tags: ['coding', 'development', 'review', 'programming'],
    difficulty: 'intermediate',
    expectedOutput: 'Detailed code review with actionable suggestions',
  },
  {
    id: 'gemini_chat_3',
    category: 'chat',
    model: 'gemini_chat',
    title: 'Research Paper Summarizer',
    description: 'Summarize complex research papers into digestible insights',
    prompt: `Please analyze and summarize this research paper/topic:

Title: [Paper title or topic]
Field: [Academic field]
Key Concepts: [Main concepts to focus on]

Provide:
1. Executive Summary (2-3 sentences)
2. Main Findings/Arguments
3. Methodology Used
4. Implications and Applications
5. Limitations and Future Research
6. Key Takeaways for [specific audience]

Make it accessible to someone with [basic/intermediate/advanced] knowledge in this field.`,
    tags: ['research', 'academic', 'summary', 'education'],
    difficulty: 'advanced',
    expectedOutput: 'Comprehensive research summary with key insights',
  },
  {
    id: 'gemini_chat_4',
    category: 'chat',
    model: 'gemini_chat',
    title: 'Creative Story Generator',
    description: 'Generate engaging stories with rich narratives',
    prompt: `Create an original story with these elements:

Genre: [Fantasy/Sci-Fi/Mystery/Romance/Thriller]
Setting: [Time period and location]
Main Character: [Brief description]
Conflict: [Central problem or challenge]
Mood: [Dark/Light-hearted/Suspenseful/Whimsical]
Length: [Flash fiction/Short story/Chapter]

Additional Requirements:
- Include unexpected plot twist
- Develop compelling character arc
- Use vivid sensory descriptions
- Create memorable dialogue

Begin the story with an attention-grabbing opening.`,
    tags: ['creative', 'storytelling', 'fiction', 'writing'],
    difficulty: 'intermediate',
    expectedOutput: 'An engaging original story',
  },
  {
    id: 'gemini_chat_5',
    category: 'chat',
    model: 'gemini_chat',
    title: 'Marketing Campaign Strategist',
    description: 'Develop comprehensive marketing strategies',
    prompt: `Develop a marketing campaign strategy for:

Product/Service: [Description]
Target Audience: [Demographics and psychographics]
Budget Range: [Budget constraints]
Duration: [Campaign timeline]
Goals: [Specific objectives]

Please provide:
1. Campaign Theme and Key Messages
2. Channel Strategy (Social, Email, Content, Paid)
3. Content Calendar Overview
4. KPIs and Success Metrics
5. Creative Concepts and Ideas
6. Potential Challenges and Solutions
7. Budget Allocation Recommendations

Focus on [innovative/cost-effective/viral] approaches.`,
    tags: ['marketing', 'business', 'strategy', 'campaign'],
    difficulty: 'advanced',
    expectedOutput: 'Complete marketing campaign strategy',
  },

  // ========== NANO BANANA IMAGE TEMPLATES ==========
  {
    id: 'nano_banana_1',
    category: 'image',
    model: 'nano_banana',
    title: 'Whimsical Character Designer',
    description: 'Create playful, cartoon-style characters',
    prompt: `A cute and whimsical [animal/creature] character with:
- [Color] fur/skin with [pattern/texture]
- Big expressive [color] eyes
- Wearing [clothing/accessory]
- [Emotion/expression] facial expression
- In a [setting/background]
- Cartoon style, vibrant colors, soft lighting
- Pixar-inspired 3D rendering
- 4K quality, detailed textures`,
    tags: ['character', 'cartoon', 'cute', 'animation'],
    difficulty: 'beginner',
    expectedOutput: 'A charming cartoon character illustration',
  },
  {
    id: 'nano_banana_2',
    category: 'image',
    model: 'nano_banana',
    title: 'Fantasy Landscape Creator',
    description: 'Generate magical fantasy environments',
    prompt: `A breathtaking fantasy landscape featuring:
- [Floating islands/Crystal forests/Magic mountains]
- [Time of day] lighting with [color] sky
- [Magical element] scattered throughout
- [Architecture style] buildings/structures
- Ethereal [weather effect]
- Foreground: [specific detail]
- Background: [distant element]
- Studio Ghibli inspired art style
- Dreamy atmosphere, rich colors
- Ultra detailed, 8K resolution`,
    tags: ['landscape', 'fantasy', 'environment', 'magical'],
    difficulty: 'intermediate',
    expectedOutput: 'A stunning fantasy landscape',
  },
  {
    id: 'nano_banana_3',
    category: 'image',
    model: 'nano_banana',
    title: 'Retro Poster Designer',
    description: 'Create vintage-style posters and advertisements',
    prompt: `Design a retro [1950s/60s/70s/80s] style poster for:
- Title: "[Your text here]" in bold vintage typography
- Theme: [Product/Event/Movie/Band]
- Color palette: [Specific colors]
- Include [geometric shapes/patterns]
- Feature [main visual element]
- [Art movement] inspired design
- Aged/distressed texture overlay
- High contrast, bold composition
- Print-ready quality`,
    tags: ['poster', 'retro', 'vintage', 'design'],
    difficulty: 'intermediate',
    expectedOutput: 'A stylish retro poster design',
  },

  // ========== IMAGEN 4.0 TEMPLATES ==========
  {
    id: 'imagen_1',
    category: 'image',
    model: 'imagen',
    title: 'Photorealistic Portrait Master',
    description: 'Generate hyper-realistic human portraits',
    prompt: `Photorealistic portrait of a [age] year old [gender] with:
- [Ethnicity] features
- [Hair color and style] hair
- [Eye color] eyes with [expression]
- Wearing [specific clothing]
- [Lighting setup]: key light from [direction]
- Background: [blurred/sharp] [setting]
- Shot with 85mm lens, f/1.4 aperture
- Natural skin texture, subtle makeup
- Professional photography, magazine quality
- 8K resolution, RAW format style`,
    tags: ['portrait', 'photorealistic', 'photography', 'professional'],
    difficulty: 'advanced',
    expectedOutput: 'A stunning photorealistic portrait',
  },
  {
    id: 'imagen_2',
    category: 'image',
    model: 'imagen',
    title: 'Product Photography Pro',
    description: 'Commercial-quality product shots',
    prompt: `Professional product photography of [product]:
- Placed on [surface/background]
- [Number] point lighting setup
- [Color] seamless backdrop
- Hero angle showing [key feature]
- Props: [complementary items]
- Reflections on [surface type]
- Focus stacking for sharpness
- Commercial studio lighting
- Clean, minimal composition
- E-commerce ready, white background option`,
    tags: ['product', 'commercial', 'photography', 'ecommerce'],
    difficulty: 'intermediate',
    expectedOutput: 'Professional product photography',
  },
  {
    id: 'imagen_3',
    category: 'image',
    model: 'imagen',
    title: 'Architectural Visualization',
    description: 'Create realistic architectural renders',
    prompt: `Photorealistic architectural visualization of:
- Building Type: [Modern house/Skyscraper/Historic building]
- Style: [Minimalist/Brutalist/Neo-classical/Futuristic]
- Materials: [Glass/Concrete/Wood/Steel]
- Time: [Golden hour/Blue hour/Midday]
- Weather: [Clear/Overcast/Rainy]
- Surrounding: [Urban/Nature/Waterfront]
- Include: [People/Cars/Landscape] for scale
- Camera: Wide angle exterior shot
- Ray-traced lighting, accurate shadows
- Architectural photography style`,
    tags: ['architecture', 'visualization', 'building', 'realistic'],
    difficulty: 'advanced',
    expectedOutput: 'Photorealistic architectural render',
  },
  {
    id: 'imagen_4',
    category: 'image',
    model: 'imagen',
    title: 'Food Photography Specialist',
    description: 'Mouth-watering food photography',
    prompt: `Appetizing food photography of [dish name]:
- Plating: [Style] presentation on [type of plate]
- Garnish: [Fresh herbs/Sauce drizzle/Edible flowers]
- Lighting: Natural window light from [angle]
- Props: [Utensils/Napkin/Ingredients]
- Background: [Rustic wood/Marble/Minimal]
- Shooting angle: [45°/Top-down/Eye-level]
- Depth of field: Shallow, background bokeh
- Style: [Editorial/Instagram/Fine dining]
- Steam/freshness indicators visible
- Color grading: Warm and inviting`,
    tags: ['food', 'photography', 'culinary', 'commercial'],
    difficulty: 'intermediate',
    expectedOutput: 'Appetizing food photography',
  },

  // ========== GROK IMAGE TEMPLATES ==========
  {
    id: 'grok_1',
    category: 'image',
    model: 'grok',
    title: 'Cyberpunk City Generator',
    description: 'Create futuristic cyberpunk cityscapes',
    prompt: `Cyberpunk cityscape at [night/dusk] featuring:
- Towering skyscrapers with [neon colors] lights
- [Rain-slicked/Foggy] streets below
- Flying vehicles trails in the sky
- Holographic advertisements in [language]
- Street level: [Markets/Crowds/Empty]
- Architecture: [Asian/Western/Mixed] influenced
- Mood: [Dystopian/Vibrant/Noir]
- Color palette: [Colors] with neon accents
- Blade Runner meets [other reference]
- Cinematic composition, high detail`,
    tags: ['cyberpunk', 'futuristic', 'cityscape', 'scifi'],
    difficulty: 'intermediate',
    expectedOutput: 'A detailed cyberpunk cityscape',
  },
  {
    id: 'grok_2',
    category: 'image',
    model: 'grok',
    title: 'Abstract Art Generator',
    description: 'Create unique abstract compositions',
    prompt: `Abstract artwork exploring [concept/emotion]:
- Primary colors: [Color palette]
- Composition: [Geometric/Organic/Mixed]
- Texture: [Smooth/Rough/Layered]
- Movement: [Dynamic/Static/Flowing]
- Inspired by [Artist/Movement]
- Medium effect: [Oil/Watercolor/Digital]
- Elements: [Shapes/Lines/Patterns]
- Balance: [Symmetrical/Asymmetrical]
- Depth: [Flat/3D/Layered]
- Gallery quality, high resolution`,
    tags: ['abstract', 'art', 'creative', 'artistic'],
    difficulty: 'beginner',
    expectedOutput: 'A striking abstract composition',
  },
  {
    id: 'grok_3',
    category: 'image',
    model: 'grok',
    title: 'Concept Art Designer',
    description: 'Professional concept art for games and films',
    prompt: `Concept art for [game/film] showing:
- Subject: [Character/Vehicle/Environment/Weapon]
- Genre: [Sci-fi/Fantasy/Post-apocalyptic]
- Design iteration: [Initial/Refined/Final]
- Multiple angles/views included
- Annotated with [materials/scale/function]
- Color scheme: [Palette description]
- Influence: [Reference/Inspiration]
- Technical details visible
- Professional presentation
- Industry-standard quality`,
    tags: ['concept', 'design', 'gaming', 'film'],
    difficulty: 'advanced',
    expectedOutput: 'Professional concept art sheet',
  },
  {
    id: 'grok_4',
    category: 'image',
    model: 'grok',
    title: 'Fashion Design Illustrator',
    description: 'Create fashion illustrations and designs',
    prompt: `Fashion illustration of [garment type]:
- Season: [Spring/Summer/Fall/Winter] collection
- Style: [Avant-garde/Classic/Streetwear/Haute couture]
- Fabric: [Material type] with [pattern/texture]
- Color story: [Color palette]
- Model pose: [Standing/Walking/Dynamic]
- Rendering style: [Sketch/Painted/Digital]
- Details: [Buttons/Zippers/Embellishments]
- Accessories: [Listed items]
- Fashion week presentation quality
- Editorial illustration style`,
    tags: ['fashion', 'design', 'illustration', 'style'],
    difficulty: 'intermediate',
    expectedOutput: 'Elegant fashion illustration',
  },

  // ========== VEO 2.0 VIDEO TEMPLATES ==========
  {
    id: 'veo_1',
    category: 'video',
    model: 'veo',
    title: 'Cinematic Drone Shot',
    description: 'Epic aerial cinematography',
    prompt: `Cinematic drone footage of [location]:
- Movement: [Orbit/Flythrough/Reveal/Pull-back]
- Height: Starting at [X]ft, ending at [Y]ft
- Speed: [Slow/Medium/Fast] motion
- Time of day: [Golden hour/Blue hour/Sunset]
- Weather: [Clear/Dramatic clouds/Fog]
- Focus point: [Landmark/Person/Vehicle]
- Camera: Smooth gimbal movement
- Color grade: [Cinematic/Natural/Moody]
- Duration: [5-15] seconds
- Resolution: 4K, 24fps cinematic`,
    tags: ['drone', 'cinematic', 'aerial', 'landscape'],
    difficulty: 'intermediate',
    expectedOutput: 'Epic drone cinematography',
  },
  {
    id: 'veo_2',
    category: 'video',
    model: 'veo',
    title: 'Product Showcase Video',
    description: 'Dynamic product demonstration',
    prompt: `Product showcase video of [product]:
- Opening: [Dramatic reveal/Slow zoom]
- Shots: 360° rotation, detail close-ups
- Features highlighted: [List key features]
- Background: [Clean white/Gradient/Environmental]
- Lighting: Studio 3-point setup
- Motion: [Smooth rotation/Stop-motion style]
- Text overlays: [Feature callouts]
- Music style: [Upbeat/Corporate/Minimal]
- Duration: 15-30 seconds
- Export: Social media optimized`,
    tags: ['product', 'commercial', 'marketing', 'showcase'],
    difficulty: 'intermediate',
    expectedOutput: 'Professional product video',
  },
  {
    id: 'veo_3',
    category: 'video',
    model: 'veo',
    title: 'Time-lapse Creator',
    description: 'Stunning time-lapse sequences',
    prompt: `Time-lapse video of [subject]:
- Duration: [Real time] compressed to [X] seconds
- Subject: [Sunrise/Construction/Traffic/Nature]
- Camera position: [Fixed/Sliding/Panning]
- Interval: Photo every [X] seconds
- Transition: [Day to night/Season change]
- Movement: [Clouds/Shadows/People]
- Post-processing: [Smooth/Hyperlapse/Traditional]
- Music: [Ambient/Energetic/None]
- Color: [Natural/Enhanced/Stylized]
- Output: 4K, 60fps smooth playback`,
    tags: ['timelapse', 'cinematic', 'nature', 'urban'],
    difficulty: 'beginner',
    expectedOutput: 'Mesmerizing time-lapse video',
  },
  {
    id: 'veo_4',
    category: 'video',
    model: 'veo',
    title: 'Motion Graphics Animator',
    description: 'Modern motion graphics and animations',
    prompt: `Motion graphics video featuring:
- Style: [Flat design/3D/Isometric/Line art]
- Elements: [Icons/Text/Shapes/Characters]
- Transitions: [Smooth/Bouncy/Glitch/Morph]
- Color scheme: [Brand colors/Gradient/Monochrome]
- Animation: [Kinetic typography/Infographic/Logo reveal]
- Timing: [Fast-paced/Rhythmic/Slow]
- Sound design: [Whooshes/Clicks/Ambient]
- Purpose: [Explainer/Intro/Social media]
- Duration: [5-60] seconds
- Format: Square/Vertical/Horizontal`,
    tags: ['motion', 'graphics', 'animation', 'design'],
    difficulty: 'advanced',
    expectedOutput: 'Dynamic motion graphics animation',
  },
  {
    id: 'veo_5',
    category: 'video',
    model: 'veo',
    title: 'Nature Documentary Shot',
    description: 'Wildlife and nature cinematography',
    prompt: `Nature documentary footage of [subject]:
- Subject: [Animal/Plant/Ecosystem/Weather]
- Behavior captured: [Hunting/Migration/Blooming]
- Camera technique: [Macro/Telephoto/Wide]
- Movement: [Tracking/Static/Handheld]
- Environment: [Forest/Ocean/Desert/Mountain]
- Lighting: [Natural/Golden hour/Overcast]
- Narration style: [David Attenborough-esque]
- Special technique: [Slow-motion/Time-lapse]
- Duration: 30-60 seconds
- BBC Earth quality standards`,
    tags: ['nature', 'wildlife', 'documentary', 'cinematic'],
    difficulty: 'advanced',
    expectedOutput: 'Professional nature footage',
  },
];

export function getTemplatesByModel(modelId: string): PromptTemplate[] {
  return PROMPT_TEMPLATES.filter((template) => template.model === modelId);
}

export function getTemplatesByCategory(category: string): PromptTemplate[] {
  return PROMPT_TEMPLATES.filter((template) => template.category === category);
}

export function searchTemplates(query: string): PromptTemplate[] {
  const lowerQuery = query.toLowerCase();
  return PROMPT_TEMPLATES.filter(
    (template) =>
      template.title.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      template.prompt.toLowerCase().includes(lowerQuery)
  );
}

export function getPopularTemplates(limit: number = 5): PromptTemplate[] {
  // In a real app, this would be based on usage analytics
  // For now, return a curated selection
  const popularIds = [
    'gemini_chat_1', // Email Writer
    'nano_banana_1', // Character Designer
    'imagen_1', // Portrait Master
    'grok_1', // Cyberpunk City
    'veo_1', // Cinematic Drone
  ];

  return PROMPT_TEMPLATES.filter((template) => popularIds.includes(template.id)).slice(0, limit);
}

export function getBeginnerTemplates(): PromptTemplate[] {
  return PROMPT_TEMPLATES.filter((template) => template.difficulty === 'beginner');
}
