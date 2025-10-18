'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Camera,
  Type,
  Package,
  Palette,
  Wand2,
  Image as ImageIcon,
  Info,
  ChevronRight
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface NanoBananaSettingsProps {
  settings: any;
  onSettingsChange: (settings: any) => void;
  onImageUpload?: (image: string) => void;
}

// Template categories based on Google Gemini documentation
const GEMINI_TEMPLATES = [
  {
    id: 'photorealistic',
    name: 'Photorealistic Scenes',
    icon: Camera,
    color: 'from-blue-500 to-cyan-500',
    description: 'Professional photography with camera details and lighting',
    template: 'A photorealistic [shot type] of [subject], [action or expression], set in [environment]. The scene is illuminated by [lighting description], creating a [mood] atmosphere. Captured with a [camera/lens details], emphasizing [key textures and details].',
    settings: { temperature: 0.4, aspectRatio: '16:9' },
    examples: [
      {
        title: 'Mountain Lake at Golden Hour',
        prompt: 'A photorealistic wide shot of a serene mountain lake at golden hour, with crystal-clear water reflecting the surrounding pine forests and snow-capped peaks. The scene is illuminated by warm, golden sunlight filtering through scattered clouds, creating a peaceful atmosphere. Captured with a Canon 5D Mark IV, 24-70mm lens, emphasizing the mirror-like reflection and rich textures of the landscape.',
        settings: { temperature: 0.5, aspectRatio: '16:9' }
      },
      {
        title: 'Urban Street at Night',
        prompt: 'A photorealistic street-level shot of a bustling city intersection at night, with neon signs reflecting on wet pavement. The scene is illuminated by colorful neon lights and street lamps, creating a vibrant cinematic atmosphere. Captured with a Sony A7III, 35mm lens f/1.4, emphasizing the bokeh and light trails from passing cars.',
        settings: { temperature: 0.4, aspectRatio: '16:9' }
      },
      {
        title: 'Portrait in Natural Light',
        prompt: 'A photorealistic close-up portrait of a confident woman in her 30s, natural smile, set in a modern office with floor-to-ceiling windows. The scene is illuminated by soft window light from the side, creating a professional atmosphere. Captured with an 85mm lens at f/1.8, emphasizing sharp focus on the eyes and smooth skin tones.',
        settings: { temperature: 0.3, aspectRatio: '3:4' }
      }
    ]
  },
  {
    id: 'stickers',
    name: 'Stylized Stickers & Icons',
    icon: Sparkles,
    color: 'from-pink-500 to-purple-500',
    description: 'Cute stickers, icons, and design assets with transparent backgrounds',
    template: 'A [style] sticker of a [subject], featuring [key characteristics] and a [color palette]. The design should have [line style] and [shading style]. The background must be transparent.',
    settings: { temperature: 0.8, aspectRatio: '1:1' },
    examples: [
      {
        title: 'Kawaii Space Cat',
        prompt: 'A kawaii-style sticker of a happy orange cat astronaut floating in space, featuring big sparkling eyes, soft pastel colors with pink and purple nebulas in the background. The design should have thick black outlines and cell shading. The background must be transparent.',
        settings: { temperature: 0.85, aspectRatio: '1:1' }
      },
      {
        title: 'Minimalist App Icon',
        prompt: 'A flat design sticker of a coffee cup icon, featuring simple geometric shapes and a warm brown gradient. The design should have clean lines and no shadows. The background must be transparent.',
        settings: { temperature: 0.3, aspectRatio: '1:1' }
      },
      {
        title: 'Chibi Character',
        prompt: 'An anime chibi-style sticker of a cute robot with oversized head, featuring bright LED eyes, metallic silver and blue colors, holding a wrench. The design should have thick outlines and cel-shaded colors. The background must be transparent.',
        settings: { temperature: 0.9, aspectRatio: '1:1' }
      }
    ]
  },
  {
    id: 'text-in-images',
    name: 'Text in Images (Logos & Posters)',
    icon: Type,
    color: 'from-orange-500 to-red-500',
    description: 'Logos, posters, and designs with accurate text rendering',
    template: 'Create a [image type] for [brand/concept] with the text "[text to render]" in a [font style]. The design should be [style description], with a [color scheme].',
    settings: { temperature: 0.3, aspectRatio: '1:1' },
    examples: [
      {
        title: 'Modern Coffee Shop Logo',
        prompt: 'Create a modern, minimalist logo for a coffee shop called "The Daily Grind" with the text "THE DAILY GRIND" in a clean sans-serif font. The design should be simple and professional, with a coffee cup icon integrated into the letter "G", using a warm brown and cream color palette.',
        settings: { temperature: 0.2, aspectRatio: '1:1' }
      },
      {
        title: 'Vintage Travel Poster',
        prompt: 'Create a vintage travel poster with the text "VISIT TOKYO" in bold, retro typography at the top. The design should feature Mount Fuji in the background with cherry blossoms framing the scene, using a limited color palette of red, pink, white, and navy blue in a 1950s poster style.',
        settings: { temperature: 0.4, aspectRatio: '2:3' }
      },
      {
        title: 'Tech Startup Logo',
        prompt: 'Create a sleek tech logo with the text "NEXUS AI" in a futuristic font. The design should be modern and minimalist, featuring geometric shapes and neural network patterns, with a gradient from electric blue to purple on a dark background.',
        settings: { temperature: 0.25, aspectRatio: '1:1' }
      }
    ]
  },
  {
    id: 'product',
    name: 'Product Photography',
    icon: Package,
    color: 'from-green-500 to-emerald-500',
    description: 'Commercial product shots for e-commerce and marketing',
    template: 'A high-resolution, studio-lit product photograph of a [product description] on a [background surface/description]. The lighting is a [lighting setup] to [lighting purpose]. The camera angle is a [angle type] to showcase [specific feature]. Ultra-realistic, with sharp focus on [key detail].',
    settings: { temperature: 0.2, aspectRatio: '1:1' },
    examples: [
      {
        title: 'Luxury Watch',
        prompt: 'A high-resolution, studio-lit product photograph of a luxury chronograph watch with black leather strap on black velvet. The lighting is a three-point softbox setup to eliminate harsh shadows and highlight the metallic finish. The camera angle is slightly elevated at 30 degrees to showcase the watch face and crown. Ultra-realistic, with sharp focus on the crystal and dial details.',
        settings: { temperature: 0.15, aspectRatio: '1:1' }
      },
      {
        title: 'Skincare Product',
        prompt: 'A high-resolution, studio-lit product photograph of a minimalist white skincare bottle with gold accents on a marble surface with water droplets. The lighting is soft diffused light from above to create a clean, fresh look. The camera angle is eye-level to showcase the label. Ultra-realistic, with sharp focus on the product label and texture.',
        settings: { temperature: 0.2, aspectRatio: '3:4' }
      },
      {
        title: 'Sneaker Shot',
        prompt: 'A high-resolution, studio-lit product photograph of a white athletic sneaker floating against a pure white background. The lighting is even studio lighting to prevent shadows. The camera angle is a three-quarter view to showcase the design and sole. Ultra-realistic, with sharp focus on the material texture and stitching.',
        settings: { temperature: 0.2, aspectRatio: '1:1' }
      }
    ]
  },
  {
    id: 'minimalist',
    name: 'Minimalist & Negative Space',
    icon: Palette,
    color: 'from-purple-500 to-pink-500',
    description: 'Clean designs with lots of empty space for text overlay',
    template: 'A minimalist composition featuring a single [subject] positioned in the [position] of the frame. The background is a vast, empty [color] canvas, creating significant negative space. Soft, subtle lighting.',
    settings: { temperature: 0.5, aspectRatio: '16:9' },
    examples: [
      {
        title: 'Autumn Leaf',
        prompt: 'A minimalist composition featuring a single, delicate red maple leaf positioned in the bottom-right of the frame. The background is a vast, empty white canvas, creating significant negative space. Soft, subtle lighting.',
        settings: { temperature: 0.4, aspectRatio: '16:9' }
      },
      {
        title: 'Single Flower',
        prompt: 'A minimalist composition featuring a single white orchid positioned in the left third of the frame. The background is a vast, empty soft gray canvas, creating significant negative space perfect for text. Soft, diffused lighting from above.',
        settings: { temperature: 0.5, aspectRatio: '21:9' }
      },
      {
        title: 'Mountain Silhouette',
        prompt: 'A minimalist composition featuring a single mountain peak silhouette positioned in the center-bottom of the frame. The background is a vast gradient from deep blue to light blue sky, creating significant negative space. Soft dusk lighting.',
        settings: { temperature: 0.45, aspectRatio: '16:9' }
      }
    ]
  },
  {
    id: 'editing',
    name: 'Image Editing & Remixing',
    icon: Wand2,
    color: 'from-yellow-500 to-orange-500',
    description: 'Edit uploaded images - add, remove, or transform elements',
    template: 'Using the provided image of [subject], please [add/remove/modify] [element] to/from the scene. Ensure the change is [description of how the change should integrate].',
    settings: { temperature: 0.6, aspectRatio: '1:1' },
    needsImage: true,
    examples: [
      {
        title: 'Add Elements',
        prompt: 'Using the provided image of my living room, please add a large abstract painting above the sofa. Ensure the change is seamlessly integrated with matching lighting and perspective, featuring bold geometric shapes in blues and golds.',
        settings: { temperature: 0.5 },
        needsImage: true
      },
      {
        title: 'Change Style',
        prompt: 'Using the provided photograph, transform it into the artistic style of Van Gogh\'s Starry Night. Preserve the original composition but render it with swirling brushstrokes, vibrant blues and yellows, and the characteristic impasto texture.',
        settings: { temperature: 0.7 },
        needsImage: true
      },
      {
        title: 'Remove Background',
        prompt: 'Using the provided image, remove the background completely and replace it with a professional white studio background. Ensure the change maintains perfect edge definition and natural lighting on the subject.',
        settings: { temperature: 0.4 },
        needsImage: true
      }
    ]
  }
];

