import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Apple, Camera, Calendar, MessageCircle, Send, Youtube, Users, LogOut, TrendingUp } from 'lucide-react';
import gymBackground from '@/assets/gymbackgroundprem.jpg';
import logo from '@/assets/fitin-final-logo.jpg';
import { supabase } from '@/integrations/supabase/client';

const Premium = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Promit Bhar');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div 
      className="min-h-screen relative bg-cover bg-center"
      style={{ backgroundImage: `url(${gymBackground})` }}
    >
      <div className="absolute inset-0 bg-black/70" />
      
      {/* Header */}
      <div className="relative z-10 border-b border-border/30 bg-background/10 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logo} alt="FitIn Premium" className="h-12 w-auto" />
              <div>
                <h1 className="text-xl font-bold text-white">FitIn Premium</h1>
                <p className="text-sm text-white/70">Welcome back, {userName}!</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-white hover:text-primary"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white flex items-center justify-center gap-3">
            <TrendingUp className="w-10 h-10 text-primary" />
            Your Fitness Journey
          </h2>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto">
            Track your progress, plan your meals, and connect with the community to achieve your fitness goals.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            onClick={() => navigate('/premium/dashboard')}
            className="cursor-pointer group"
          >
            <Card className="glass-card p-8 rounded-2xl hover:shadow-lavender-glow transition-all duration-300 h-full">
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 p-4 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Apple className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">Nutrition Tracker</h3>
              <p className="text-white/70">Track your daily meals and calories</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onClick={() => navigate('/progress-gallery')}
            className="cursor-pointer group"
          >
            <Card className="glass-card p-8 rounded-2xl hover:shadow-lavender-glow transition-all duration-300 h-full">
              <div className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 p-4 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Camera className="w-10 h-10 text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">Progress Gallery</h3>
              <p className="text-white/70">Upload and view your progress photos</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onClick={() => navigate('/diet-planner')}
            className="cursor-pointer group"
          >
            <Card className="glass-card p-8 rounded-2xl hover:shadow-lavender-glow transition-all duration-300 h-full">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-4 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">Meal Planner</h3>
              <p className="text-white/70">Plan your weekly meals</p>
            </Card>
          </motion.div>
        </div>

        {/* Community Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="glass-card p-8 rounded-2xl">
            <h3 className="text-3xl font-bold mb-6 text-white text-center">Join Our Community</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-3 p-6 bg-background/20 rounded-xl border border-border/30 hover:border-green-500/50 hover:bg-green-500/10 transition-all group"
              >
                <MessageCircle className="w-10 h-10 text-green-400 group-hover:scale-110 transition-transform" />
                <span className="text-white font-semibold">WhatsApp</span>
              </a>

              <a
                href="https://telegram.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-3 p-6 bg-background/20 rounded-xl border border-border/30 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all group"
              >
                <Send className="w-10 h-10 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-white font-semibold">Telegram</span>
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-3 p-6 bg-background/20 rounded-xl border border-border/30 hover:border-red-500/50 hover:bg-red-500/10 transition-all group"
              >
                <Youtube className="w-10 h-10 text-red-400 group-hover:scale-110 transition-transform" />
                <span className="text-white font-semibold">YouTube</span>
              </a>

              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-3 p-6 bg-background/20 rounded-xl border border-border/30 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all group"
              >
                <Users className="w-10 h-10 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-white font-semibold">Discord</span>
              </a>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t border-border/30 bg-background/10 backdrop-blur-md py-4">
        <p className="text-center text-white/60 text-sm">© 2024 FitIn. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Premium;
