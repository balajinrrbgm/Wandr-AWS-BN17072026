'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Globe, Sparkles, Users, Zap, Star, MapPin, Calendar, DollarSign } from 'lucide-react'

const HERO_DESTINATIONS = [
  { name: 'Kyoto', country: 'Japan', emoji: '⛩️', color: 'from-rose-400 to-orange-400' },
  { name: 'Santorini', country: 'Greece', emoji: '🏛️', color: 'from-blue-400 to-cyan-400' },
  { name: 'Patagonia', country: 'Argentina', emoji: '🏔️', color: 'from-emerald-400 to-teal-400' },
  { name: 'Marrakech', country: 'Morocco', emoji: '🕌', color: 'from-amber-400 to-orange-400' },
]

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI Itinerary Generator',
    description: 'Describe your dream trip in plain English. Our AI creates a complete day-by-day plan in under 3 seconds using semantic search across 50,000+ destinations.',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Users,
    title: 'Collaborative Planning',
    description: 'Invite your travel crew. Everyone edits the same live itinerary — no more WhatsApp chaos or conflicting Google Docs.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Zap,
    title: 'Real-Time Price Alerts',
    description: 'Set your budget. Our Aurora PostgreSQL triggers watch prices 24/7 and notify you the moment deals drop below your threshold.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Globe,
    title: 'Travel Memory',
    description: 'Every trip you take feeds your personal preference profile. Wandr learns you love boutique hotels, street food, and sunrise hikes.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
]

const STATS = [
  { value: '50K+', label: 'Destinations in AI knowledge base' },
  { value: '<3s', label: 'Average itinerary generation time' },
  { value: '7hrs', label: 'Average planning time saved per trip' },
  { value: '99.9%', label: 'Aurora PostgreSQL uptime SLA' },
]

