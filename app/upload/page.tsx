'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { PostCategory, AIModel } from '@/types/database';
import { Upload, Loader2, Film, Video, BookOpen, ImageIcon, Wand2, Hash, X, Info, ShieldCheck } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

// File upload configuration
const FILE_SIZE_LIMIT = 100 * 1024 * 1024; // 100MB
const MAX_HASHTAGS = 10;
const ALLOWED_MIME_TYPES = {
  gif: ['.gif'],
  video: ['.mp4', '.webm', '.mov'],
  storybook: ['.pdf', '.epub'],
  photo: ['.jpg', '.jpeg', '.png', '.webp'],
};

// Category configuration
const CATEGORY_CONFIG = [
  { value: 'gif' as PostCategory, label: 'GIF', icon: Film, accept: ALLOWED_MIME_TYPES.gif },
  { value: 'video' as PostCategory, label: 'Video', icon: Video, accept: ALLOWED_MIME_TYPES.video },
  { value: 'storybook' as PostCategory, label: 'Storybook', icon: BookOpen, accept: ALLOWED_MIME_TYPES.storybook },
  { value: 'photo' as PostCategory, label: 'Photo', icon: ImageIcon, accept: ALLOWED_MIME_TYPES.photo },
];

// Helper functions
const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
};

const generateStoragePath = (category: PostCategory, userId: string, filename: string): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const timestamp = Date.now();
  const sanitizedFilename = sanitizeFilename(filename);
  
  return `${year}/${month}/${category}/${userId}/${timestamp}_${sanitizedFilename}`;
};

interface UploadState {
  loading: boolean;
  progress: number;
  error: string | null;
}

