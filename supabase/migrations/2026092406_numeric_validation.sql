-- NOT VALID preserves existing rows for review, while rejecting invalid new writes from either client.
alter table public.recipes add constraint recipe_nutrition_ranges check(
 (calories is null or calories between 0 and 20000) and (protein is null or protein between 0 and 2000) and
 (carbs is null or carbs between 0 and 5000) and (fat is null or fat between 0 and 2000) and
 (fiber is null or fiber between 0 and 2000) and (sugar is null or sugar between 0 and 5000) and
 (sodium is null or sodium between 0 and 100000)) not valid;
alter table public.profiles add constraint profile_goal_ranges check(
 calorie_goal between 0 and 20000 and protein_goal between 0 and 2000 and carb_goal between 0 and 5000 and fat_goal between 0 and 2000) not valid;
