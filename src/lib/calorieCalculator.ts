// Dynamic calorie and macronutrient calculator

export interface UserDetails {
  age: number;
  weight: number; // in kg
  height: number; // in cm
  gender: 'male' | 'female';
  activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
}

export interface MacroGoals {
  maintenanceCalories: number;
  targetCalories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
}

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

export const calculateMaintenanceCalories = (details: UserDetails): number => {
  // Mifflin-St Jeor Equation
  const { age, weight, height, gender, activity_level } = details;
  
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  const maintenance = Math.round(bmr * ACTIVITY_MULTIPLIERS[activity_level]);
  return maintenance;
};

export const calculateMacros = (
  maintenanceCalories: number,
  goalType: 'maintain' | 'cut' | 'bulk',
  weight: number
): MacroGoals => {
  let targetCalories: number;
  
  // Calculate target calories based on goal
  if (goalType === 'cut') {
    targetCalories = Math.round(maintenanceCalories * 0.8); // 20% deficit
  } else if (goalType === 'bulk') {
    targetCalories = Math.round(maintenanceCalories * 1.15); // 15% surplus
  } else {
    targetCalories = maintenanceCalories;
  }
  
  // Protein: 2g per kg body weight
  const protein = Math.round(weight * 2);
  
  // Fat: 25% of total calories
  const fatCalories = Math.round(targetCalories * 0.25);
  const fat = Math.round(fatCalories / 9); // 9 calories per gram of fat
  
  // Carbs: remaining calories
  const proteinCalories = protein * 4; // 4 calories per gram of protein
  const carbCalories = targetCalories - proteinCalories - fatCalories;
  const carbs = Math.round(carbCalories / 4); // 4 calories per gram of carbs
  
  return {
    maintenanceCalories,
    targetCalories,
    protein,
    carbs,
    fat,
  };
};
