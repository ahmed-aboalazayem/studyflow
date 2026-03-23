"use client"

import * as React from "react"
import { Linkedin, Mail, Github, Globe } from "lucide-react"
import { motion } from "framer-motion"

export function Footer() {
  const [currentYear, setCurrentYear] = React.useState<number>(new Date().getFullYear())

  React.useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  return (
    <footer className="relative bg-[#030303] rounded-t-[50px] py-16 px-5 mt-auto flex flex-col items-center gap-12 border-t border-white/5 overflow-hidden">
      {/* Cosmic Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Glowing Nebulas */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-10%] right-1/4 w-[600px] h-[600px] bg-[#8b5cf6]/10 rounded-full blur-[150px]" 
        />
        
        {/* Infinite Star Field Effect */}
        <div className="absolute inset-0 opacity-20" style={{ 
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', 
          backgroundSize: '80px 80px' 
        }} />
        <div className="absolute inset-0 opacity-10" style={{ 
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', 
          backgroundSize: '120px 120px',
          backgroundPosition: '40px 40px'
        }} />
      </div>

      <div className="flex flex-col items-center gap-10 w-full max-w-6xl mx-auto relative z-10">
        {/* Profile Section */}
        <div className="flex flex-col items-center gap-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            <img 
              src="/images/profile.png" 
              alt="Ahmed Aboalazayem" 
              className="w-24 h-24 rounded-full object-cover border-2 border-white/10 shadow-2xl relative z-10" 
            />
          </motion.div>
          
          <h2 className="text-3xl font-black text-center tracking-tighter">
            <a 
              href="https://linkedin.com/in/ahmed-aboalazayem-664562326"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 group"
            >
              <span className="text-primary group-hover:scale-125 transition-transform duration-500 font-mono">&lt;</span>
              <span className="text-gradient drop-shadow-[0_0_25px_rgba(255,31,31,0.5)] transition-all duration-300 group-hover:tracking-widest">
                Ahmed Aboalazayem
              </span>
              <span className="text-primary group-hover:scale-125 transition-transform duration-500 font-mono">/&gt;</span>
            </a>
          </h2>
        </div>

        {/* Social Media Section */}
        <div className="flex justify-center items-center gap-6">
          <SocialLink 
            href="https://www.linkedin.com/in/ahmed-aboalazayem-664562326/" 
            icon={<Linkedin className="w-5 h-5" />} 
            label="LinkedIn"
          />
          <SocialLink 
            href="mailto:ahmedaboalazayem1@gmail.com" 
            icon={<Mail className="w-5 h-5" />} 
            label="Email"
          />
          <SocialLink 
            href="https://github.com/ahmed-aboalazayem" 
            icon={<Github className="w-5 h-5" />} 
            label="GitHub"
          />
          <SocialLink 
            href="https://ahmed-aboalazayem.github.io/DEPI-portfolio/" 
            icon={<Globe className="w-5 h-5" />} 
            label="Portfolio"
          />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-2">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
        <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em] text-center">
          © {currentYear} Ahmed Aboalazayem. All Rights Reserved.
        </p>
      </div>
    </footer>
  )
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <motion.a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      whileHover={{ y: -8, scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center text-white/60 transition-all duration-500 shadow-xl hover:text-primary hover:border-primary/50 hover:shadow-[0_15px_40px_rgba(255,31,31,0.25)] group relative"
    >
      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500 rounded-2xl" />
      {icon}
      <span className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black uppercase tracking-widest text-primary pointer-events-none whitespace-nowrap">
        {label}
      </span>
    </motion.a>
  )
}
