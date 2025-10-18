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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  SortDesc
} from 'lucide-react';
import { 
  PROMPT_TEMPLATES, 
  getTemplatesByModel, 
  getPopularTemplates,
  type PromptTemplate 
} from '@/lib/prompt-templates';
import dynamic from 'next/dynamic';

// Dynamically import NanoBananaSettings to avoid SSR issues
const NanoBananaSettings = dynamic(
  () => import('@/components/NanoBananaSettings'),
  { ssr: false }
);

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
    color: 'text-blue-500'
  },
  {
    id: 'nano_banana',
    name: 'Nano Banana',
    description: 'Creative image generation with Gemini 2.5 Flash',
    icon: Sparkles,
    category: 'image',
    creditCost: 1,
    badge: 'NEW',
    color: 'text-yellow-500'
  },
  {
    id: 'imagen',
    name: 'Imagen 4.0',
    description: 'Google\'s latest photorealistic image generation',
    icon: Camera,
    category: 'image',
    creditCost: 2,
    color: 'text-purple-500'
  },
  {
    id: 'grok',
    name: 'Grok Image',
    description: 'xAI\'s powerful image generation model',
    icon: Brain,
    category: 'image',
    creditCost: 2,
    badge: 'HOT',
    color: 'text-orange-500'
  },
  {
    id: 'veo',
    name: 'Veo 2.0',
    description: 'Generate stunning videos from text prompts',
    icon: Film,
    category: 'video',
    creditCost: 5,
    badge: 'PREMIUM',
    color: 'text-red-500'
  }
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
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS.find(m => m.id === 'nano_banana') || AI_MODELS[1]);
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
    responseModalities: ['IMAGE', 'TEXT']
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
          'x-session-id': getSessionId()
        }
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
        order: 'desc'
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
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Failed to fetch user posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your uploads',
        variant: 'destructive'
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
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': getSessionId()
        },
        body: JSON.stringify({
          message: prompt,
          conversationId
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString()
        };
        setChatMessages(prev => [...prev, assistantMessage]);
        setConversationId(data.conversationId);
        fetchCredits();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to send message',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
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
          'x-session-id': getSessionId()
        },
        body: JSON.stringify({
          model: selectedModel.id,
          prompt: nanoBananaSettings.prompt || prompt,
          options: selectedModel.id === 'nano_banana' ? {
            ...nanoBananaSettings,
            responseFormat: 'url'
          } : {
            numberOfImages: 1,
            aspectRatio: '1:1',
            responseFormat: 'url'
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        const newContent: GeneratedContent = {
          id: data.generationId,
          model: selectedModel.id,
          prompt,
          urls: data.data.urls,
          text: data.data.text,
          timestamp: new Date().toISOString()
        };
        setGeneratedContent(prev => [newContent, ...prev]);
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
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate content',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Upload to gallery
  const handleUploadToGallery = async (content: GeneratedContent) => {
    if (!content.urls?.[0]) return;

    // Find the model name from the model ID
    const modelInfo = AI_MODELS.find(m => m.id === content.model);
    const modelName = modelInfo?.name || content.model;

    router.push(`/upload?ai_generated=true&url=${encodeURIComponent(content.urls[0])}&prompt=${encodeURIComponent(content.prompt)}&model=${encodeURIComponent(modelName)}`);
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
    const model = AI_MODELS.find(m => m.id === template.model);
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
    setNanoBananaSettings(prev => ({ ...prev, inputImage: base64 }));
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

      <main className="container mx-auto px-4 pt-20 pb-12">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4">
            <Rocket className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">The Only Multi-Model AI Studio</span>
            <Badge variant="secondary" className="ml-1">World's First</Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient-supreme">Create Anything with 4+ AI Models</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Images, videos, and storybooks - all from one platform. No competitor offers this variety. Welcome to the future.
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
                      const displayName = key === 'nano_banana' ? 'Nano Banana' : key.charAt(0).toUpperCase() + key.slice(1);
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {displayName}
                          </Badge>
                          <span className="text-sm">
                            {value.remaining}/{value.limit}
                          </span>
                          <Progress value={(value.remaining / value.limit) * 100} className="w-20 h-2" />
                        </div>
                      );
                    })}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push('/subscription')}>
                    <Crown className="h-4 w-4 mr-1" />
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
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Choose Your AI Model</h3>
                  <Badge variant="outline" className="text-xs">4+ Models Available</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Switch between models instantly - a feature no other platform offers. From lightning-fast generation to cinematic videos.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {AI_MODELS.filter(m => m.category !== 'chat').map((model) => {
                    const creditInfo = getModelCreditsInfo(model.id);
                    const isDisabled = creditInfo && creditInfo.remaining === 0;

                    return (
                      <motion.button
                        key={model.id}
                        onClick={() => !isDisabled && setSelectedModel(model)}
                        disabled={isDisabled}
                        className={`p-6 rounded-xl border-2 transition-all text-center ${
                          selectedModel.id === model.id
                            ? 'border-primary bg-primary/10 shadow-lg scale-105'
                            : 'border-border hover:border-primary/50 hover:shadow-md'
                        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        whileHover={!isDisabled ? { scale: 1.05 } : {}}
                        whileTap={!isDisabled ? { scale: 0.95 } : {}}
                      >
                        <model.icon className={`h-12 w-12 mx-auto mb-3 ${model.color}`} />
                        <div className="font-semibold mb-1">{model.name}</div>
                        {model.badge && (
                          <Badge variant="secondary" className="text-[10px] mb-2">
                            {model.badge}
                          </Badge>
                        )}
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Workspace - Takes up 2 columns */}
              <div className="lg:col-span-2 space-y-6">
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
                              setNanoBananaSettings(prev => ({ ...prev, prompt: newPrompt }));
                            }
                          }}
                          className="min-h-[200px] text-base resize-none"
                          disabled={isGenerating}
                        />
                        <p className="text-xs text-muted-foreground">
                          💡 Tip: Be specific about style, lighting, colors, and composition for best results
                        </p>
                      </div>

                      {/* Generate Button */}
                      <Button
                        className="w-full h-14 text-lg"
                        size="lg"
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                            Generating your {selectedModel.category}...
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-6 w-6 mr-2" />
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
                            <div className="relative rounded-xl overflow-hidden bg-muted border-2 border-primary/20">
                              {selectedModel.category === 'video' ? (
                                <video
                                  src={generatedContent[0].urls[0]}
                                  controls
                                  className="w-full object-contain max-h-[600px]"
                                />
                              ) : (
                                <img
                                  src={generatedContent[0].urls[0]}
                                  alt="Generated"
                                  className="w-full object-contain max-h-[600px]"
                                />
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="default"
                                className="flex-1"
                                onClick={() => handleUploadToGallery(generatedContent[0])}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload to Gallery
                              </Button>
                              <Button variant="outline" size="icon">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon">
                                <Share2 className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" onClick={() => setGeneratedContent([])}>
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
                        <CardTitle className="text-sm flex items-center gap-2">
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
                        <CardTitle className="text-sm flex items-center gap-2">
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
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        Pro Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedModel.id === 'nano_banana' && (
                        <ul className="text-xs text-muted-foreground space-y-2">
                          <li className="flex gap-2"><span className="text-primary">•</span><span>Use descriptive adjectives for style</span></li>
                          <li className="flex gap-2"><span className="text-primary">•</span><span>Mention lighting and mood</span></li>
                          <li className="flex gap-2"><span className="text-primary">•</span><span>Specify composition details</span></li>
                          <li className="flex gap-2"><span className="text-primary">•</span><span>Add artistic references if needed</span></li>
                        </ul>
                      )}
                      {selectedModel.id === 'imagen' && (
                        <ul className="text-xs text-muted-foreground space-y-2">
                          <li className="flex gap-2"><span className="text-primary">•</span><span>Use photography terminology</span></li>
                          <li className="flex gap-2"><span className="text-primary">•</span><span>Mention camera & lens details</span></li>
                          <li className="flex gap-2"><span className="text-primary">•</span><span>Specify depth of field</span></li>
                          <li className="flex gap-2"><span className="text-primary">•</span><span>Describe lighting setup</span></li>
                        </ul>
                      )}
                      {selectedModel.id === 'veo' && (
                        <ul className="text-xs text-muted-foreground space-y-2">
                          <li className="flex gap-2"><span className="text-primary">•</span><span>Describe camera movements</span></li>
                          <li className="flex gap-2"><span className="text-primary">•</span><span>Mention pacing & timing</span></li>
                          <li className="flex gap-2"><span className="text-primary">•</span><span>Specify video style</span></li>
                          <li className="flex gap-2"><span className="text-primary">•</span><span>Add transition details</span></li>
                        </ul>
                      )}
                      {selectedModel.id === 'grok' && (
                        <ul className="text-xs text-muted-foreground space-y-2">
                          <li className="flex gap-2"><span className="text-primary">•</span><span>Great for complex scenes</span></li>
                          <li className="flex gap-2"><span className="text-primary">•</span><span>Handles artistic styles well</span></li>
                          <li className="flex gap-2"><span className="text-primary">•</span><span>Specify materials & textures</span></li>
                          <li className="flex gap-2"><span className="text-primary">•</span><span>Works with surreal concepts</span></li>
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
                      All your uploaded content - {userPosts.length} {userPosts.length === 1 ? 'post' : 'posts'}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/upload')}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters and Sorting */}
                <div className="flex flex-wrap gap-4 mb-6 p-4 border rounded-lg bg-muted/30">
                  <div className="flex-1 min-w-[200px]">
                    <Label className="text-xs mb-2 block">Filter by Category</Label>
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

                  <div className="flex-1 min-w-[200px]">
                    <Label className="text-xs mb-2 block">Sort By</Label>
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
                    className="text-center py-20"
                  >
                    <div className="bg-primary/5 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                      <Grid3x3 className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No uploads yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Start creating and sharing your AI-generated content
                    </p>
                    <Button onClick={() => setActiveTab('create')}>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Create Now
                    </Button>
                  </motion.div>
                ) : (
                  /* Instagram-like Grid */
                  <div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4"
                    >
                      {userPosts.map((post, index) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer"
                          onClick={() => router.push(`/post/${post.id}`)}
                        >
                          {/* Image/Video */}
                          {post.category === 'video' ? (
                            <div className="relative w-full h-full">
                              <video
                                src={post.file_url}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <Video className="h-12 w-12 text-white" />
                              </div>
                            </div>
                          ) : (
                            <img
                              src={post.thumbnail_url || post.file_url}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          )}

                          {/* Overlay on Hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                              <h4 className="font-semibold text-sm line-clamp-1 mb-2">{post.title}</h4>
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
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="text-[10px] capitalize bg-black/50 text-white border-none">
                              {post.category}
                            </Badge>
                          </div>

                          {/* AI Model Badge if applicable */}
                          {post.ai_model && (
                            <div className="absolute top-2 left-2">
                              <Badge className="text-[10px] bg-primary/80 border-none">
                                AI: {post.ai_model}
                              </Badge>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Load More Button */}
                    {hasMorePosts && (
                      <div className="text-center mt-8">
                        <Button
                          variant="outline"
                          onClick={fetchUserPosts}
                          disabled={loadingPosts}
                        >
                          {loadingPosts ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              Load More
                              <ChevronRight className="h-4 w-4 ml-2" />
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
                  <div className="text-center py-12">
                    <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No generations yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {generatedContent.map((content) => (
                      <Card key={content.id} className="overflow-hidden">
                        {content.urls?.[0] && (
                          <div className="aspect-square relative">
                            <img 
                              src={content.urls[0]} 
                              alt={content.prompt} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardContent className="p-4">
                          <p className="text-sm line-clamp-2 mb-2">{content.prompt}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {AI_MODELS.find(m => m.id === content.model)?.name}
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
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Popular Templates</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {popularTemplates.map((template) => (
                      <motion.div
                        key={template.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
                          onClick={() => handleUseTemplate(template)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <Badge variant="outline" className="text-xs">
                                {AI_MODELS.find(m => m.id === template.model)?.name}
                              </Badge>
                              <Badge className="text-xs">
                                {template.difficulty}
                              </Badge>
                            </div>
                            <h4 className="font-semibold mb-1">{template.title}</h4>
                            <p className="text-sm text-muted-foreground mb-3">
                              {template.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {template.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-xs text-muted-foreground line-clamp-2">
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
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    All Templates by Model
                  </h3>
                  <Tabs defaultValue={AI_MODELS[0].id} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-5">
                      {AI_MODELS.map((model) => (
                        <TabsTrigger 
                          key={model.id} 
                          value={model.id}
                          className="text-xs"
                        >
                          <model.icon className="h-3 w-3 mr-1" />
                          {model.name.split(' ')[0]}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    
                    {AI_MODELS.map((model) => {
                      const templates = getTemplatesByModel(model.id);
                      return (
                        <TabsContent key={model.id} value={model.id}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {templates.map((template) => (
                              <Card 
                                key={template.id}
                                className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
                                onClick={() => handleUseTemplate(template)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-semibold">{template.title}</h4>
                                    <Badge className="text-xs">
                                      {template.difficulty}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-3">
                                    {template.description}
                                  </p>
                                  <div className="bg-muted/50 rounded-md p-3">
                                    <p className="text-xs font-mono line-clamp-3">
                                      {template.prompt}
                                    </p>
                                  </div>
                                  <div className="flex items-center justify-between mt-3">
                                    <div className="flex flex-wrap gap-1">
                                      {template.tags.slice(0, 2).map((tag) => (
                                        <Badge key={tag} variant="secondary" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                    <Button size="sm" variant="ghost">
                                      <Copy className="h-3 w-3 mr-1" />
                                      Use
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                          {templates.length === 0 && (
                            <div className="text-center py-8">
                              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
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
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Chat Assistant
                </CardTitle>
                <CardDescription>
                  Chat with Gemini AI for help, ideas, or conversation
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* Chat Messages */}
                <ScrollArea 
                  ref={chatScrollRef}
                  className="flex-1 pr-4 mb-4"
                >
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
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
                            <div className={`max-w-[80%] rounded-lg p-3 ${
                              message.role === 'user' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              {message.role === 'assistant' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="mt-2 h-6 px-2"
                                  onClick={() => handleCopyPrompt(message.content)}
                                >
                                  <Copy className="h-3 w-3 mr-1" />
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
                  <Button 
                    onClick={handleChatSend}
                    disabled={!prompt.trim() || isGenerating}
                  >
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