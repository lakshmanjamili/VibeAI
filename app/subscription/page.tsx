'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { 
  Check, 
  X, 
  Crown, 
  Rocket, 
  Sparkles, 
  CreditCard,
  Zap,
  Star,
  Gift,
  TrendingUp,
  Infinity
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  description: string;
  features: string[];
  limits: {
    imagen: number;
    gemini: number;
    grok: number;
    veo: number;
    nano_banana: number;
    chat_messages: number;
  };
  popular?: boolean;
  color: string;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'forever',
    description: 'Get started with AI generation',
    features: [
      'Access to all AI models',
      'Basic generation quality',
      'Community support',
      'Upload to gallery',
      'Like and comment'
    ],
    limits: {
      imagen: 10,
      gemini: 50,
      grok: 10,
      veo: 2,
      nano_banana: 20,
      chat_messages: 100
    },
    color: 'from-gray-400 to-gray-600'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 20,
    interval: 'month',
    description: 'Unlimited creativity for professionals',
    features: [
      'Everything in Free',
      '10x more generations',
      'HD quality outputs',
      'Priority processing',
      'Advanced model settings',
      'Download in multiple formats',
      'Priority support'
    ],
    limits: {
      imagen: 1000,
      gemini: 5000,
      grok: 1000,
      veo: 100,
      nano_banana: 2000,
      chat_messages: 10000
    },
    popular: true,
    color: 'from-purple-400 to-pink-600'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 100,
    interval: 'month',
    description: 'Unlimited power for teams',
    features: [
      'Everything in Pro',
      'Unlimited generations',
      'API access',
      'Custom model fine-tuning',
      'Team collaboration',
      'Analytics dashboard',
      'Dedicated support',
      'Custom integrations'
    ],
    limits: {
      imagen: -1,
      gemini: -1,
      grok: -1,
      veo: -1,
      nano_banana: -1,
      chat_messages: -1
    },
    color: 'from-amber-400 to-orange-600'
  }
];

export default function SubscriptionPage() {
  const router = useRouter();
  const { userId, isSignedIn } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (planId: string) => {
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    if (planId === 'free') {
      toast({
        title: 'Already on Free Plan',
        description: 'You are currently using the free plan',
      });
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Integrate with Stripe
      toast({
        title: 'Coming Soon!',
        description: 'Payment integration will be available soon. For now, enjoy the free tier!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process subscription',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getLimitDisplay = (limit: number) => {
    if (limit === -1) return <Infinity className="h-4 w-4 inline" />;
    return limit.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-20 pb-12">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4">
            <Crown className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Subscription Plans</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your <span className="text-gradient-supreme">AI Power</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock unlimited creativity with our AI generation tools. Start free, upgrade anytime.
          </p>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={selectedPlan === plan.id ? 'scale-105' : ''}
            >
              <Card 
                className={`relative overflow-hidden h-full ${
                  plan.popular ? 'border-primary shadow-xl' : ''
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <Badge className="rounded-bl-lg rounded-tr-lg bg-primary">
                      MOST POPULAR
                    </Badge>
                  </div>
                )}

                {/* Gradient Header */}
                <div className={`h-2 bg-gradient-to-r ${plan.color}`} />

                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      ${plan.price}
                    </span>
                    {plan.interval !== 'forever' && (
                      <span className="text-muted-foreground">/{plan.interval}</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Features */}
                  <div className="space-y-2">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Limits */}
                  <div className="pt-4 border-t space-y-2">
                    <h4 className="font-semibold text-sm mb-2">Monthly Limits</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span>Imagen:</span>
                        <span className="font-semibold">{getLimitDisplay(plan.limits.imagen)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gemini:</span>
                        <span className="font-semibold">{getLimitDisplay(plan.limits.gemini)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Grok:</span>
                        <span className="font-semibold">{getLimitDisplay(plan.limits.grok)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Veo:</span>
                        <span className="font-semibold">{getLimitDisplay(plan.limits.veo)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Nano:</span>
                        <span className="font-semibold">{getLimitDisplay(plan.limits.nano_banana)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Chat:</span>
                        <span className="font-semibold">{getLimitDisplay(plan.limits.chat_messages)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isLoading}
                  >
                    {plan.price === 0 ? 'Current Plan' : 'Subscribe Now'}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <Card className="glass-supreme">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Can I change plans anytime?</h4>
              <p className="text-sm text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">What happens when I reach my limits?</h4>
              <p className="text-sm text-muted-foreground">
                You'll need to wait for the monthly reset or upgrade your plan to continue generating content.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Do unused credits roll over?</h4>
              <p className="text-sm text-muted-foreground">
                No, credits reset monthly. Make sure to use them before your billing cycle ends!
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}