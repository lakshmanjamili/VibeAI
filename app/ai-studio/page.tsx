'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  AlertCircle
} from 'lucide-react';

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
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS[0]);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [credits, setCredits] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('create');
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
          prompt,
          options: {
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

    router.push(`/upload?ai_generated=true&url=${encodeURIComponent(content.urls[0])}&prompt=${encodeURIComponent(content.prompt)}&model=${content.model}`);
  };

  // Copy prompt
  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Prompt copied to clipboard',
    });
  };

  const getModelCreditsInfo = (modelId: string) => {
    if (!credits) return null;
    const modelKey = modelId.replace('_chat', '').replace('gemini_chat', 'chat');
    const credit = credits[modelKey];
    if (!credit) return null;
    return credit;
  };

  return (
    <div className="min-h-screen bg-background">
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
            <span className="text-sm font-medium">AI Studio</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient-supreme">Create with AI</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate images, videos, and chat with advanced AI models. All in one place.
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
                    {Object.entries(credits).slice(0, 4).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {key === 'chat' ? 'Chat' : key.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm">
                          {value.remaining}/{value.limit}
                        </span>
                        <Progress value={(value.remaining / value.limit) * 100} className="w-20 h-2" />
                      </div>
                    ))}
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>

          {/* Create Tab */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Model Selection */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Select Model</CardTitle>
                    <CardDescription>Choose an AI model to generate content</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {AI_MODELS.filter(m => m.category !== 'chat').map((model) => {
                      const creditInfo = getModelCreditsInfo(model.id);
                      const isDisabled = creditInfo && creditInfo.remaining === 0;
                      
                      return (
                        <motion.button
                          key={model.id}
                          onClick={() => !isDisabled && setSelectedModel(model)}
                          disabled={isDisabled}
                          className={`w-full p-4 rounded-lg border-2 transition-all ${
                            selectedModel.id === model.id
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                          whileHover={!isDisabled ? { scale: 1.02 } : {}}
                          whileTap={!isDisabled ? { scale: 0.98 } : {}}
                        >
                          <div className="flex items-start gap-3">
                            <model.icon className={`h-5 w-5 mt-1 ${model.color}`} />
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{model.name}</span>
                                {model.badge && (
                                  <Badge variant="secondary" className="text-xs">
                                    {model.badge}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {model.description}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {model.creditCost} credits
                                </Badge>
                                {creditInfo && (
                                  <span className="text-xs text-muted-foreground">
                                    {creditInfo.remaining} left
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Generation Interface */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <selectedModel.icon className={`h-5 w-5 ${selectedModel.color}`} />
                      {selectedModel.name}
                    </CardTitle>
                    <CardDescription>
                      Enter your prompt below to generate {selectedModel.category === 'video' ? 'a video' : 'an image'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder={`Describe what you want to ${selectedModel.category === 'video' ? 'see in the video' : 'create'}...`}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[150px]"
                      disabled={isGenerating}
                    />
                    
                    {selectedModel.category === 'image' && (
                      <div className="grid grid-cols-2 gap-4">
                        <Select defaultValue="1:1">
                          <SelectTrigger>
                            <SelectValue placeholder="Aspect Ratio" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1:1">Square (1:1)</SelectItem>
                            <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                            <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                            <SelectItem value="4:3">Classic (4:3)</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select defaultValue="1">
                          <SelectTrigger>
                            <SelectValue placeholder="Number of images" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Image</SelectItem>
                            <SelectItem value="2">2 Images</SelectItem>
                            <SelectItem value="4">4 Images</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleGenerate}
                      disabled={!prompt.trim() || isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-5 w-5 mr-2" />
                          Generate {selectedModel.category === 'video' ? 'Video' : 'Image'}
                        </>
                      )}
                    </Button>

                    {/* Recent Generation Preview */}
                    {generatedContent.length > 0 && generatedContent[0].urls && (
                      <div className="mt-6 space-y-4">
                        <Separator />
                        <h4 className="font-semibold">Latest Generation</h4>
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                          {selectedModel.category === 'video' ? (
                            <video 
                              src={generatedContent[0].urls[0]} 
                              controls 
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <img 
                              src={generatedContent[0].urls[0]} 
                              alt="Generated" 
                              className="w-full h-full object-contain"
                            />
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
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
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
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