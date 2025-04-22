'use client';

// Add useRef and useEffect imports
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  subDays,
  eachDayOfInterval,
  getDate,
  setMonth,
  setWeek,
  getYear,
  getMonth,
  getWeek,
  startOfYear,
  addWeeks,
  isToday,
  // Add functions for monthly view
  startOfMonth,
  endOfMonth,
  getDay, // 0 = Sunday, 1 = Monday, etc.
  addMonths,
  subMonths,
  isSameMonth,
} from 'date-fns';

// Placeholder data for days and meals
const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];

// Example recipe data structure (replace with actual data later)
interface PlannedMeal {
  day: string;
  meal: string;
  recipeName?: string;
}

const plannedMeals: PlannedMeal[] = [
  { day: 'Wed', meal: 'Breakfast', recipeName: 'Berry Parfait' },
  { day: 'Thu', meal: 'Lunch', recipeName: 'Pasta Primavera' },
  { day: 'Mon', meal: 'Dinner', recipeName: 'Quinoa Bowl' },
  { day: 'Wed', meal: 'Dinner', recipeName: 'Lemon Herb Chicken' },
  { day: 'Fri', meal: 'Dinner', recipeName: 'Beef Stir Fry' },
];

// Helper function to find a meal for a specific slot
const getMealForSlot = (day: string, meal: string): PlannedMeal | undefined => {
  // Note: This needs adjustment later to match based on actual date, not just 'Mon', 'Tue', etc.
  return plannedMeals.find(m => m.day === day && m.meal === meal);
};


