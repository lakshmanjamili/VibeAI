'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Image as ImageIcon,
  Video,
  MessageSquare,
  Wand2,
  Send,
  Download,
  Share2,
  Upload,
  Loader2,
  CreditCard,
  Zap,
  Star,
  Bot,
  Camera,
  Film,
  Brain,
  Rocket,
  Crown,
  ChevronRight,
  Copy,
  RefreshCw,
  AlertCircle,
  BookOpen,
  TrendingUp,
  Lightbulb,
  ArrowRight,
  Settings2,
  Grid3x3,
  Eye,
  Heart,
  MessageCircle,
  Filter,
  SortDesc,
} from 'lucide-react';
import {
  PROMPT_TEMPLATES,
  getTemplatesByModel,
  getPopularTemplates,
  type PromptTemplate,
} from '@/lib/prompt-templates';
import dynamic from 'next/dynamic';

// Dynamically import NanoBananaSettings to avoid SSR issues
const NanoBananaSettings = dynamic(() => import('@/components/NanoBananaSettings'), { ssr: false });

interface AIModel {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: 'image' | 'video' | 'chat';
  creditCost: number;
  badge?: string;
  color: string;
}

const AI_MODELS: AIModel[] = [
  {
    id: 'gemini_chat',
    name: 'Gemini Chat',
    description: 'Advanced AI conversation powered by Google',
    icon: MessageSquare,
    category: 'chat',
    creditCost: 1,
    color: 'text-blue-500',
  },
  {
    id: 'nano_banana',
    name: 'Nano Banana',
    description: 'Creative image generation with Gemini 2.5 Flash',
    icon: Sparkles,
    category: 'image',
    creditCost: 1,
    badge: 'NEW',
    color: 'text-yellow-500',
  },
  {
    id: 'imagen',
    name: 'Imagen 4.0',
    description: "Google's latest photorealistic image generation",
    icon: Camera,
    category: 'image',
    creditCost: 2,
    color: 'text-purple-500',
  },
  {
    id: 'grok',
    name: 'Grok Image',
    description: "xAI's powerful image generation model",
    icon: Brain,
    category: 'image',
    creditCost: 2,
    badge: 'HOT',
    color: 'text-orange-500',
  },
  {
    id: 'veo',
    name: 'Veo 2.0',
    description: 'Generate stunning videos from text prompts',
    icon: Film,
    category: 'video',
    creditCost: 5,
    badge: 'PREMIUM',
    color: 'text-red-500',
  },
];

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface GeneratedContent {
  id: string;
  model: string;
  prompt: string;
  urls?: string[];
  text?: string;
  timestamp: string;
}

