# Implementation Plan

- [x] 1. Set up project foundation and shared utilities
  - [x] 1.1 Create shared types and interfaces
    - Add new types to `_mobile/ErmaJean/types/config.ts`: MealPlan, MealSlot, DayMacros, MacroGoals, ShoppingListItem, RecipeInput
    - _Requirements: 3.1, 3.3, 3.6, 4.1_
  - [x] 1.2 Create utility functions for date handling
    - Create `_mobile/ErmaJean/utils/dateUtils.ts` with functions: getWeekStart, getWeekEnd, formatDate, getDaysInWeek, isToday
    - _Requirements: 3.1, 3.5_
  - [x] 1.3 Create utility functions for macro calculations
    - Create `_mobile/ErmaJean/utils/macroCalculations.ts` with functions: calculateDayMacros, sumMacros, calculateMacroPercentage
    - _Requirements: 3.6_
  - [ ]* 1.4 Write property test for macro calculations
    - **Property 6: Daily Macro Calculation**
    - **Validates: Requirements 3.6**
  - [x] 1.5 Create validation utility functions
    - Create `_mobile/ErmaJean/utils/validation.ts` with functions: validateRecipeForm, validateGoalsForm
    - _Requirements: 7.4_
  - [ ]* 1.6 Write property test for recipe form validation
    - **Property 12: Recipe Form Validation**
    - **Validates: Requirements 7.4**

- [-] 2. Implement meal plan service layer
  - [x] 2.1 Create MealPlanService
    - Create `_mobile/ErmaJean/services/mealPlanService.ts` with methods: getMealPlans, addMealToPlan, removeMealFromPlan, clearWeekMealPlan
    - _Requirements: 3.1, 3.3, 3.4, 3.5_
  - [ ]* 2.2 Write property test for meal assignment persistence
    - **Property 4: Meal Assignment Persistence**
    - **Validates: Requirements 3.3**
  - [ ]* 2.3 Write property test for week navigation date range
    - **Property 5: Week Navigation Date Range**
    - **Validates: Requirements 3.5**

- [x] 3. Implement shopping list functionality
  - [x] 3.1 Create shopping list utility functions
    - Create `_mobile/ErmaJean/utils/shoppingListUtils.ts` with functions: aggregateIngredients, parseIngredient, categorizeIngredient, formatShoppingList
    - _Requirements: 4.1, 4.2, 4.4_
  - [ ]* 3.2 Write property test for shopping list aggregation
    - **Property 7: Shopping List Ingredient Aggregation**
    - **Validates: Requirements 4.1, 4.2**

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Enhance recipe service layer
  - [x] 5.1 Extend RecipeService with manual recipe creation
    - Update `_mobile/ErmaJean/libs/api.ts` or create `_mobile/ErmaJean/services/recipeService.ts` with methods: createRecipe, updateRecipe, deleteRecipe
    - _Requirements: 7.3_
  - [ ]* 5.2 Write property test for manual recipe persistence
    - **Property 13: Manual Recipe Persistence**
    - **Validates: Requirements 7.3**
  - [x] 5.3 Implement recipe search filtering
    - Create `_mobile/ErmaJean/utils/recipeSearch.ts` with filterRecipes function
    - _Requirements: 1.2_
  - [ ]* 5.4 Write property test for recipe search filtering
    - **Property 1: Recipe Search Filtering**
    - **Validates: Requirements 1.2**

- [x] 6. Enhance profile service layer
  - [x] 6.1 Create ProfileService with goal management
    - Create `_mobile/ErmaJean/services/profileService.ts` with methods: getProfile, updateProfile, updateMacroGoals
    - _Requirements: 6.1, 6.3_
  - [ ]* 6.2 Write property test for goal update persistence
    - **Property 10: Goal Update Persistence**
    - **Validates: Requirements 6.3**

- [ ] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Build core UI components
  - [x] 8.1 Create MealSlot component
    - Create `_mobile/ErmaJean/components/MealSlot.tsx` with swipe-to-delete gesture, recipe display, and empty state
    - _Requirements: 3.2, 3.4_
  - [x] 8.2 Create MacroCounter component
    - Create `_mobile/ErmaJean/components/MacroCounter.tsx` with progress bars for calories, protein, carbs, fat against goals
    - _Requirements: 3.6_
  - [x] 8.3 Create ShoppingListModal component
    - Create `_mobile/ErmaJean/components/ShoppingListModal.tsx` with grouped items, checkboxes, and share functionality
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [x] 8.4 Create RecipeFormModal component
    - Create `_mobile/ErmaJean/components/RecipeFormModal.tsx` with all recipe fields and optional nutrition section
    - _Requirements: 7.2, 7.5_
  - [x] 8.5 Create GoalsFormModal component
    - Create `_mobile/ErmaJean/components/GoalsFormModal.tsx` with inputs for calorie, protein, carb, fat goals
    - _Requirements: 6.2_
  - [x] 8.6 Create AddRecipeFAB component
    - Create `_mobile/ErmaJean/components/AddRecipeFAB.tsx` with expandable menu for AI generate and manual add options
    - _Requirements: 7.1_
  - [x] 8.7 Create RecipeSelectionModal component
    - Create `_mobile/ErmaJean/components/RecipeSelectionModal.tsx` for selecting recipes when adding to meal plan
    - _Requirements: 3.2_