export default function MealPlansPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState<'weekly' | 'monthly'>('weekly');

  // Refs for the tab buttons
  const weeklyButtonRef = useRef<HTMLButtonElement>(null);
  const monthlyButtonRef = useRef<HTMLButtonElement>(null);
  const shoppingListButtonRef = useRef<HTMLButtonElement>(null); // Ref for the third button if needed for layout

  // State for the sliding background style
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });

  // --- Calculations, Handlers, Options ---
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const currentWeekString = `${format(weekStart, 'MMMM d')} - ${format(weekEnd, 'MMMM d, yyyy')}`;

  // --- Monthly View Calculations ---
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  // Get the first day to display in the grid (start of the week containing the 1st)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Assuming week starts Mon
  // Get the last day to display in the grid (end of the week containing the last day)
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 }); // Assuming week starts Mon
  const daysInGrid = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const monthDaysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; // Header for monthly grid

  // --- Navigation Handlers (Adapted) ---
  const handlePrev = () => {
    if (activeView === 'weekly') {
      setCurrentDate(subDays(currentDate, 7));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };
  const handleNext = () => {
    if (activeView === 'weekly') {
      setCurrentDate(addDays(currentDate, 7));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };
  const handleToday = () => {
    setCurrentDate(new Date());
    // Optionally switch back to weekly view when clicking Today
    // setActiveView('weekly');
  };

  // --- Dropdown Handlers ---
  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(event.target.value, 10);
    // Set the month, keeping the current year and day (date-fns handles month overflow)
    setCurrentDate(setMonth(currentDate, newMonth));
  };

  const handleWeekChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newWeek = parseInt(event.target.value, 10);
    const year = getYear(currentDate);
    // Calculate the date for the start of the selected week in the current year
    // Note: setWeek uses ISO week numbering. weekStartsOn: 1 ensures consistency.
    const firstDayOfYear = startOfYear(new Date(year, 0, 1));
    // Find the start of the target week
    let dateForWeek = addWeeks(firstDayOfYear, newWeek - 1); // Approximate start
    dateForWeek = startOfWeek(dateForWeek, { weekStartsOn: 1 }); // Align to Monday

    // Adjust if the calculated week doesn't match the target (edge cases near year start/end)
    if (getWeek(dateForWeek, { weekStartsOn: 1 }) !== newWeek) {
       // Try adding a day if we landed on the previous week's end
       dateForWeek = startOfWeek(addDays(dateForWeek, 7), { weekStartsOn: 1 });
    }

    // Ensure we stay within the target year if possible (might adjust day slightly)
    if (getYear(dateForWeek) !== year && newWeek <= 52) {
       dateForWeek = setWeek(new Date(year, 0, 4), newWeek, { weekStartsOn: 1 }); // Reset within the year
    }


    setCurrentDate(dateForWeek);
  };

  // --- Generate Dropdown Options ---
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: format(new Date(getYear(currentDate), i, 1), 'MMMM'),
  }));

  const weekOptions = Array.from({ length: 53 }, (_, i) => ({
    value: i + 1,
    label: `Week ${i + 1}`,
  }));

  // --- Click Handler for Monthly Day Cell ---
  // Ensure this function definition is here, directly inside MealPlansPage
  const handleDayClick = (day: Date) => {
    setCurrentDate(day);
    setActiveView('weekly');
  };

  // Effect to update slider position when activeView changes
  useEffect(() => {
    let activeRef: React.RefObject<HTMLButtonElement> | null = null;
    if (activeView === 'weekly' && weeklyButtonRef.current) {
      activeRef = weeklyButtonRef;
    } else if (activeView === 'monthly' && monthlyButtonRef.current) {
      activeRef = monthlyButtonRef;
    }
    // Add logic here if the Shopping List tab can become active

    if (activeRef && activeRef.current) {
      const { offsetLeft, offsetWidth } = activeRef.current;
      // Adjust for container padding (p-1 -> 4px)
      const containerPadding = 4;
      setSliderStyle({
        // Ensure left calculation accounts for padding
        left: offsetLeft - containerPadding,
        width: offsetWidth,
      });
    }
    // Add dependency array if containerPadding might change, though unlikely here
  }, [activeView]); // Rerun when activeView changes


  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1 text-foreground">Meal Planner</h1>
        <div className="flex flex-col sm:flex-row justify-between items-center text-muted-foreground">
           <div className="flex items-center space-x-2 mb-2 sm:mb-0">
             {/* Display dynamic range based on view */}
             <span>{activeView === 'weekly' ? currentWeekString : format(currentDate, 'MMMM yyyy')}</span>
             {/* Use adapted handlers */}
             <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrev}>
               <ChevronLeft className="h-4 w-4" />
             </Button>
             <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNext}>
               <ChevronRight className="h-4 w-4" />
             </Button>
             <Button variant="outline" className="h-8 px-3" onClick={handleToday}>Today</Button>
           </div>
           <div className="flex items-center space-x-2">
             {/* Month Dropdown */}
             <select
               className="border border-input rounded-md px-2 py-1 h-8 bg-background text-sm focus:ring-ring focus:ring-1 focus:outline-none"
               // Explicitly cast value to string
               value={String(getMonth(currentDate))}
               onChange={handleMonthChange}
             >
               {/* Render month options */}
               {monthOptions.map(option => (
                 <option key={option.value} value={option.value}>
                   {option.label}
                 </option>
               ))}
             </select>
             {/* Week Dropdown - Hide in monthly view */}
             {activeView === 'weekly' && (
               <select
                 className="border border-input rounded-md px-2 py-1 h-8 bg-background text-sm focus:ring-ring focus:ring-1 focus:outline-none"
                 // Explicitly cast value to string
                 value={String(getWeek(currentDate, { weekStartsOn: 1 }))}
                 onChange={handleWeekChange}
               >
                 {/* Render week options */}
                 {weekOptions.map(option => (
                   <option key={option.value} value={option.value}>
                     {option.label}
                   </option>
                 ))}
               </select>
             )}
           </div>
        </div>
      </div>

      {/* Tab Navigation - Add relative positioning */}
      <div className="relative mb-6 flex space-x-1 bg-muted p-1 rounded-lg">
        {/* Sliding Background Element - Ensure this is present */}
        <div
          className="absolute top-1 bottom-1 bg-primary shadow rounded-md transition-all duration-300 ease-in-out" // Use primary color for the slider background
          style={{
            left: `${sliderStyle.left}px`,
            width: `${sliderStyle.width}px`,
          }}
        />

        {/* Tab Buttons - Remove conditional bg-primary */}
        <Button
          ref={weeklyButtonRef}
          variant="ghost"
          // Removed 'bg-primary'. Text color changes based on activeView. Hover styles remain.
          className={`relative z-10 flex-1 hover:bg-transparent hover:border-primary/75 transition ${activeView === 'weekly' ? 'text-background hover:text-background' : 'text-foreground'}`}
          onClick={() => setActiveView('weekly')}
        >
          Weekly View
        </Button>
        <Button
          ref={monthlyButtonRef}
          variant="ghost"
          // Removed 'bg-primary'. Text color changes based on activeView. Hover styles remain.
          className={`relative z-10 flex-1 hover:bg-transparent hover:border-primary/75 transition ${activeView === 'monthly' ? 'text-background hover:text-background' : 'text-foreground'}`}
          onClick={() => setActiveView('monthly')}
        >
          Monthly View
        </Button>
        <Button
          ref={shoppingListButtonRef}
          variant="ghost"
          className="relative z-10 flex-1 text-muted-foreground" // Keep relative z-10
          // Add onClick handler if this tab can be active
        >
          Shopping List
        </Button>
      </div>

      {/* Conditional Rendering based on activeView - Reinstated */}
      {activeView === 'weekly' && (
        /* --- Weekly Grid --- */
        <div className="grid grid-cols-[auto,repeat(7,1fr)] gap-1">
          {/* Empty corner */}
          <div />
          {/* Day Headers */}
          {daysInWeek.map((day) => (
            <div
              key={day.toISOString()}
              className={`text-center font-semibold p-2 bg-card rounded-t-md border border-border ${
                isToday(day) ? 'bg-background !border-primary' : ''
              }`}
            >
              {format(day, 'EEE')}
              <span className={`block text-xs ${isToday(day) ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                {getDate(day)}
              </span>
            </div>
          ))}
          {/* Meal Rows */}
          {mealTypes.map((meal) => (
            <React.Fragment key={meal}>
              {/* Meal Type Label */}
              <div className="flex items-center justify-center p-2 font-semibold bg-primary rounded-md text-background -rotate-90 whitespace-nowrap origin-center w-24 h-10 my-auto relative left-[35px] text-sm my-10">
                {meal}
              </div>
              {/* Meal Cells */}
              {daysInWeek.map((day) => {
                const plannedMeal = getMealForSlot(format(day, 'EEE'), meal);
                return (
                  <div
                    key={day.toISOString() + '-' + meal}
                    className={`bg-card p-2 hover:shadow-lg transition rounded-md border border-border min-h-[80px] flex flex-col items-center justify-center text-center ${
                      isToday(day) ? 'bg-background !border-primary' : ''
                    }`}
                  >
                    {plannedMeal ? (
                      <>
                        <span className="font-medium text-sm mb-1 text-foreground">{plannedMeal.recipeName}</span>
                        <Button variant="outline" size="sm" className="h-6 px-2 text-xs">View Recipe</Button>
                      </>
                    ) : (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-accent">
                        <Plus className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      )}

      {activeView === 'monthly' && (
        /* --- Monthly Grid --- */
        <div className="grid grid-cols-7 gap-1">
           {/* Day of Week Headers */}
           {monthDaysOfWeek.map(day => (
             <div key={day} className="text-center font-semibold p-2 text-muted-foreground text-sm">
               {day}
             </div>
           ))}
           {/* Date Cells */}
           {daysInGrid.map((day) => (
             <div
               key={day.toISOString()}
               className={`border border-border rounded-md min-h-[100px] p-2 cursor-pointer hover:bg-accent transition-colors ${
                 isSameMonth(day, currentDate) ? 'bg-card' : 'bg-muted/50'
               } ${
                 isToday(day) ? '!border-primary border-2' : ''
               }`}
               // This onClick should now correctly find handleDayClick defined above
               onClick={() => handleDayClick(day)}
             >
               <span className={`text-xs ${isToday(day) ? 'text-primary font-bold' : isSameMonth(day, currentDate) ? 'text-foreground' : 'text-muted-foreground/70'}`}>
                 {getDate(day)}
               </span>
               {/* Placeholder for meal indicators */}
               <div className="mt-1 space-y-1">
                 {/* Example: Add dots or small recipe names here later */}
               </div>
             </div>
           ))}
        </div>
      )}

      {/* Action Buttons - Use theme colors */}
      <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
         {/* Use primary color for border/text on outline buttons */}
        <Button variant="outline" className="border-primary text-primary hover:bg-accent">Clear Week</Button>
         {/* Use primary color for main action button */}
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Generate Shopping List</Button>
        <Button variant="outline" className="border-primary text-primary hover:bg-accent">Save Template</Button>
      </div>
    </div>
  );
}