const PRICING = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for occasional travelers',
    features: ['3 trips/month', 'AI itinerary generation', 'Basic collaboration (2 people)', '7-day price tracking'],
    cta: 'Get Started Free',
    highlight: false,
  },
  {
    name: 'Explorer',
    price: '$9',
    period: '/month',
    description: 'For the regular adventurer',
    features: ['Unlimited trips', 'AI itinerary generation', 'Collaboration (10 people)', '90-day price tracking', 'PDF export', 'Email alerts'],
    cta: 'Start Explorer',
    highlight: true,
  },
  {
    name: 'Nomad',
    price: '$19',
    period: '/month',
    description: 'For serious travelers',
    features: ['Everything in Explorer', 'Collaboration (unlimited)', '365-day price tracking', 'Priority AI (GPT-4o)', 'Trip analytics', 'API access'],
    cta: 'Go Nomad',
    highlight: false,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Globe className="w-7 h-7 text-wandr-400" />
            <span className="text-xl font-bold gradient-text">Wandr</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/signin"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signin"
              className="flex items-center gap-2 bg-wandr-600 hover:bg-wandr-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Start planning <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-16">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-wandr-600/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-coral-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-wandr-500/10 border border-wandr-500/20 rounded-full px-4 py-2 text-sm text-wandr-300 mb-8">
              <Sparkles className="w-4 h-4" />
              AI-powered travel planning, built on Aurora PostgreSQL
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Stop spending{' '}
              <span className="gradient-text">7 hours</span>
              <br />
              planning your next trip
            </h1>

            <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
              Wandr uses AI + semantic search to generate complete travel itineraries in seconds.
              Collaborate with your travel crew, track prices in real-time, and build a travel
              profile that gets smarter with every trip.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/auth/signin"
                className="flex items-center gap-2 bg-wandr-600 hover:bg-wandr-500 text-white font-semibold px-8 py-4 rounded-xl transition-all hover:scale-105 text-lg shadow-lg shadow-wandr-900/30"
              >
                Plan Your First Trip Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="https://youtube.com/wandr-demo"
                className="flex items-center gap-2 glass text-white/80 hover:text-white px-8 py-4 rounded-xl transition-all"
              >
                Watch 2-min demo
              </Link>
            </div>

            {/* Floating destination cards */}
            <div className="flex flex-wrap justify-center gap-3">
              {HERO_DESTINATIONS.map((dest, i) => (
                <motion.div
                  key={dest.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className={`flex items-center gap-2 glass rounded-full px-4 py-2 text-sm`}
                >
                  <span>{dest.emoji}</span>
                  <span className="font-medium">{dest.name}</span>
                  <span className="text-white/40">{dest.country}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything you need to travel{' '}
              <span className="gradient-text">smarter</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Wandr combines AI, real-time databases, and collaborative tools into one beautifully
              simple planning experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-dark rounded-2xl p-8 hover:bg-white/5 transition-colors group"
              >
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-white/50 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — AI Demo section */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent to-wandr-950/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">See the AI in action</h2>
            <p className="text-white/50">Type a trip description and watch Wandr build your itinerary</p>
          </div>

          {/* Simulated AI input */}
          <div className="glass-dark rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-white/30 text-xs ml-2">wandr.app/plan</span>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-white/70 text-sm font-mono">
              &quot;I want a 10-day Japan trip in October for 2 people who love food, temples, and off-the-beaten-path experiences. Budget around $4,000 total.&quot;
            </div>
            <div className="mt-4 flex items-center gap-2 text-wandr-400 text-sm">
              <Sparkles className="w-4 h-4 animate-pulse" />
              Generating itinerary with Aurora PostgreSQL semantic search...
            </div>
          </div>

          {/* Simulated result */}
          <div className="glass-dark rounded-2xl p-6 border border-wandr-500/20">
            <div className="flex items-center gap-2 mb-5">
              <MapPin className="w-5 h-5 text-wandr-400" />
              <span className="font-semibold">Japan — October 1–10 · 2 travelers · $3,847 estimated</span>
              <span className="ml-auto flex items-center gap-1 text-amber-400 text-sm">
                <Star className="w-4 h-4 fill-amber-400" />
                95% match to your travel style
              </span>
            </div>
            {[
              { day: 'Day 1–3', location: 'Tokyo', activities: 'Tsukiji morning market, Yanaka old town, Omoide Yokocho (Memory Lane)', type: 'food + culture' },
              { day: 'Day 4–5', location: 'Nikko', activities: 'UNESCO Toshogu Shrine, Kegon Falls hike, Edo period hot springs', type: 'temples + nature' },
              { day: 'Day 6–8', location: 'Kyoto', activities: 'Fushimi Inari at sunrise, Nishiki Market, Arashiyama bamboo grove', type: 'food + temples' },
              { day: 'Day 9–10', location: 'Osaka', activities: 'Dotonbori food crawl, Kuromon market, Shinsekai street food', type: 'food heaven' },
            ].map((item) => (
              <div key={item.day} className="flex items-start gap-4 py-3 border-b border-white/5 last:border-0">
                <div className="text-xs text-white/40 w-16 shrink-0 mt-1">{item.day}</div>
                <div>
                  <div className="font-medium text-white">{item.location}</div>
                  <div className="text-sm text-white/50 mt-0.5">{item.activities}</div>
                </div>
                <span className="ml-auto text-xs text-wandr-400 bg-wandr-500/10 px-2 py-1 rounded-full shrink-0">{item.type}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-white/50">Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PRICING.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`rounded-2xl p-8 flex flex-col ${
                  plan.highlight
                    ? 'bg-wandr-600 ring-2 ring-wandr-400 scale-105'
                    : 'glass-dark'
                }`}
              >
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                  <p className="text-white/50 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-white/50">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <span className="text-xs">✓</span>
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signin"
                  className={`w-full text-center py-3 rounded-xl font-semibold transition-all ${
                    plan.highlight
                      ? 'bg-white text-wandr-700 hover:bg-white/90'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-wandr-400" />
            <span className="font-semibold">Wandr</span>
          </div>
          <p className="text-white/30 text-sm">
            Built with ❤️ on Aurora PostgreSQL + Vercel for H0 Hackathon · #H0Hackathon
          </p>
          <div className="flex items-center gap-4 text-sm text-white/40">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
