import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import gymBackground from '@/assets/gymbackgroundprem.jpg';
import logo from '@/assets/fitin-final-logo.jpg';

const PremiumWelcome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${gymBackground})` }}
      >
        <div className="absolute inset-0 bg-black/70" />
      </div>
      
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 text-center px-4"
      >
        <img src={logo} alt="FitIn Premium" className="h-20 w-auto mx-auto mb-8" />
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
          Welcome to <span className="text-gradient">Premium</span>
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto">
          Your personalized fitness journey starts here. Track nutrition, monitor progress, and achieve your goals.
        </p>
        <Button
          size="lg"
          onClick={() => navigate('/premium/details')}
          className="text-lg px-8 py-6 bg-primary hover:shadow-lavender-glow"
        >
          Get Started <ArrowRight className="ml-2" />
        </Button>
      </motion.div>
    </div>
  );
};

export default PremiumWelcome;
