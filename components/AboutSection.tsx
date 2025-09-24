'use client';

import { motion } from 'framer-motion';
import { Zap, Users, Shield, Rocket } from 'lucide-react';

export default function AboutSection() {
  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Creativity',
      description: 'Leverage cutting-edge AI models like Google Nano Banana to create stunning content',
    },
    {
      icon: Users,
      title: 'Vibrant Community',
      description: 'Connect with fellow creators, share ideas, and get inspired by amazing work',
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'Your content is protected with enterprise-grade security and privacy controls',
    },
    {
      icon: Rocket,
      title: 'Lightning Fast',
      description: 'Optimized infrastructure ensures your content loads instantly, anywhere',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-background/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">
            Our <span className="text-gradient">Mission</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            We're building a central space where creativity meets AI technology. 
            Share your AI-generated masterpieces, discover inspiring content, 
            and connect with a community of innovative creators.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="rounded-xl p-6 bg-card hover:bg-card/80 border border-border/50 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
                <div className="rounded-lg bg-primary/10 p-3 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}