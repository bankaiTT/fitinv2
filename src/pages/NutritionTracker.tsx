import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, LogOut, Plus, Trash2, Lock } from 'lucide-react';
import logo from '@/assets/fitin-final-logo.jpg';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DailyCalories } from '@/components/nutrition/DailyCalories';
import { Macronutrients } from '@/components/nutrition/Macronutrients';
import { WaterIntake } from '@/components/nutrition/WaterIntake';
import { RestDayCalendar } from '@/components/nutrition/RestDayCalendar';
import { WorkoutLogging } from '@/components/nutrition/WorkoutLogging';
import { StrengthProgressionChart } from '@/components/nutrition/StrengthProgressionChart';
import { calculateMaintenanceCalories } from '@/lib/calorieCalculator';

const NutritionTracker = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    checkAuth();
  }, [navigate]);

  // Fetch user details
  const { data: userDetails } = useQuery({
    queryKey: ['user-details'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('user_details')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Calculate maintenance calories dynamically
  const maintenanceCalories = userDetails 
    ? calculateMaintenanceCalories({
        age: userDetails.age,
        weight: userDetails.weight,
        height: userDetails.height,
        gender: userDetails.gender as 'male' | 'female',
        activity_level: userDetails.activity_level as any,
      })
    : 2100;

  // Fetch meal logs for selected date
  const { data: mealLogs = [] } = useQuery({
    queryKey: ['meal-logs', selectedDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('logged_at', selectedDate)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Add meal mutation
  const addMeal = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('meal_logs')
        .insert({
          user_id: user.id,
          meal_name: mealName,
          calories: parseInt(calories),
          protein: parseFloat(protein),
          carbs: parseFloat(carbs),
          fat: parseFloat(fat),
          meal_type: mealType,
          logged_at: selectedDate,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-logs', selectedDate] });
      toast.success('Meal added successfully');
      // Reset form
      setMealName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
    },
    onError: () => {
      toast.error('Failed to add meal');
    },
  });

  // Delete meal mutation
  const deleteMeal = useMutation({
    mutationFn: async (mealId: string) => {
      const { error } = await supabase
        .from('meal_logs')
        .delete()
        .eq('id', mealId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-logs', selectedDate] });
      toast.success('Meal deleted');
    },
  });

  // Calculate totals
  const totals = mealLogs.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + parseFloat(meal.protein.toString()),
      carbs: acc.carbs + parseFloat(meal.carbs.toString()),
      fat: acc.fat + parseFloat(meal.fat.toString()),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName || !calories || !protein || !carbs || !fat) {
      toast.error('Please fill in all fields');
      return;
    }
    addMeal.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <img src={logo} alt="FitIn" className="h-10 w-auto" />
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/premium')}
                className="border-primary/50 hover:bg-primary/10"
              >
                Upgrade to Premium
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-primary"
              >
                <LogOut className="w-4 h-4" />
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
          className="max-w-7xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Free <span className="text-gradient">Nutrition Tracker</span>
            </h1>
            <p className="text-muted-foreground">
              Track your daily calories and macros (Maintenance calories only)
            </p>
          </div>

          {/* Date Selector */}
          <Card className="glass-card p-6 rounded-2xl mb-6">
            <Label htmlFor="date">Select Date</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-2"
            />
          </Card>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <DailyCalories consumed={totals.calories} target={maintenanceCalories} />
            <Macronutrients
              protein={{ current: totals.protein, target: Math.round(userDetails?.weight * 2 || 150) }}
              carbs={{ current: totals.carbs, target: Math.round(maintenanceCalories * 0.5 / 4) }}
              fat={{ current: totals.fat, target: Math.round(maintenanceCalories * 0.25 / 9) }}
            />
            <WaterIntake />
          </div>

          {/* Add Meal Form */}
          <Card className="glass-card p-6 rounded-2xl mb-6">
            <h3 className="text-xl font-bold mb-4">Log Meal</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="meal-type">Meal Type</Label>
                <Select value={mealType} onValueChange={(value: any) => setMealType(value)}>
                  <SelectTrigger id="meal-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="meal-name">Meal Name</Label>
                <Input
                  id="meal-name"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  placeholder="e.g., Chicken breast with rice"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    placeholder="kcal"
                  />
                </div>
                <div>
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    step="0.1"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    step="0.1"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="fat">Fat (g)</Label>
                  <Input
                    id="fat"
                    type="number"
                    step="0.1"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={addMeal.isPending}>
                <Plus className="w-4 h-4 mr-2" />
                Add Meal
              </Button>
            </form>
          </Card>

          {/* Meal List */}
          <Card className="glass-card p-6 rounded-2xl mb-6">
            <h3 className="text-xl font-bold mb-4">Today's Meals</h3>
            {mealLogs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No meals logged for this date</p>
            ) : (
              <div className="space-y-3">
                {mealLogs.map((meal) => (
                  <div
                    key={meal.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase font-semibold text-primary">
                          {meal.meal_type}
                        </span>
                        <span className="font-semibold">{meal.meal_name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {meal.calories} kcal • P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMeal.mutate(meal.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Premium Features Locked */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-card p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="text-center">
                  <Lock className="w-12 h-12 mx-auto mb-3 text-primary" />
                  <p className="font-semibold mb-2">Premium Feature</p>
                  <Button onClick={() => navigate('/premium')} size="sm">
                    Upgrade Now
                  </Button>
                </div>
              </div>
              <RestDayCalendar />
            </Card>

            <Card className="glass-card p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="text-center">
                  <Lock className="w-12 h-12 mx-auto mb-3 text-primary" />
                  <p className="font-semibold mb-2">Premium Feature</p>
                  <Button onClick={() => navigate('/premium')} size="sm">
                    Upgrade Now
                  </Button>
                </div>
              </div>
              <WorkoutLogging />
            </Card>
          </div>

          <div className="mt-6">
            <Card className="glass-card p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="text-center">
                  <Lock className="w-12 h-12 mx-auto mb-3 text-primary" />
                  <p className="font-semibold mb-2">Premium Feature</p>
                  <Button onClick={() => navigate('/premium')} size="sm">
                    Upgrade Now
                  </Button>
                </div>
              </div>
              <StrengthProgressionChart />
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NutritionTracker;
