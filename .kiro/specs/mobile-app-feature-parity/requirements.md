# Requirements Document

## Introduction

This document specifies the requirements for achieving feature parity between the ErmaJean web application and the React Native/Expo mobile application, while implementing an elite-level modern mobile design. The mobile app currently has basic functionality (authentication, recipe viewing, AI generation, profile) but lacks key features like meal planning, shopping lists, and a polished user experience. The goal is to create a 1:1 feature match with the web app while delivering a premium mobile-first design that provides the best user experience for an AI recipe application.

## Glossary

- **ErmaJean Mobile App**: The React Native/Expo mobile application located in `_mobile/ErmaJean`
- **Recipe**: A food preparation document containing name, description, ingredients, instructions, nutritional information, and metadata
- **Meal Plan**: A weekly schedule assigning recipes to specific meal slots (Breakfast, Lunch, Dinner) for each day
- **Macro Goals**: User-defined daily nutritional targets for calories, protein, carbohydrates, and fat
- **AI Recipe Generation**: The feature that uses AI to create recipes based on user-provided ingredients, taste preferences, and constraints
- **Shopping List**: An aggregated list of ingredients from planned meals for a given time period
- **Recipe Usage**: A tracking mechanism that counts AI-generated recipes against plan limits

## Requirements

### Requirement 1

**User Story:** As a user, I want to view and manage my saved recipes in an elegant, searchable list, so that I can quickly find and access my favorite recipes.

#### Acceptance Criteria

1. WHEN the user navigates to the Recipes tab THEN the Mobile App SHALL display all saved recipes in a visually appealing card-based list with recipe images, names, cooking times, and macro summaries
2. WHEN the user types in the search field THEN the Mobile App SHALL filter recipes in real-time by name and description
3. WHEN the user taps on a recipe card THEN the Mobile App SHALL navigate to a detailed recipe view with full ingredients, instructions, and nutritional information
4. WHEN the user pulls down on the recipe list THEN the Mobile App SHALL refresh the recipe data from the server
5. WHEN recipes are loading THEN the Mobile App SHALL display skeleton loading placeholders to maintain visual continuity

### Requirement 2

**User Story:** As a user, I want to generate AI-powered recipes based on my available ingredients and preferences, so that I can discover new meals tailored to my needs.

#### Acceptance Criteria

1. WHEN the user submits ingredients, taste preferences, time constraints, servings, course type, and dietary restrictions THEN the Mobile App SHALL send a request to the AI recipe generation API and display generated recipes
2. WHEN the AI generation is in progress THEN the Mobile App SHALL display an animated loading state with progress indication
3. WHEN recipes are successfully generated THEN the Mobile App SHALL present them in a preview modal allowing the user to save selected recipes
4. WHEN the user attempts to generate a recipe and has reached their plan limit THEN the Mobile App SHALL display an upgrade prompt modal
5. WHEN the user has a free plan THEN the Mobile App SHALL display the remaining recipe count before generation

### Requirement 3

**User Story:** As a user, I want to plan my meals for the week by assigning recipes to specific days and meal times, so that I can organize my eating schedule and track nutrition.

#### Acceptance Criteria

1. WHEN the user navigates to the Meal Plans tab THEN the Mobile App SHALL display a weekly calendar view showing all seven days with Breakfast, Lunch, and Dinner slots
2. WHEN the user taps on an empty meal slot THEN the Mobile App SHALL open a recipe selection modal showing all saved recipes
3. WHEN the user selects a recipe for a meal slot THEN the Mobile App SHALL save the assignment and update the calendar display
4. WHEN the user swipes left on a planned meal THEN the Mobile App SHALL reveal a delete action to remove the meal from the plan
5. WHEN the user navigates between weeks THEN the Mobile App SHALL load and display meal plans for the selected week
6. WHEN meals are planned for a day THEN the Mobile App SHALL display a macro summary showing total calories, protein, carbs, and fat against user goals

### Requirement 4

**User Story:** As a user, I want to generate a shopping list from my meal plan, so that I can efficiently purchase ingredients for my planned meals.

#### Acceptance Criteria

1. WHEN the user taps "Generate Shopping List" on the Meal Plans screen THEN the Mobile App SHALL aggregate all ingredients from planned meals for the selected week
2. WHEN displaying the shopping list THEN the Mobile App SHALL group ingredients by category and combine duplicate items with summed quantities
3. WHEN the user taps on a shopping list item THEN the Mobile App SHALL toggle a checkmark to indicate the item has been purchased
4. WHEN the user taps "Share" on the shopping list THEN the Mobile App SHALL open the native share sheet with the list formatted as text