export default function UploadPage() {
  const router = useRouter();
  const { userId, isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PostCategory>('photo');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  
  // AI Generation state
  const [aiModel, setAiModel] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [aiModels, setAiModels] = useState<AIModel[]>([]);
  
  // Upload state
  const [uploadState, setUploadState] = useState<UploadState>({
    loading: false,
    progress: 0,
    error: null,
  });

  // Redirect unauthenticated users
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/sign-in?redirect=/upload');
    }
  }, [isLoaded, isSignedIn, router]);

  // Fetch AI models and test connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test basic Supabase connection
        const { data: testData, error: testError } = await supabase
          .from('users')
          .select('count')
          .limit(1);
        
        if (testError) {
          console.error('Supabase connection test failed:', testError);
          toast({
            title: 'Database Connection Issue',
            description: 'Unable to connect to database. Please check your connection.',
            variant: 'destructive',
          });
        } else {
          console.log('Supabase connection successful');
        }
      } catch (error) {
        console.error('Connection test error:', error);
      }
    };

    const fetchAIModels = async () => {
      try {
        const { data, error } = await supabase
          .from('ai_models')
          .select('*')
          .eq('is_active', true)
          .order('name');
        
        if (error) {
          console.error('Error fetching AI models:', error);
          // Continue without AI models - they're optional
        } else {
          setAiModels(data || []);
        }
      } catch (error) {
        console.error('Error fetching AI models:', error);
      }
    };

    if (isSignedIn) {
      testConnection();
      fetchAIModels();
    }
  }, [isSignedIn]);

  // Hashtag management
  const addHashtag = () => {
    const tag = hashtagInput.trim().toLowerCase().replace(/^#/, '');
    
    if (!tag) return;
    if (hashtags.includes(tag)) {
      toast({
        title: 'Duplicate hashtag',
        description: 'This hashtag has already been added',
        variant: 'destructive',
      });
      return;
    }
    if (hashtags.length >= MAX_HASHTAGS) {
      toast({
        title: 'Hashtag limit reached',
        description: `Maximum ${MAX_HASHTAGS} hashtags allowed`,
        variant: 'destructive',
      });
      return;
    }
    
    setHashtags([...hashtags, tag]);
    setHashtagInput('');
  };

  const removeHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(tag => tag !== tagToRemove));
  };

  const handleHashtagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addHashtag();
    }
  };

  // File handling
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Validate file size
    if (file.size > FILE_SIZE_LIMIT) {
      toast({
        title: 'File too large',
        description: `File size must be less than ${FILE_SIZE_LIMIT / (1024 * 1024)}MB`,
        variant: 'destructive',
      });
      return;
    }
    
    setFile(file);
    setUploadState({ ...uploadState, error: null });
    
    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview('');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: FILE_SIZE_LIMIT,
    accept: CATEGORY_CONFIG.find(c => c.value === category)?.accept.reduce((acc, ext) => {
      const mimeType = ext === '.gif' ? 'image/gif' :
                      ext === '.mp4' ? 'video/mp4' :
                      ext === '.webm' ? 'video/webm' :
                      ext === '.mov' ? 'video/quicktime' :
                      ext === '.pdf' ? 'application/pdf' :
                      ext === '.epub' ? 'application/epub+zip' :
                      ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                      ext === '.png' ? 'image/png' :
                      ext === '.webp' ? 'image/webp' : '';
      if (mimeType) acc[mimeType] = [ext];
      return acc;
    }, {} as Record<string, string[]>),
  });

  // Form validation
  const validateForm = (): boolean => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return false;
    }
    
    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for your content',
        variant: 'destructive',
      });
      return false;
    }
    
    if (title.length > 100) {
      toast({
        title: 'Title too long',
        description: 'Title must be 100 characters or less',
        variant: 'destructive',
      });
      return false;
    }
    
    if (description.length > 500) {
      toast({
        title: 'Description too long',
        description: 'Description must be 500 characters or less',
        variant: 'destructive',
      });
      return false;
    }
    
    if (prompt.length > 2000) {
      toast({
        title: 'Prompt too long',
        description: 'Prompt must be 2000 characters or less',
        variant: 'destructive',
      });
      return false;
    }
    
    return true;
  };

  // Ensure user exists in database
  const ensureUserExists = async (userId: string): Promise<string | null> => {
    try {
      console.log('Checking for existing user with clerk_id:', userId);
      
      // Check if user exists
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .maybeSingle();

      if (selectError) {
        console.error('Error checking existing user:', selectError);
        throw selectError;
      }

      if ((existingUser as any)?.id) {
        console.log('Found existing user:', (existingUser as any).id);
        return (existingUser as any).id;
      }

      // Create new user
      const userData = {
        clerk_id: userId,
        username: user?.username || user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'user',
        email: user?.emailAddresses[0]?.emailAddress || '',
        avatar_url: user?.imageUrl || null,
      };

      console.log('Creating new user with data:', userData);

      const { data: newUser, error: insertError } = await (supabase as any)
        .from('users')
        .insert(userData)
        .select('id')
        .single();

      if (insertError) {
        console.error('Error creating user:', insertError);
        console.error('Insert error details:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        });
        
        // If it's a unique constraint error, try to fetch the user again
        if (insertError.code === '23505') {
          console.log('User might already exist, trying to fetch again...');
          const { data: retryUser } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', userId)
            .single();
          
          if ((retryUser as any)?.id) {
            console.log('Found user on retry:', (retryUser as any).id);
            return (retryUser as any).id;
          }
        }
        
        throw insertError;
      }

      console.log('Created new user:', newUser?.id);
      return newUser?.id || null;
    } catch (error) {
      console.error('Error in ensureUserExists:', error);
      
      if (error instanceof Error) {
        throw new Error(`User account error: ${error.message}`);
      } else {
        throw new Error('Failed to create or find user account');
      }
    }
  };

  // Upload file to storage
  const uploadFile = async (file: File, path: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('posts')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('posts')
      .getPublicUrl(path);

    return publicUrl;
  };

  // Create post record
  const createPost = async (
    userId: string,
    fileUrl: string,
    thumbnailUrl: string | null
  ): Promise<string | null> => {
    const postData = {
      user_id: userId,
      title: title.trim(),
      description: description.trim() || null,
      category,
      file_url: fileUrl,
      thumbnail_url: thumbnailUrl,
      ai_model: aiModel && aiModel !== 'none' ? aiModel : null,
      prompt: prompt.trim() || null,
    };

    const { data: post, error } = await (supabase as any)
      .from('posts')
      .insert(postData)
      .select('id')
      .single();

    if (error) throw error;
    return post?.id || null;
  };

  // Add hashtags to post
  const addHashtagsToPost = async (postId: string, tags: string[]) => {
    if (tags.length === 0) return;

    try {
      await (supabase.rpc as any)('add_hashtags_to_post', {
        p_post_id: postId,
        p_hashtags: tags,
      });
    } catch (error) {
      console.error('Error adding hashtags:', error);
      // Non-critical error, don't fail the upload
    }
  };

  // Main upload handler
  const handleUpload = async () => {
    if (!isSignedIn || !userId) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to upload content',
        variant: 'destructive',
      });
      router.push('/sign-in?redirect=/upload');
      return;
    }

    if (!validateForm() || !file) return;

    setUploadState({
      loading: true,
      progress: 10,
      error: null,
    });

    try {
      // Step 1: Ensure user exists (10-20%)
      setUploadState(prev => ({ ...prev, progress: 20 }));
      const dbUserId = await ensureUserExists(userId);
      if (!dbUserId) throw new Error('Failed to get user ID');

      // Step 2: Upload file (20-60%)
      setUploadState(prev => ({ ...prev, progress: 40 }));
      const storagePath = generateStoragePath(category, dbUserId, file.name);
      const fileUrl = await uploadFile(file, storagePath);
      
      // Step 3: Generate thumbnail URL (60-70%)
      setUploadState(prev => ({ ...prev, progress: 70 }));
      const thumbnailUrl = (category === 'photo' || category === 'gif') ? fileUrl : null;

      // Step 4: Create post record (70-85%)
      setUploadState(prev => ({ ...prev, progress: 85 }));
      const postId = await createPost(dbUserId, fileUrl, thumbnailUrl);
      if (!postId) throw new Error('Failed to create post');

      // Step 5: Add hashtags (85-95%)
      setUploadState(prev => ({ ...prev, progress: 95 }));
      await addHashtagsToPost(postId, hashtags);

      // Step 6: Success (95-100%)
      setUploadState(prev => ({ ...prev, progress: 100 }));
      
      toast({
        title: 'Upload successful!',
        description: 'Your content has been uploaded and is now live',
      });

      // Navigate to the post
      router.push(`/post/${postId}`);
    } catch (error) {
      console.error('Upload error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      setUploadState({
        loading: false,
        progress: 0,
        error: errorMessage,
      });
      
      toast({
        title: 'Upload failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Unauthenticated state
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <CardTitle>Authentication Required</CardTitle>
              </div>
              <CardDescription>
                Please sign in to upload content to VibeAI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => router.push('/sign-in?redirect=/upload')}
              >
                Sign In to Continue
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Main upload interface
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-20 pb-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Upload Content</CardTitle>
              <CardDescription>
                Share your AI-generated creations with the community
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title Input */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Give your creation a catchy title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  disabled={uploadState.loading}
                />
                <p className="text-xs text-muted-foreground">
                  {title.length}/100 characters
                </p>
              </div>

              {/* Description Input */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your creation (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={3}
                  disabled={uploadState.loading}
                />
                <p className="text-xs text-muted-foreground">
                  {description.length}/500 characters
                </p>
              </div>

              {/* Category Selection */}
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select 
                  value={category} 
                  onValueChange={(value) => setCategory(value as PostCategory)}
                  disabled={uploadState.loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_CONFIG.map((option) => {
                      const Icon = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* AI Generation Details */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Wand2 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">AI Generation Details</h3>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </div>
                
                {/* AI Model Selection */}
                <div className="space-y-2">
                  <Label htmlFor="aiModel">AI Model Used</Label>
                  <Select 
                    value={aiModel} 
                    onValueChange={setAiModel}
                    disabled={uploadState.loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select the AI model (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None / Not AI Generated</SelectItem>
                      {aiModels.map((model) => (
                        <SelectItem key={model.id} value={model.name}>
                          <div>
                            <div className="font-medium">{model.name}</div>
                            {model.provider && (
                              <div className="text-xs text-muted-foreground">{model.provider}</div>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Prompt Input */}
                <div className="space-y-2">
                  <Label htmlFor="prompt">Prompt Used</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Share the prompt you used to generate this content (optional)"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    maxLength={2000}
                    rows={3}
                    className="resize-none"
                    disabled={uploadState.loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Help others learn by sharing your prompt ({prompt.length}/2000)
                  </p>
                </div>
              </div>

              {/* Hashtags Section */}
              <div className="space-y-2">
                <Label htmlFor="hashtags">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Hashtags
                  </div>
                </Label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      id="hashtags"
                      placeholder="Add hashtags (press Enter or comma to add)"
                      value={hashtagInput}
                      onChange={(e) => setHashtagInput(e.target.value)}
                      onKeyDown={handleHashtagKeyPress}
                      disabled={hashtags.length >= MAX_HASHTAGS || uploadState.loading}
                    />
                    <Button
                      type="button"
                      onClick={addHashtag}
                      disabled={hashtags.length >= MAX_HASHTAGS || uploadState.loading}
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>
                  {hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {hashtags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          #{tag}
                          <button
                            type="button"
                            onClick={() => removeHashtag(tag)}
                            className="ml-1 hover:text-destructive"
                            disabled={uploadState.loading}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {hashtags.length}/{MAX_HASHTAGS} hashtags
                  </p>
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label>
                  File <span className="text-destructive">*</span>
                </Label>
                <div
                  {...getRootProps()}
                  className={`
                    border-2 border-dashed rounded-lg p-8 text-center transition-colors
                    ${uploadState.loading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                  `}
                >
                  <input {...getInputProps()} disabled={uploadState.loading} />
                  
                  {preview ? (
                    <div className="space-y-4">
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="max-h-64 mx-auto rounded-lg object-contain" 
                      />
                      <p className="text-sm text-muted-foreground">{file?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file?.size || 0) / (1024 * 1024) < 1 
                          ? `${((file?.size || 0) / 1024).toFixed(2)} KB`
                          : `${((file?.size || 0) / (1024 * 1024)).toFixed(2)} MB`}
                      </p>
                    </div>
                  ) : file ? (
                    <div className="space-y-4">
                      <Video className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {isDragActive ? 'Drop the file here' : 'Drag & drop or click to upload'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Max file size: {FILE_SIZE_LIMIT / (1024 * 1024)}MB
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Accepted formats: {CATEGORY_CONFIG.find(c => c.value === category)?.accept.join(', ')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Display */}
              {uploadState.error && (
                <div className="p-4 border border-destructive rounded-lg bg-destructive/10">
                  <p className="text-sm text-destructive">{uploadState.error}</p>
                </div>
              )}

              {/* Progress Bar */}
              {uploadState.loading && uploadState.progress > 0 && (
                <div className="space-y-2">
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadState.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Uploading... {uploadState.progress}%
                  </p>
                </div>
              )}

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={uploadState.loading || !file || !title.trim()}
                className="w-full"
                size="lg"
              >
                {uploadState.loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading... {uploadState.progress}%
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}