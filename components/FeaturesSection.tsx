'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Download, TrendingUp, Award, Clock, Users } from 'lucide-react';

export default function FeaturesSection() {
  const stats = [
    { icon: Heart, label: 'Likes', value: '10K+', color: 'text-red-500' },
    { icon: Download, label: 'Downloads', value: '50K+', color: 'text-blue-500' },
    { icon: Users, label: 'Creators', value: '5K+', color: 'text-green-500' },
    { icon: TrendingUp, label: 'Daily Uploads', value: '500+', color: 'text-purple-500' },
  ];

  const upcomingFeatures = [
    'User Profiles & Portfolios',
    'Creator Leaderboards',
    'Curated Collections',
    'AI Chatbot Integration',
    'Social Features',
    'Advanced Filters',
  ];

  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-4xl font-bold">
            Growing <span className="text-gradient">Ecosystem</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Join thousands of creators already sharing their AI-generated content
          </p>
        </motion.div>

        <div className="mb-16 grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="text-center transition-all hover:scale-105 hover:shadow-lg">
                <CardContent className="pt-6">
                  <stat.icon className={`mx-auto mb-2 h-8 w-8 ${stat.color}`} />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl"
        >
          <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-8">
            <div className="mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Coming Soon</h3>
              <Badge variant="secondary">Roadmap</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {upcomingFeatures.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-2"
                >
                  <Award className="h-4 w-4 flex-shrink-0 text-primary" />
                  <span className="text-sm">{feature}</span>
                </motion.div>
              ))}
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              We're constantly evolving to create an Instagram-like experience for AI content
              creators
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