### Requirement 5

**User Story:** As a user, I want to view detailed recipe information including nutritional data, so that I can make informed decisions about what I eat.

#### Acceptance Criteria

1. WHEN viewing a recipe detail screen THEN the Mobile App SHALL display the recipe name, description, prep time, cook time, total time, servings, difficulty level, and course type
2. WHEN viewing a recipe detail screen THEN the Mobile App SHALL display ingredients as a formatted list with bullet points
3. WHEN viewing a recipe detail screen THEN the Mobile App SHALL display instructions as numbered steps
4. WHEN viewing a recipe detail screen THEN the Mobile App SHALL display nutritional information including calories, protein, carbs, fat, fiber, sugar, and sodium per serving
5. WHEN a recipe lacks nutritional data THEN the Mobile App SHALL display a prompt to generate nutrition information via the API

### Requirement 6

**User Story:** As a user, I want to manage my profile and nutritional goals, so that I can personalize my meal planning experience.

#### Acceptance Criteria

1. WHEN the user navigates to the Profile tab THEN the Mobile App SHALL display the user's name, email, subscription status, and macro goals
2. WHEN the user taps "Edit Goals" THEN the Mobile App SHALL open a form to update calorie, protein, carb, and fat daily targets
3. WHEN the user saves updated goals THEN the Mobile App SHALL persist the changes to the server and update the local display
4. WHEN the user taps "Sign Out" THEN the Mobile App SHALL clear the session and navigate to the sign-in screen
5. WHEN the user has a premium subscription THEN the Mobile App SHALL display a "Premium" badge and hide upgrade prompts

### Requirement 7

**User Story:** As a user, I want to add my own recipes manually, so that I can store family recipes and personal favorites alongside AI-generated ones.

#### Acceptance Criteria

1. WHEN the user taps the "Add Recipe" floating action button THEN the Mobile App SHALL display options to either generate with AI or add manually
2. WHEN the user selects "Add Manually" THEN the Mobile App SHALL display a form with fields for name, description, prep time, cook time, servings, difficulty, course, ingredients, and instructions
3. WHEN the user submits a valid manual recipe THEN the Mobile App SHALL save it to the database and add it to the recipe list
4. WHEN the user submits a recipe with missing required fields THEN the Mobile App SHALL display validation errors and prevent submission
5. WHEN adding a manual recipe THEN the Mobile App SHALL optionally allow entry of nutritional information

### Requirement 8

**User Story:** As a user, I want the mobile app to have a modern, premium design with smooth animations, so that using the app feels delightful and professional.

#### Acceptance Criteria

1. WHEN navigating between screens THEN the Mobile App SHALL use smooth animated transitions appropriate for mobile platforms
2. WHEN displaying lists THEN the Mobile App SHALL use staggered fade-in animations for list items
3. WHEN the user interacts with buttons and cards THEN the Mobile App SHALL provide haptic feedback on supported devices
4. WHEN displaying the app THEN the Mobile App SHALL use a consistent color palette with the primary brand color (#10b981 emerald) and complementary gradients
5. WHEN displaying content THEN the Mobile App SHALL use appropriate typography hierarchy with clear visual distinction between headings, body text, and labels
6. WHEN the user scrolls content THEN the Mobile App SHALL implement smooth parallax effects on hero images where appropriate

### Requirement 9

**User Story:** As a user, I want to authenticate securely and have my session persist, so that I can access my recipes without repeatedly signing in.

#### Acceptance Criteria

1. WHEN the user opens the app without an active session THEN the Mobile App SHALL display the sign-in screen
2. WHEN the user enters valid credentials and taps "Sign In" THEN the Mobile App SHALL authenticate with Supabase and navigate to the home screen
3. WHEN the user taps "Sign Up" THEN the Mobile App SHALL create a new account and send a verification email
4. WHEN the user has an active session THEN the Mobile App SHALL automatically navigate to the home screen on app launch
5. WHEN authentication fails THEN the Mobile App SHALL display a clear error message explaining the issue

### Requirement 10

**User Story:** As a user, I want to share recipes with friends and family, so that I can spread the joy of cooking.

#### Acceptance Criteria

1. WHEN viewing a recipe detail screen THEN the Mobile App SHALL display a share button
2. WHEN the user taps the share button THEN the Mobile App SHALL open the native share sheet with a deep link to the recipe
3. WHEN a user opens a shared recipe link THEN the Mobile App SHALL navigate directly to that recipe's detail view