export default function AIStudioPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const [selectedModel, setSelectedModel] = useState<AIModel>(
    AI_MODELS.find((m) => m.id === 'nano_banana') || AI_MODELS[1]
  );
  const [prompt, setPrompt] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [credits, setCredits] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('create');
  const [nanoBananaSettings, setNanoBananaSettings] = useState<any>({
    temperature: 0.7,
    topP: 0.95,
    aspectRatio: '1:1',
    responseModalities: ['IMAGE', 'TEXT'],
  });

  // My Uploads state
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [hasMorePosts, setHasMorePosts] = useState(false);

  // Get templates for current model
  const modelTemplates = getTemplatesByModel(selectedModel.id);
  const popularTemplates = getPopularTemplates(3);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Get session ID for anonymous users
  const getSessionId = () => {
    if (typeof window === 'undefined') return '';
    let sessionId = localStorage.getItem('vibe_session_id');
    if (!sessionId) {
      sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('vibe_session_id', sessionId);
    }
    return sessionId;
  };

  // Fetch user credits
  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/ai/credits', {
        headers: {
          'x-session-id': getSessionId(),
        },
      });
      const data = await response.json();
      setCredits(data.credits);
    } catch (error) {
      console.error('Failed to fetch credits:', error);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  // Fetch user's uploaded posts
  const fetchUserPosts = async () => {
    if (!userId) return;

    setLoadingPosts(true);
    try {
      const params = new URLSearchParams({
        limit: '20',
        offset: '0',
        category: filterCategory,
        sortBy: sortBy,
        order: 'desc',
      });

      const response = await fetch(`/api/user/posts?${params}`);
      const data = await response.json();

      if (response.ok) {
        setUserPosts(data.posts || []);
        setHasMorePosts(data.pagination?.hasMore || false);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to load uploads',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to fetch user posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your uploads',
        variant: 'destructive',
      });
    } finally {
      setLoadingPosts(false);
    }
  };

  // Fetch posts when tab changes to "uploads" or when filters change
  useEffect(() => {
    if (activeTab === 'uploads') {
      fetchUserPosts();
    }
  }, [activeTab, filterCategory, sortBy, userId]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Handle chat message
  const handleChatSend = async () => {
    if (!prompt.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setPrompt('');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': getSessionId(),
        },
        body: JSON.stringify({
          message: prompt,
          conversationId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
        };
        setChatMessages((prev) => [...prev, assistantMessage]);
        setConversationId(data.conversationId);
        fetchCredits();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to send message',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle image/video generation
  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': getSessionId(),
        },
        body: JSON.stringify({
          model: selectedModel.id,
          prompt: nanoBananaSettings.prompt || prompt,
          options:
            selectedModel.id === 'nano_banana'
              ? {
                  ...nanoBananaSettings,
                  responseFormat: 'url',
                }
              : {
                  numberOfImages: 1,
                  aspectRatio: '1:1',
                  responseFormat: 'url',
                },
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newContent: GeneratedContent = {
          id: data.generationId,
          model: selectedModel.id,
          prompt,
          urls: data.data.urls,
          text: data.data.text,
          timestamp: new Date().toISOString(),
        };
        setGeneratedContent((prev) => [newContent, ...prev]);
        setPrompt('');
        fetchCredits();

        toast({
          title: 'Success!',
          description: `${selectedModel.name} generation complete`,
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Generation failed',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate content',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Upload to gallery
  const handleUploadToGallery = async (content: GeneratedContent) => {
    if (!content.urls?.[0]) return;

    // Find the model name from the model ID
    const modelInfo = AI_MODELS.find((m) => m.id === content.model);
    const modelName = modelInfo?.name || content.model;

    router.push(
      `/upload?ai_generated=true&url=${encodeURIComponent(content.urls[0])}&prompt=${encodeURIComponent(content.prompt)}&model=${encodeURIComponent(modelName)}`
    );
  };

  // Copy prompt
  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Prompt copied to clipboard',
    });
  };

  // Use template
  const handleUseTemplate = (template: PromptTemplate) => {
    setPrompt(template.prompt);
    setSelectedTemplate(template);
    setShowTemplates(false);

    // Find and select the appropriate model
    const model = AI_MODELS.find((m) => m.id === template.model);
    if (model) {
      setSelectedModel(model);
    }

    toast({
      title: 'Template loaded!',
      description: `Using "${template.title}" template`,
    });
  };

  // Handle Nano Banana settings change
  const handleNanoBananaSettingsChange = (newSettings: any) => {
    setNanoBananaSettings(newSettings);
    if (newSettings.prompt) {
      setPrompt(newSettings.prompt);
    }
  };

  const handleImageUpload = (base64: string) => {
    setNanoBananaSettings((prev) => ({ ...prev, inputImage: base64 }));
  };

  const getModelCreditsInfo = (modelId: string) => {
    if (!credits) return null;
    const modelKey = modelId.replace('_chat', '').replace('gemini_chat', 'chat');
    const credit = credits[modelKey];
    if (!credit) return null;
    return credit;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/30 dark:via-slate-900 dark:to-blue-950/30">
      <Navbar />

      <main className="container mx-auto px-4 pb-12 pt-20">
        {/* Header */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
            <Rocket className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">The Only Multi-Model AI Studio</span>
            <Badge variant="secondary" className="ml-1">
              World's First
            </Badge>
          </div>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            <span className="text-gradient-supreme">Create Anything with 4+ AI Models</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Images, videos, and storybooks - all from one platform. No competitor offers this
            variety. Welcome to the future.
          </p>
        </motion.div>

        {/* Credits Banner */}
        {credits && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="glass-supreme border-primary/20">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Your Credits</span>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {['nano_banana', 'imagen', 'grok', 'veo'].map((key) => {
                      const value = credits[key];
                      if (!value) return null;
                      const displayName =
                        key === 'nano_banana'
                          ? 'Nano Banana'
                          : key.charAt(0).toUpperCase() + key.slice(1);
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {displayName}
                          </Badge>
                          <span className="text-sm">
                            {value.remaining}/{value.limit}
                          </span>
                          <Progress
                            value={(value.remaining / value.limit) * 100}
                            className="h-2 w-20"
                          />
                        </div>
                      );
                    })}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push('/subscription')}>
                    <Crown className="mr-1 h-4 w-4" />
                    Upgrade
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="uploads" className="flex items-center gap-1">
              <Grid3x3 className="h-3 w-3" />
              My Uploads
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>

          {/* Create Tab - Redesigned with Large Workspace */}
          <TabsContent value="create" className="space-y-6">
            {/* Model Type Selection */}
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Choose Your AI Model</h3>
                  <Badge variant="outline" className="text-xs">
                    4+ Models Available
                  </Badge>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                  Switch between models instantly - a feature no other platform offers. From
                  lightning-fast generation to cinematic videos.
                </p>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {AI_MODELS.filter((m) => m.category !== 'chat').map((model) => {
                    const creditInfo = getModelCreditsInfo(model.id);
                    const isDisabled = creditInfo && creditInfo.remaining === 0;

                    return (
                      <motion.button
                        key={model.id}
                        onClick={() => !isDisabled && setSelectedModel(model)}
                        disabled={isDisabled}
                        className={`rounded-xl border-2 p-6 text-center transition-all ${
                          selectedModel.id === model.id
                            ? 'scale-105 border-primary bg-primary/10 shadow-lg'
                            : 'border-border hover:border-primary/50 hover:shadow-md'
                        } ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
                        whileHover={!isDisabled ? { scale: 1.05 } : {}}
                        whileTap={!isDisabled ? { scale: 0.95 } : {}}
                      >
                        <model.icon className={`mx-auto mb-3 h-12 w-12 ${model.color}`} />
                        <div className="mb-1 font-semibold">{model.name}</div>
                        {model.badge && (
                          <Badge variant="secondary" className="mb-2 text-[10px]">
                            {model.badge}
                          </Badge>
                        )}
                        <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">
                          {model.description}
                        </p>
                        <div className="flex items-center justify-center gap-2 text-xs">
                          <Badge variant="outline" className="text-[10px]">
                            {model.creditCost} credits
                          </Badge>
                          {creditInfo && (
                            <span className="text-[10px] text-muted-foreground">
                              {creditInfo.remaining} left
                            </span>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Large Generation Workspace */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Main Workspace - Takes up 2 columns */}
              <div className="space-y-6 lg:col-span-2">
                <Card>
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <selectedModel.icon className={`h-6 w-6 ${selectedModel.color}`} />
                          {selectedModel.name} Studio
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {selectedModel.category === 'video'
                            ? 'Describe the video you want to create'
                            : 'Describe your vision in detail'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Large Prompt Area */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Your Prompt</Label>
                        <Textarea
                          placeholder={
                            selectedModel.id === 'nano_banana'
                              ? 'Describe your creative vision in detail... e.g., "A whimsical enchanted forest at twilight with glowing mushrooms, fireflies dancing in the air, and a small fairy house nestled in a tree trunk"'
                              : selectedModel.id === 'imagen'
                                ? 'Describe the photograph you want... e.g., "Professional product photography of a luxury watch on black marble surface, studio lighting, bokeh background, ultra-detailed"'
                                : selectedModel.id === 'veo'
                                  ? 'Describe the video scene... e.g., "Cinematic drone shot starting from ground level, slowly rising above a misty mountain range at sunrise, revealing valleys below"'
                                  : 'Describe what you want to create in detail...'
                          }
                          value={nanoBananaSettings.prompt || prompt}
                          onChange={(e) => {
                            const newPrompt = e.target.value;
                            setPrompt(newPrompt);
                            setSelectedTemplate(null);
                            if (selectedModel.id === 'nano_banana') {
                              setNanoBananaSettings((prev) => ({ ...prev, prompt: newPrompt }));
                            }
                          }}
                          className="min-h-[200px] resize-none text-base"
                          disabled={isGenerating}
                        />
                        <p className="text-xs text-muted-foreground">
                          💡 Tip: Be specific about style, lighting, colors, and composition for
                          best results
                        </p>
                      </div>

                      {/* Generate Button */}
                      <Button
                        className="h-14 w-full text-lg"
                        size="lg"
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                            Generating your {selectedModel.category}...
                          </>
                        ) : (
                          <>
                            <Wand2 className="mr-2 h-6 w-6" />
                            Generate {selectedModel.category === 'video' ? 'Video' : 'Image'}
                          </>
                        )}
                      </Button>

                      {/* Generation Preview */}
                      {generatedContent.length > 0 && generatedContent[0].urls && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4"
                        >
                          <Separator />
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">Generated Result</h4>
                              <Badge variant="outline">Just now</Badge>
                            </div>
                            <div className="relative overflow-hidden rounded-xl border-2 border-primary/20 bg-muted">
                              {selectedModel.category === 'video' ? (
                                <video
                                  src={generatedContent[0].urls[0]}
                                  controls
                                  className="max-h-[600px] w-full object-contain"
                                />
                              ) : (
                                <img
                                  src={generatedContent[0].urls[0]}
                                  alt="Generated"
                                  className="max-h-[600px] w-full object-contain"
                                />
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="default"
                                className="flex-1"
                                onClick={() => handleUploadToGallery(generatedContent[0])}
                              >
                                <Upload className="mr-2 h-4 w-4" />
                                Upload to Gallery
                              </Button>
                              <Button variant="outline" size="icon">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon">
                                <Share2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setGeneratedContent([])}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar - Settings & Templates */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-4">
                  {/* Quick Settings */}
                  {selectedModel.id === 'nano_banana' ? (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <Settings2 className="h-4 w-4" />
                          Quick Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <NanoBananaSettings
                          settings={nanoBananaSettings}
                          onSettingsChange={handleNanoBananaSettingsChange}
                          onImageUpload={handleImageUpload}
                        />
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <Settings2 className="h-4 w-4" />
                          Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedModel.category === 'image' && (
                          <>
                            <div className="space-y-2">
                              <Label className="text-xs font-semibold">Aspect Ratio</Label>
                              <Select defaultValue="1:1">
                                <SelectTrigger className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1:1">Square (1:1)</SelectItem>
                                  <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                                  <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                                  <SelectItem value="4:3">Classic (4:3)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-semibold">Quality</Label>
                              <Select defaultValue="high">
                                <SelectTrigger className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="standard">Standard</SelectItem>
                                  <SelectItem value="high">High Quality</SelectItem>
                                  <SelectItem value="ultra">Ultra HD</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Pro Tips */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        Pro Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedModel.id === 'nano_banana' && (
                        <ul className="space-y-2 text-xs text-muted-foreground">
                          <li className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>Use descriptive adjectives for style</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>Mention lighting and mood</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>Specify composition details</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>Add artistic references if needed</span>
                          </li>
                        </ul>
                      )}
                      {selectedModel.id === 'imagen' && (
                        <ul className="space-y-2 text-xs text-muted-foreground">
                          <li className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>Use photography terminology</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>Mention camera & lens details</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>Specify depth of field</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>Describe lighting setup</span>
                          </li>
                        </ul>
                      )}
                      {selectedModel.id === 'veo' && (
                        <ul className="space-y-2 text-xs text-muted-foreground">
                          <li className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>Describe camera movements</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>Mention pacing & timing</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>Specify video style</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>Add transition details</span>
                          </li>
                        </ul>
                      )}
                      {selectedModel.id === 'grok' && (
                        <ul className="space-y-2 text-xs text-muted-foreground">
                          <li className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>Great for complex scenes</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>Handles artistic styles well</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>Specify materials & textures</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>Works with surreal concepts</span>
                          </li>
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* My Uploads Tab - Instagram-like Experience */}
          <TabsContent value="uploads">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Grid3x3 className="h-5 w-5" />
                      My Uploads
                    </CardTitle>
                    <CardDescription>
                      All your uploaded content - {userPosts.length}{' '}
                      {userPosts.length === 1 ? 'post' : 'posts'}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push('/upload')}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters and Sorting */}
                <div className="mb-6 flex flex-wrap gap-4 rounded-lg border bg-muted/30 p-4">
                  <div className="min-w-[200px] flex-1">
                    <Label className="mb-2 block text-xs">Filter by Category</Label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="photo">📷 Photos</SelectItem>
                        <SelectItem value="video">🎬 Videos</SelectItem>
                        <SelectItem value="gif">🎞️ GIFs</SelectItem>
                        <SelectItem value="storybook">📚 Storybooks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="min-w-[200px] flex-1">
                    <Label className="mb-2 block text-xs">Sort By</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="created_at">📅 Latest First</SelectItem>
                        <SelectItem value="view_count">👀 Most Viewed</SelectItem>
                        <SelectItem value="likes_count">❤️ Most Liked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Loading State */}
                {loadingPosts ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : userPosts.length === 0 ? (
                  /* Empty State */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-20 text-center"
                  >
                    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/5">
                      <Grid3x3 className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">No uploads yet</h3>
                    <p className="mb-6 text-muted-foreground">
                      Start creating and sharing your AI-generated content
                    </p>
                    <Button onClick={() => setActiveTab('create')}>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Create Now
                    </Button>
                  </motion.div>
                ) : (
                  /* Instagram-like Grid */
                  <div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4"
                    >
                      {userPosts.map((post, index) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg"
                          onClick={() => router.push(`/post/${post.id}`)}
                        >
                          {/* Image/Video */}
                          {post.category === 'video' ? (
                            <div className="relative h-full w-full">
                              <video src={post.file_url} className="h-full w-full object-cover" />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <Video className="h-12 w-12 text-white" />
                              </div>
                            </div>
                          ) : (
                            <img
                              src={post.thumbnail_url || post.file_url}
                              alt={post.title}
                              className="h-full w-full object-cover"
                            />
                          )}

                          {/* Overlay on Hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                              <h4 className="mb-2 line-clamp-1 text-sm font-semibold">
                                {post.title}
                              </h4>
                              <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  <span>{post.view_count || 0}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  <span>{post.likes_count || 0}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="h-3 w-3" />
                                  <span>{post.comments_count || 0}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Category Badge */}
                          <div className="absolute right-2 top-2">
                            <Badge
                              variant="secondary"
                              className="border-none bg-black/50 text-[10px] capitalize text-white"
                            >
                              {post.category}
                            </Badge>
                          </div>

                          {/* AI Model Badge if applicable */}
                          {post.ai_model && (
                            <div className="absolute left-2 top-2">
                              <Badge className="border-none bg-primary/80 text-[10px]">
                                AI: {post.ai_model}
                              </Badge>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Load More Button */}
                    {hasMorePosts && (
                      <div className="mt-8 text-center">
                        <Button variant="outline" onClick={fetchUserPosts} disabled={loadingPosts}>
                          {loadingPosts ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              Load More
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Generation History</CardTitle>
                <CardDescription>Your recent AI generations</CardDescription>
              </CardHeader>
              <CardContent>
                {generatedContent.length === 0 ? (
                  <div className="py-12 text-center">
                    <ImageIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No generations yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {generatedContent.map((content) => (
                      <Card key={content.id} className="overflow-hidden">
                        {content.urls?.[0] && (
                          <div className="relative aspect-square">
                            <img
                              src={content.urls[0]}
                              alt={content.prompt}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <CardContent className="p-4">
                          <p className="mb-2 line-clamp-2 text-sm">{content.prompt}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {AI_MODELS.find((m) => m.id === content.model)?.name}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUploadToGallery(content)}
                            >
                              <Upload className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Prompt Templates Library
                </CardTitle>
                <CardDescription>
                  Professional templates to get you started quickly. Click any template to use it.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Popular Templates */}
                <div className="mb-8">
                  <div className="mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Popular Templates</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {popularTemplates.map((template) => (
                      <motion.div
                        key={template.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg"
                          onClick={() => handleUseTemplate(template)}
                        >
                          <CardContent className="p-4">
                            <div className="mb-2 flex items-start justify-between">
                              <Badge variant="outline" className="text-xs">
                                {AI_MODELS.find((m) => m.id === template.model)?.name}
                              </Badge>
                              <Badge className="text-xs">{template.difficulty}</Badge>
                            </div>
                            <h4 className="mb-1 font-semibold">{template.title}</h4>
                            <p className="mb-3 text-sm text-muted-foreground">
                              {template.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {template.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="mt-3 border-t pt-3">
                              <p className="line-clamp-2 text-xs text-muted-foreground">
                                {template.prompt.slice(0, 100)}...
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Templates by Model */}
                <div>
                  <h3 className="mb-4 flex items-center gap-2 font-semibold">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    All Templates by Model
                  </h3>
                  <Tabs defaultValue={AI_MODELS[0].id} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-5">
                      {AI_MODELS.map((model) => (
                        <TabsTrigger key={model.id} value={model.id} className="text-xs">
                          <model.icon className="mr-1 h-3 w-3" />
                          {model.name.split(' ')[0]}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {AI_MODELS.map((model) => {
                      const templates = getTemplatesByModel(model.id);
                      return (
                        <TabsContent key={model.id} value={model.id}>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {templates.map((template) => (
                              <Card
                                key={template.id}
                                className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
                                onClick={() => handleUseTemplate(template)}
                              >
                                <CardContent className="p-4">
                                  <div className="mb-2 flex items-start justify-between">
                                    <h4 className="font-semibold">{template.title}</h4>
                                    <Badge className="text-xs">{template.difficulty}</Badge>
                                  </div>
                                  <p className="mb-3 text-sm text-muted-foreground">
                                    {template.description}
                                  </p>
                                  <div className="rounded-md bg-muted/50 p-3">
                                    <p className="line-clamp-3 font-mono text-xs">
                                      {template.prompt}
                                    </p>
                                  </div>
                                  <div className="mt-3 flex items-center justify-between">
                                    <div className="flex flex-wrap gap-1">
                                      {template.tags.slice(0, 2).map((tag) => (
                                        <Badge key={tag} variant="secondary" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                    <Button size="sm" variant="ghost">
                                      <Copy className="mr-1 h-3 w-3" />
                                      Use
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                          {templates.length === 0 && (
                            <div className="py-8 text-center">
                              <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                              <p className="text-muted-foreground">
                                No templates available for this model yet
                              </p>
                            </div>
                          )}
                        </TabsContent>
                      );
                    })}
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <Card className="flex h-[600px] flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Chat Assistant
                </CardTitle>
                <CardDescription>
                  Chat with Gemini AI for help, ideas, or conversation
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                {/* Chat Messages */}
                <ScrollArea ref={chatScrollRef} className="mb-4 flex-1 pr-4">
                  {chatMessages.length === 0 ? (
                    <div className="py-12 text-center">
                      <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">Start a conversation</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {chatMessages.map((message, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${
                                message.role === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                              {message.role === 'assistant' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="mt-2 h-6 px-2"
                                  onClick={() => handleCopyPrompt(message.content)}
                                >
                                  <Copy className="mr-1 h-3 w-3" />
                                  Copy
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </ScrollArea>

                {/* Chat Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleChatSend()}
                    disabled={isGenerating}
                  />
                  <Button onClick={handleChatSend} disabled={!prompt.trim() || isGenerating}>
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