const ASPECT_RATIOS = [
  { value: "1:1", label: "Square (1:1)" },
  { value: "16:9", label: "Landscape (16:9)" },
  { value: "9:16", label: "Portrait (9:16)" },
  { value: "4:3", label: "Classic (4:3)" },
  { value: "3:2", label: "Photo (3:2)" },
  { value: "2:3", label: "Portrait (2:3)" },
  { value: "21:9", label: "Cinematic (21:9)" }
];

export default function NanoBananaSettings({
  settings,
  onSettingsChange,
  onImageUpload
}: NanoBananaSettingsProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(GEMINI_TEMPLATES[0]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleSettingChange = (key: string, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const handleTemplateSelect = (template: typeof GEMINI_TEMPLATES[0]) => {
    setSelectedTemplate(template);
    // Apply template default settings
    onSettingsChange({
      ...settings,
      ...template.settings
    });
    toast({
      title: "Template selected",
      description: `Using ${template.name} template`,
    });
  };

  const handleExampleUse = (example: any) => {
    onSettingsChange({
      ...settings,
      ...example.settings,
      prompt: example.prompt
    });
    toast({
      title: "Example loaded",
      description: "Prompt and settings applied",
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result?.toString().split(',')[1];
        if (base64) {
          setUploadedImage(base64);
          handleSettingChange('inputImage', base64);
          if (onImageUpload) {
            onImageUpload(base64);
          }
          toast({
            title: "Image uploaded",
            description: "You can now edit this image with prompts",
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Choose Template */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <CardTitle>Choose a Template</CardTitle>
              <CardDescription>Select the type of image you want to create</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {GEMINI_TEMPLATES.map((template) => {
              const Icon = template.icon;
              const isSelected = selectedTemplate.id === template.id;

              return (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-lg scale-105'
                      : 'border-border hover:border-primary/50 hover:bg-accent/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${template.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 flex items-center gap-2">
                        {template.name}
                        {isSelected && (
                          <Badge variant="default" className="text-xs">Selected</Badge>
                        )}
                        {template.needsImage && (
                          <Badge variant="secondary" className="text-xs">
                            <ImageIcon className="h-3 w-3 mr-1" />
                            Upload
                          </Badge>
                        )}
                      </h3>
                      <p className="text-xs text-muted-foreground">{template.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Template Structure */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <CardTitle>Template Structure</CardTitle>
              <CardDescription>This is the prompt pattern for {selectedTemplate.name}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-muted/50 border">
            <p className="text-sm font-mono leading-relaxed">
              {selectedTemplate.template}
            </p>
          </div>
          {selectedTemplate.needsImage && (
            <Alert className="mt-4">
              <ImageIcon className="h-4 w-4" />
              <AlertDescription>
                <strong>This template requires an image upload.</strong> Upload a reference image below to edit it.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Step 3: Use Examples */}
      <Card className="border-2 border-green-500/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-600" />
                Ready-to-Use Examples
              </CardTitle>
              <CardDescription>Click "Use" to instantly apply these examples</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedTemplate.examples.map((example, idx) => (
            <div
              key={idx}
              className="group p-4 border-2 rounded-lg hover:border-green-500/50 hover:bg-green-500/5 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-lg">{example.title}</h4>
                    {example.needsImage && (
                      <Badge variant="outline" className="text-xs">
                        <ImageIcon className="h-3 w-3 mr-1" />
                        Needs Image
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {example.prompt}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary">Temp: {example.settings.temperature}</Badge>
                    {example.settings.aspectRatio && (
                      <Badge variant="secondary">Ratio: {example.settings.aspectRatio}</Badge>
                    )}
                  </div>
                </div>
                <Button
                  size="lg"
                  onClick={() => handleExampleUse(example)}
                  disabled={example.needsImage && !uploadedImage}
                  className="shrink-0"
                >
                  Use This
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Step 4: Image Upload (if needed) */}
      {selectedTemplate.needsImage && (
        <Card className="border-2 border-yellow-500/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-yellow-600 text-white flex items-center justify-center font-bold">
                📸
              </div>
              <div>
                <CardTitle>Upload Reference Image</CardTitle>
                <CardDescription>Required for image editing templates</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="flex-1"
              />
              {uploadedImage && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setUploadedImage(null);
                    handleSettingChange('inputImage', undefined);
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
            {uploadedImage && (
              <div className="relative w-full max-w-xs mx-auto rounded-lg overflow-hidden border-2 border-green-500">
                <img
                  src={`data:image/jpeg;base64,${uploadedImage}`}
                  alt="Uploaded reference"
                  className="w-full h-auto"
                />
                <Badge className="absolute top-2 right-2 bg-green-600">
                  ✓ Ready to edit
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Generation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fine-tune Settings</CardTitle>
          <CardDescription>Adjust these for more control (optional)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Temperature */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Creativity Level</Label>
              <span className="text-sm font-mono text-muted-foreground">
                {settings.temperature || 0.7}
              </span>
            </div>
            <Slider
              value={[settings.temperature || 0.7]}
              onValueChange={([value]) => handleSettingChange('temperature', value)}
              min={0}
              max={1}
              step={0.05}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Low (0.1-0.3) = Predictable • Medium (0.4-0.7) = Balanced • High (0.8-1.0) = Very Creative
            </p>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-2">
            <Label>Aspect Ratio</Label>
            <Select
              value={settings.aspectRatio || "1:1"}
              onValueChange={(value) => handleSettingChange('aspectRatio', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASPECT_RATIOS.map((ratio) => (
                  <SelectItem key={ratio.value} value={ratio.value}>
                    {ratio.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Advanced - Collapsible */}
          <details className="space-y-4 pt-4 border-t">
            <summary className="cursor-pointer font-medium text-sm hover:text-primary">
              ⚙️ Advanced Options (Optional)
            </summary>

            <div className="space-y-4 mt-4 pl-4 border-l-2">
              {/* Top P */}
              <div className="space-y-2">
                <Label className="text-xs">Top P (Diversity)</Label>
                <Slider
                  value={[settings.topP || 0.95]}
                  onValueChange={([value]) => handleSettingChange('topP', value)}
                  min={0}
                  max={1}
                  step={0.05}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Controls output diversity - leave at 0.95 for best results
                </p>
              </div>

              {/* System Instructions */}
              <div className="space-y-2">
                <Label className="text-xs">Style Instructions (Optional)</Label>
                <Textarea
                  placeholder="e.g., 'Always use warm colors' or 'Maintain minimalist aesthetic'"
                  value={settings.systemInstructions || ''}
                  onChange={(e) => handleSettingChange('systemInstructions', e.target.value)}
                  className="min-h-[60px] text-sm"
                />
              </div>

              {/* Max Output Tokens */}
              <div className="space-y-2">
                <Label className="text-xs">Max Output Tokens (Optional)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 2048"
                  value={settings.maxOutputTokens || ''}
                  onChange={(e) => handleSettingChange('maxOutputTokens', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="text-sm"
                  min={1}
                  max={8192}
                />
                <p className="text-xs text-muted-foreground">
                  Limits the length of text output (leave empty for default)
                </p>
              </div>

              {/* Stop Sequences */}
              <div className="space-y-2">
                <Label className="text-xs">Stop Sequences (Optional)</Label>
                <Input
                  type="text"
                  placeholder="e.g., END, STOP (comma separated)"
                  value={settings.stopSequences?.join(', ') || ''}
                  onChange={(e) => {
                    const sequences = e.target.value
                      .split(',')
                      .map(s => s.trim())
                      .filter(s => s.length > 0);
                    handleSettingChange('stopSequences', sequences.length > 0 ? sequences : undefined);
                  }}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Text sequences that stop generation when encountered
                </p>
              </div>

              {/* Response Modalities */}
              <div className="space-y-2">
                <Label className="text-xs">Output Type</Label>
                <Select
                  value={settings.responseModalities?.join(',') || 'IMAGE,TEXT'}
                  onValueChange={(value) => {
                    const modalities = value.split(',');
                    handleSettingChange('responseModalities', modalities);
                  }}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IMAGE,TEXT">Image + Text Description</SelectItem>
                    <SelectItem value="IMAGE">Image Only</SelectItem>
                    <SelectItem value="TEXT">Text Only</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose what the model should generate
                </p>
              </div>
            </div>
          </details>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Alert className="border-2 border-blue-500/20 bg-blue-500/5">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          <strong className="text-blue-600">Pro Tips:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>✨ <strong>Start with examples</strong> - They're optimized for best results</li>
            <li>📝 <strong>Be specific</strong> - Mention colors, lighting, mood, and style</li>
            <li>🎨 <strong>Lower temperature</strong> (0.2-0.4) for precise, realistic images</li>
            <li>🌟 <strong>Higher temperature</strong> (0.7-1.0) for creative, artistic results</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}