- [x] 9. Implement Meal Plans screen
  - [x] 9.1 Create MealPlansScreen with weekly calendar view
    - Create `_mobile/ErmaJean/app/(tabs)/meal-plans.tsx` with week navigation, day cards, meal slots, and macro counters
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  - [ ]* 9.2 Write property test for weekly calendar structure
    - **Property 3: Weekly Calendar Structure**
    - **Validates: Requirements 3.1**
  - [x] 9.3 Update tab navigation to include Meal Plans
    - Update `_mobile/ErmaJean/app/(tabs)/_layout.tsx` to add meal-plans tab with calendar icon
    - _Requirements: 3.1_

- [ ] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Enhance Recipes screen
  - [x] 11.1 Upgrade RecipesScreen with improved design
    - Update `_mobile/ErmaJean/app/(tabs)/recipes.tsx` with skeleton loading, improved card design, and pull-to-refresh
    - _Requirements: 1.1, 1.4, 1.5_
  - [x] 11.2 Add AddRecipeFAB to Recipes screen
    - Integrate AddRecipeFAB component with plan limit checking and modal triggers
    - _Requirements: 7.1, 2.4, 2.5_
  - [ ]* 11.3 Write property test for plan limit enforcement
    - **Property 2: Plan Limit Enforcement**
    - **Validates: Requirements 2.4**

- [-] 12. Enhance Recipe Detail screen
  - [x] 12.1 Upgrade RecipeDetailScreen with complete information
    - Update `_mobile/ErmaJean/app/recipe/[id].tsx` with all fields, nutrition display, share button, and generate nutrition prompt
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 10.1_
  - [ ]* 12.2 Write property test for recipe detail field rendering
    - **Property 8: Recipe Detail Field Rendering**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
  - [x] 12.3 Implement recipe sharing functionality
    - Add share button that generates deep link and opens native share sheet
    - _Requirements: 10.1, 10.2_
  - [ ]* 12.4 Write property test for share link format
    - **Property 16: Share Link Format**
    - **Validates: Requirements 10.2**

- [x] 13. Enhance AI Generate screen
  - [x] 13.1 Upgrade GenerateScreen with improved UX
    - Update `_mobile/ErmaJean/app/(tabs)/generate.tsx` with better loading states, recipe preview modal, and save functionality
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 13.2 Add plan limit display and enforcement
    - Show remaining recipe count for free/monthly plans, display upgrade modal when limit reached
    - _Requirements: 2.4, 2.5_

- [ ] 14. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Enhance Profile screen
  - [x] 15.1 Upgrade ProfileScreen with goals management
    - Update `_mobile/ErmaJean/app/(tabs)/profile.tsx` with edit goals button, premium badge, and improved design
    - _Requirements: 6.1, 6.2, 6.4, 6.5_
  - [ ]* 15.2 Write property test for profile data display
    - **Property 9: Profile Data Display**
    - **Validates: Requirements 6.1**
  - [ ]* 15.3 Write property test for premium status display
    - **Property 11: Premium Status Display**
    - **Validates: Requirements 6.5**

- [x] 16. Implement authentication enhancements
  - [x] 16.1 Enhance auth flow with proper navigation
    - Update `_mobile/ErmaJean/app/_layout.tsx` and `_mobile/ErmaJean/app/index.tsx` to handle auth state and redirect appropriately
    - _Requirements: 9.1, 9.4_
  - [ ]* 16.2 Write property test for auth state navigation
    - **Property 14: Auth State Navigation**
    - **Validates: Requirements 9.1, 9.4**
  - [x] 16.3 Improve sign-in screen with better error handling
    - Update `_mobile/ErmaJean/app/(auth)/sign-in.tsx` with specific error messages for different failure types
    - _Requirements: 9.2, 9.3, 9.5_
  - [ ]* 16.4 Write property test for auth error display
    - **Property 15: Auth Error Display**
    - **Validates: Requirements 9.5**

- [x] 17. Implement deep linking
  - [x] 17.1 Configure deep link handling
    - Update `_mobile/ErmaJean/app.json` and create linking configuration for recipe URLs
    - _Requirements: 10.3_
  - [ ]* 17.2 Write property test for deep link navigation
    - **Property 17: Deep Link Navigation**
    - **Validates: Requirements 10.3**

- [ ] 18. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 19. Implement premium design system
  - [x] 19.1 Create design system constants
    - Create `_mobile/ErmaJean/constants/design.ts` with colors, spacing, typography, shadows, and animation configs
    - _Requirements: 8.4, 8.5_
  - [x] 19.2 Implement haptic feedback utility
    - Create `_mobile/ErmaJean/utils/haptics.ts` with functions for different haptic patterns (light, medium, heavy, success, error)
    - _Requirements: 8.3_
  - [x] 19.3 Create animated components
    - Create `_mobile/ErmaJean/components/animated/FadeInView.tsx`, `StaggeredList.tsx`, `AnimatedCard.tsx`
    - _Requirements: 8.1, 8.2_
  - [x] 19.4 Apply design system across all screens
    - Update all screens and components to use consistent design tokens, animations, and haptic feedback
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 20. Enhance Home screen
  - [x] 20.1 Upgrade HomeScreen with premium design
    - Update `_mobile/ErmaJean/app/(tabs)/index.tsx` with improved layout, animations, and quick actions for meal planning
    - _Requirements: 8.1, 8.2, 8.4, 8.5_

- [ ] 21. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
