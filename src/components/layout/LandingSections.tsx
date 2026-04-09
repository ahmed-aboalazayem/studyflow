"use client"

import { motion } from "framer-motion"
import { Target, Zap, Trophy, CloudSync, Shield, Heart, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

const FEATURES = [
  {
    icon: <Target className="w-6 h-6 text-emerald-400" />,
    title: "Intelligent Tracking",
    description: "Monitor watch history, precision progress percentages, and daily study streaks effortlessly.",
    color: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/20"
  },
  {
    icon: <Zap className="w-6 h-6 text-primary" />,
    title: "Deep Focus Mode",
    description: "Built-in productivity sessions with floating timers to block distractions and keep you in the zone.",
    color: "from-primary/20 to-primary/5",
    border: "border-primary/20"
  },
  {
    icon: <Trophy className="w-6 h-6 text-amber-400" />,
    title: "Premium Gamification",
    description: "Earn Royal Crowns, maintain burning streaks, and climb the leaderboard as you conquer your courses.",
    color: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/20"
  },
  {
    icon: <CloudSync className="w-6 h-6 text-blue-400" />,
    title: "Real-Time Sync",
    description: "Your progress, notes, and checkpoints are seamlessly synchronized across all your devices.",
    color: "from-blue-500/20 to-blue-500/5",
    border: "border-blue-500/20"
  }
]

export function LandingSections() {
  const { user } = useAuth()

  return (
    <div className="w-full relative z-10 flex flex-col items-center">
      {/* Features Section */}
      <section className="w-full py-16 sm:py-24 md:py-32 relative overflow-hidden text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <span className="text-[10px] font-black uppercase text-primary tracking-[0.3em] mb-4 block">Powering Your Growth</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 leading-tight">
              Everything you need to master any subject
            </h2>
            <p className="text-foreground/60 text-base md:text-lg px-2">
              We built StudyFlow to transform the chaos of self-education into a streamlined, highly addictive journey to excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto text-left">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`glass bg-gradient-to-br ${feature.color} border ${feature.border} rounded-[2rem] p-6 sm:p-8 relative overflow-hidden group transition-transform duration-500`}
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 transition-all duration-700 pointer-events-none">
                  {feature.icon}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-black/40 flex items-center justify-center mb-6 border border-white/5 backdrop-blur-md">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-foreground/60 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-16 sm:py-24 border-t border-white/5 bg-black/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
          <span className="text-[10px] font-black uppercase text-primary tracking-[0.3em] mb-4 block">The Process</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter mb-12 md:mb-16">
            Your Journey to Mastery
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 max-w-5xl mx-auto relative">
            {/* Horizontal line for desktop */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />
            
            {/* Vertical line for mobile */}
            <div className="block md:hidden absolute top-10 bottom-10 left-1/2 w-[2px] -translate-x-1/2 bg-gradient-to-b from-primary/0 via-primary/40 to-primary/0" />
            
            {[
              {
                step: "01",
                title: "Build Your Curriculum",
                desc: "Import or create your courses. Break down huge video series into manageable day-by-day chunks to avoid overwhelm."
              },
              {
                step: "02",
                title: "Enter Deep Focus",
                desc: "Activate the floating timer. Silence distractions and immerse yourself completely in the material for optimum retention."
              },
              {
                step: "03",
                title: "Watch Your Streak Burn",
                desc: "Mark videos as done. Watch your progress rings fill up, your streak ignite, and claim the leaderboard crown."
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
                className="relative flex flex-col items-center group pt-2 md:pt-0"
              >
                <div className="w-24 h-24 rounded-full bg-black/60 border-2 border-primary/30 flex items-center justify-center mb-6 relative z-10 shadow-[0_0_30px_rgba(255,31,31,0.1)] group-hover:border-primary group-hover:shadow-[0_0_40px_rgba(255,31,31,0.4)] transition-all duration-500 backdrop-blur-xl">
                  <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-foreground/60 leading-relaxed px-4">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="w-full py-20 sm:py-32 relative overflow-hidden flex items-center justify-center border-t border-white/5 bg-gradient-to-b from-transparent to-primary/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[300px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto flex flex-col items-center"
          >
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter mx-auto mb-6 md:mb-8 leading-tight">
              Ready to crush your goals?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-foreground/70 mb-8 md:mb-10 font-medium leading-relaxed px-2">
              Join StudyFlow today. Transform the way you learn, build unbreakable habits, and rule your own leaderboard.
            </p>
            <Link href={user ? "/dashboard" : "/login"} className="w-full sm:w-auto block px-4 sm:px-0">
              <Button className="w-full sm:w-auto h-14 md:h-16 px-8 md:px-10 text-lg md:text-xl font-black bg-white text-black hover:bg-white/90 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all rounded-full group">
                {user ? "Go to Dashboard" : "Get Started for Free"}
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6 ml-2 md:ml-3 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
