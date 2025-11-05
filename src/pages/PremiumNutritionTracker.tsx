import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coffee, Sun, Moon, Apple as AppleIcon, Droplets, LogOut, ArrowLeft, ArrowRight, Camera, Upload, Users, CheckCircle2 } from 'lucide-react';
import logo from '@/assets/fitin-final-logo.jpg';
import { MealCard } from '@/components/nutrition/MealCard';
import { Macronutrients } from '@/components/nutrition/Macronutrients';
import { RestDayCalendar } from '@/components/nutrition/RestDayCalendar';
import { QuickActions } from '@/components/nutrition/QuickActions';
import { NutritionInsights } from '@/components/nutrition/NutritionInsights';
import { WaterIntake } from '@/components/nutrition/WaterIntake';
import { BarcodeScanner } from '@/components/nutrition/BarcodeScanner';
import { TrainerSupport } from '@/components/nutrition/TrainerSupport';
import { StrengthProgressionChart } from '@/components/nutrition/StrengthProgressionChart';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { z } from 'zod';

const PremiumNutritionTracker = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('today');
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [step, setStep] = useState<'welcome' | 'calculator' | 'goal' | 'photo' | 'community' | 'tracker'>('welcome');
  const [maintenanceCalories, setMaintenanceCalories] = useState(2000);
  const [goal, setGoal] = useState<'maintain' | 'cut' | 'bulk'>('maintain');
  
  // Calculator inputs
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'very-active'>('moderate');
  
  // Photo upload
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user plan
  const { data: userPlan } = useQuery({
    queryKey: ['user-plan'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data } = await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      return data;
    },
  });

  const isPaidPlan = userPlan?.plan_type === 'paid';

  // Redirect to free tracker if user doesn't have paid plan
  useEffect(() => {
    if (userPlan && !isPaidPlan) {
      navigate('/nutrition-tracker');
    }
  }, [userPlan, isPaidPlan, navigate]);

  const calculateCalories = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);
    
    if (!w || !h || !a) {
      toast.error('Please fill all fields');
      return;
    }
    
    // Mifflin-St Jeor Equation
    let bmr = gender === 'male' 
      ? (10 * w) + (6.25 * h) - (5 * a) + 5
      : (10 * w) + (6.25 * h) - (5 * a) - 161;
    
    // Activity multipliers
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      'very-active': 1.9
    };
    
    const maintenance = Math.round(bmr * multipliers[activityLevel]);
    setMaintenanceCalories(maintenance);
    setStep('goal');
  };
  
  const selectGoal = (selectedGoal: 'maintain' | 'cut' | 'bulk') => {
    let targetCalories = maintenanceCalories;
    
    if (selectedGoal === 'cut') {
      targetCalories = Math.round(maintenanceCalories * 0.8);
    } else if (selectedGoal === 'bulk') {
      targetCalories = Math.round(maintenanceCalories * 1.15);
    }
    
    setMaintenanceCalories(targetCalories);
    setGoal(selectedGoal);
    setStep('photo');
  };
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handlePhotoSubmit = () => {
    if (!uploadedPhoto) {
      toast.error('Please upload a photo to continue');
      return;
    }
    setStep('community');
  };
  
  const handleCommunityJoin = () => {
    toast.success('Welcome to the FitIn community!');
    setStep('tracker');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const meals = [
    { type: 'breakfast', label: 'Breakfast', calories: 350, icon: Coffee, color: 'bg-orange-500' },
    { type: 'lunch', label: 'Lunch', calories: 420, icon: Sun, color: 'bg-yellow-500' },
    { type: 'dinner', label: 'Dinner', calories: 312, icon: Moon, color: 'bg-purple-500' },
    { type: 'snacks', label: 'Snacks', calories: 174, icon: AppleIcon, color: 'bg-green-500' },
  ];

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);

  // Welcome Step
  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center relative z-10"
        >
          <motion.img 
            src={logo} 
            alt="FitIn Premium" 
            className="h-24 w-auto mx-auto mb-8"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            Welcome to <span className="text-gradient">Premium</span>
          </motion.h1>
          
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-2xl mx-auto"
          >
            Your transformation starts today
          </motion.p>
          
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-lg text-primary/80 mb-12 max-w-xl mx-auto font-medium"
          >
            "The only bad workout is the one that didn't happen"
          </motion.p>
          
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <Button
              size="lg"
              onClick={() => setStep('calculator')}
              className="text-lg px-12 py-6 bg-gradient-to-r from-primary to-primary/80 hover:shadow-lavender-glow group"
            >
              Join Now 
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }
  
  // Calculator Step
  if (step === 'calculator') {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <Card className="glass-card p-8 rounded-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Calculate Your Calories</h2>
              <p className="text-muted-foreground">Let's personalize your nutrition plan</p>
            </div>
            
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-background/50 border border-border/50 rounded-lg px-4 py-3 focus:border-primary focus:outline-none"
                    placeholder="70"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Height (cm)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-background/50 border border-border/50 rounded-lg px-4 py-3 focus:border-primary focus:outline-none"
                    placeholder="175"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-background/50 border border-border/50 rounded-lg px-4 py-3 focus:border-primary focus:outline-none"
                    placeholder="25"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                    className="w-full bg-background/50 border border-border/50 rounded-lg px-4 py-3 focus:border-primary focus:outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Activity Level</label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as any)}
                  className="w-full bg-background/50 border border-border/50 rounded-lg px-4 py-3 focus:border-primary focus:outline-none"
                >
                  <option value="sedentary">Sedentary (little to no exercise)</option>
                  <option value="light">Light (1-3 days/week)</option>
                  <option value="moderate">Moderate (3-5 days/week)</option>
                  <option value="active">Active (6-7 days/week)</option>
                  <option value="very-active">Very Active (2x per day)</option>
                </select>
              </div>
              
              <Button
                onClick={calculateCalories}
                className="w-full py-6 text-lg"
              >
                Calculate My Calories
                <ArrowRight className="ml-2" />
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }
  
  // Goal Selection Step
  if (step === 'goal') {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          <div className="text-center mb-12">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block glass-card px-6 py-3 rounded-full mb-6"
            >
              <p className="text-sm text-muted-foreground">Your Maintenance Calories</p>
              <p className="text-3xl font-bold text-gradient">{maintenanceCalories} kcal/day</p>
            </motion.div>
            
            <h2 className="text-4xl font-bold mb-3">Choose Your Goal</h2>
            <p className="text-muted-foreground text-lg">Select what you want to achieve</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => selectGoal('cut')}
              className="glass-card p-8 rounded-2xl cursor-pointer hover:border-primary/50 border-2 border-transparent transition-all group"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                  <span className="text-3xl">🔥</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">Cut</h3>
                <p className="text-muted-foreground mb-4">Lose fat, get lean</p>
                <p className="text-xl font-bold text-red-500">{Math.round(maintenanceCalories * 0.8)} kcal</p>
                <p className="text-sm text-muted-foreground">20% deficit</p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => selectGoal('maintain')}
              className="glass-card p-8 rounded-2xl cursor-pointer hover:border-primary/50 border-2 border-transparent transition-all group"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <span className="text-3xl">⚖️</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">Maintain</h3>
                <p className="text-muted-foreground mb-4">Stay at current weight</p>
                <p className="text-xl font-bold text-blue-500">{maintenanceCalories} kcal</p>
                <p className="text-sm text-muted-foreground">Maintenance</p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => selectGoal('bulk')}
              className="glass-card p-8 rounded-2xl cursor-pointer hover:border-primary/50 border-2 border-transparent transition-all group"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                  <span className="text-3xl">💪</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">Bulk</h3>
                <p className="text-muted-foreground mb-4">Build muscle mass</p>
                <p className="text-xl font-bold text-green-500">{Math.round(maintenanceCalories * 1.15)} kcal</p>
                <p className="text-sm text-muted-foreground">15% surplus</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }
  
  // Photo Upload Step
  if (step === 'photo') {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <Card className="glass-card p-8 rounded-2xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                <Camera className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Upload Your Photo</h2>
              <p className="text-muted-foreground">Track your transformation journey</p>
              <p className="text-sm text-red-400 mt-2">* Required to continue</p>
            </div>
            
            <div className="mb-8">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              
              {!uploadedPhoto ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border/50 rounded-2xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors group"
                >
                  <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <p className="text-lg font-medium mb-2">Click to upload</p>
                  <p className="text-sm text-muted-foreground">Take a before photo to track progress</p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={uploadedPhoto}
                    alt="Uploaded"
                    className="w-full h-80 object-cover rounded-2xl"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute top-4 right-4"
                  >
                    Change Photo
                  </Button>
                </div>
              )}
            </div>
            
            <Button
              onClick={handlePhotoSubmit}
              disabled={!uploadedPhoto}
              className="w-full py-6 text-lg"
            >
              Continue
              <ArrowRight className="ml-2" />
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }
  
  // Community Step
  if (step === 'community') {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <Card className="glass-card p-12 rounded-2xl text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center"
            >
              <Users className="w-12 h-12 text-primary" />
            </motion.div>
            
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold mb-4"
            >
              Join the <span className="text-gradient">Community</span>
            </motion.h2>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-muted-foreground mb-8"
            >
              Connect with thousands of members on their fitness journey
            </motion.p>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-4 mb-8"
            >
              {[
                'Share your progress and inspire others',
                'Get support from certified trainers',
                'Join challenges and earn rewards',
                'Access exclusive meal plans'
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-3 text-left"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <Button
                onClick={handleCommunityJoin}
                size="lg"
                className="w-full py-6 text-lg bg-gradient-to-r from-primary to-primary/80 hover:shadow-lavender-glow"
              >
                Join Community
                <ArrowRight className="ml-2" />
              </Button>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Show main tracker
  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <img src={logo} alt="FitIn" className="h-12 w-auto" />
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="text-muted-foreground hover:text-primary gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-primary gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="text-gradient">Premium Nutrition Tracker</span>
              </h1>
              <p className="text-muted-foreground">
                Your goal: <span className="font-semibold text-primary capitalize">{goal}</span> • Target: {maintenanceCalories} kcal/day
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                ✨ Meal plans and calendar managed by certified trainers
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="glass-card p-1 mb-8">
              <TabsTrigger value="today" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Today
              </TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Insights
              </TabsTrigger>
            </TabsList>

            {/* Today Tab */}
            <TabsContent value="today" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Meals */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Meal Cards */}
                  <div className="glass-card p-6 rounded-2xl">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {meals.map((meal) => (
                        <MealCard
                          key={meal.type}
                          type={meal.type}
                          label={meal.label}
                          calories={meal.calories}
                          icon={meal.icon}
                          color={meal.color}
                          onClick={() => setSelectedMealType(meal.type)}
                          isSelected={selectedMealType === meal.type}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Water Intake & Barcode Scanner */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <WaterIntake />
                    <BarcodeScanner />
                  </div>

                  {/* Quick Actions */}
                  <QuickActions />

                  {/* Strength Progression Chart */}
                  <StrengthProgressionChart />
                </div>

                {/* Right Column - Stats */}
                <div className="space-y-6">
                  {/* Macronutrients */}
                  <Macronutrients selectedMeal={selectedMealType} />

                  {/* Trainer Support */}
                  <TrainerSupport />

                  {/* Rest Day Calendar */}
                  <RestDayCalendar />
                </div>
              </div>
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights">
              <NutritionInsights />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default PremiumNutritionTracker;
