import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Modal, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '@/libs/api';
import { Recipe, Profile } from '@/types/config';
import { router } from 'expo-router';
import { supabase } from '@/libs/supabase';
import { createRecipe } from '@/services/recipeService';
import { getProfile } from '@/services/profileService';
import { Haptic } from '@/utils/haptics';
import { Colors } from '@/constants/design';

// Requirements 2.1, 2.2, 2.3, 2.4, 2.5
export default function GenerateScreen() {
    const [ingredients, setIngredients] = useState('');
    const [taste, setTaste] = useState('');
    const [time, setTime] = useState('');
    const [servings, setServings] = useState('2');
    const [course, setCourse] = useState('Main Course');
    const [restrictions, setRestrictions] = useState('');
    const [isKidFriendly, setIsKidFriendly] = useState(false);
    const [loading, setLoading] = useState(false);
    const [generatedRecipes, setGeneratedRecipes] = useState<any[]>([]);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedRecipeIndex, setSelectedRecipeIndex] = useState(0);
    const [savingRecipe, setSavingRecipe] = useState(false);

    // Plan limit state (Requirements 2.4, 2.5)
    const [profile, setProfile] = useState<Profile | null>(null);
    const [recipeUsageCount, setRecipeUsageCount] = useState(0);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    useEffect(() => {
        loadProfileAndUsage();
    }, []);

    const loadProfileAndUsage = async () => {
        try {
            const profileData = await getProfile();
            setProfile(profileData);

            // Count AI-generated recipes (Requirements 2.4)
            const { data: user } = await supabase.auth.getUser();
            if (user.user) {
                const { count } = await supabase
                    .from('recipes')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.user.id)
                    .not('ai_generated', 'is', null);

                setRecipeUsageCount(count || 0);
            }
        } catch (error) {
            console.error('Failed to load profile:', error);
        }
    };

    // Calculate plan type and limits (Requirements 2.4, 2.5)
    const getPlanType = (): 'free' | 'monthly' | 'unlimited' => {
        if (!profile) return 'free';
        if (!profile.has_access) return 'free';
        if (profile.price_id?.includes('monthly')) return 'monthly';
        return 'unlimited';
    };

    const getPlanLimit = (): number | null => {
        const planType = getPlanType();
        if (planType === 'free') return 3;
        if (planType === 'monthly') return 8;
        return null; // unlimited
    };

    const handleGenerate = async () => {
        // Requirement 2.1: Validate inputs
        if (!ingredients && !taste) {
            Alert.alert('Missing Information', 'Please enter ingredients or describe what you have a taste for.');
            return;
        }

        // Requirements 2.4, 2.5: Check plan limits before generation
        const planLimit = getPlanLimit();
        if (planLimit !== null && recipeUsageCount >= planLimit) {
            setShowUpgradeModal(true);
            return;
        }

        setLoading(true);
        try {
            // Requirement 2.1: Call the API with all parameters
            const response = await apiClient.post('/generate-recipe', {
                ingredients: ingredients ? ingredients.split(',').map(i => i.trim()) : [],
                taste: taste || '',
                total_time: time || '',
                serving: servings,
                course: course,
                restrictions: restrictions ? restrictions.split(',').map(r => r.trim()) : [],
                is_kid_friendly: isKidFriendly,
            });

            // Requirement 2.3: Show preview modal with generated recipes
            if (Array.isArray(response) && response.length > 0) {
                setGeneratedRecipes(response);
                setSelectedRecipeIndex(0);
                setShowPreviewModal(true);
            } else {
                Alert.alert('No recipes generated', 'Try different ingredients or preferences.');
            }

        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.message || 'Failed to generate recipe');
        } finally {
            setLoading(false);
        }
    };

    // Requirement 2.3: Save selected recipe
    const handleSaveRecipe = async () => {
        if (generatedRecipes.length === 0) return;

        setSavingRecipe(true);
        try {
            const recipe = generatedRecipes[selectedRecipeIndex];

            // Track recipe usage
            const { data: user } = await supabase.auth.getUser();
            if (!user.user) throw new Error('User not authenticated');

            // Save recipe to database
            const savedRecipe = await createRecipe({
                recipe_name: recipe.recipe_name,
                description: recipe.description,
                prep_time: recipe.prep_time,
                cook_time: recipe.cook_time,
                total_time: recipe.total_time,
                servings: recipe.servings,
                difficulty_level: recipe.difficulty_level,
                course: recipe.course,
                ingredients: recipe.ingredients,
                instructions: recipe.instructions,
                is_kid_friendly: isKidFriendly,
            });

            // Determine source based on plan type
            const planType = getPlanType();
            let source = 'free';
            if (planType === 'monthly') source = 'monthly';
            else if (planType === 'unlimited') source = 'unlimited';

            // Track usage
            await supabase.from('recipe_usage').insert({
                user_id: user.user.id,
                recipe_id: savedRecipe.id,
                source: source,
            });

            // Update local count
            setRecipeUsageCount(prev => prev + 1);

            Alert.alert('Success', 'Recipe saved successfully!', [
                {
                    text: 'View Recipe',
                    onPress: () => {
                        setShowPreviewModal(false);
                        router.push(`/recipe/${savedRecipe.id}`);
                    }
                },
                {
                    text: 'Generate Another',
                    onPress: () => {
                        setShowPreviewModal(false);
                        setGeneratedRecipes([]);
                    }
                }
            ]);

        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.message || 'Failed to save recipe');
        } finally {
            setSavingRecipe(false);
        }
    };

    // Requirement 2.3: Recipe Preview Modal
    const RecipePreviewModal = () => {
        if (generatedRecipes.length === 0) return null;
        const recipe = generatedRecipes[selectedRecipeIndex];

        return (
            <Modal
                visible={showPreviewModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowPreviewModal(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowPreviewModal(false)}>
                            <Ionicons name="close" size={28} color="#374151" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Recipe Preview</Text>
                        <View style={{ width: 28 }} />
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <Text style={styles.recipeName}>{recipe.recipe_name}</Text>
                        <Text style={styles.recipeDescription}>{recipe.description}</Text>

                        <View style={styles.recipeMetaContainer}>
                            <View style={styles.recipeMeta}>
                                <Ionicons name="time-outline" size={16} color="#6b7280" />
                                <Text style={styles.recipeMetaText}>{recipe.total_time}</Text>
                            </View>
                            <View style={styles.recipeMeta}>
                                <Ionicons name="restaurant-outline" size={16} color="#6b7280" />
                                <Text style={styles.recipeMetaText}>{recipe.servings}</Text>
                            </View>
                            <View style={styles.recipeMeta}>
                                <Ionicons name="bar-chart-outline" size={16} color="#6b7280" />
                                <Text style={styles.recipeMetaText}>{recipe.difficulty_level}</Text>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Ingredients</Text>
                            <Text style={styles.sectionContent}>{recipe.ingredients}</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Instructions</Text>
                            <Text style={styles.sectionContent}>{recipe.instructions}</Text>
                        </View>

                        {generatedRecipes.length > 1 && (
                            <View style={styles.navigationContainer}>
                                <TouchableOpacity
                                    style={[styles.navButton, selectedRecipeIndex === 0 && styles.navButtonDisabled]}
                                    onPress={() => setSelectedRecipeIndex(prev => Math.max(0, prev - 1))}
                                    disabled={selectedRecipeIndex === 0}
                                >
                                    <Ionicons name="chevron-back" size={24} color={selectedRecipeIndex === 0 ? '#d1d5db' : '#10b981'} />
                                    <Text style={[styles.navButtonText, selectedRecipeIndex === 0 && styles.navButtonTextDisabled]}>Previous</Text>
                                </TouchableOpacity>

                                <Text style={styles.recipeCounter}>
                                    {selectedRecipeIndex + 1} of {generatedRecipes.length}
                                </Text>

                                <TouchableOpacity
                                    style={[styles.navButton, selectedRecipeIndex === generatedRecipes.length - 1 && styles.navButtonDisabled]}
                                    onPress={() => setSelectedRecipeIndex(prev => Math.min(generatedRecipes.length - 1, prev + 1))}
                                    disabled={selectedRecipeIndex === generatedRecipes.length - 1}
                                >
                                    <Text style={[styles.navButtonText, selectedRecipeIndex === generatedRecipes.length - 1 && styles.navButtonTextDisabled]}>Next</Text>
                                    <Ionicons name="chevron-forward" size={24} color={selectedRecipeIndex === generatedRecipes.length - 1 ? '#d1d5db' : '#10b981'} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSaveRecipe}
                            disabled={savingRecipe}
                        >
                            {savingRecipe ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={24} color="white" />
                                    <Text style={styles.saveButtonText}>Save Recipe</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>
        );
    };

    // Requirements 2.4, 2.5: Upgrade Modal
    const UpgradeModal = () => {
        const planType = getPlanType();
        const planLimit = getPlanLimit();

        return (
            <Modal
                visible={showUpgradeModal}
                animationType="fade"
                transparent
                onRequestClose={() => setShowUpgradeModal(false)}
            >
                <View style={styles.upgradeOverlay}>
                    <View style={styles.upgradeModal}>
                        <View style={styles.upgradeIconContainer}>
                            <Ionicons name="sparkles" size={32} color="#8b5cf6" />
                        </View>

                        <Text style={styles.upgradeTitle}>
                            {planType === 'free' ? 'Upgrade to Premium' : 'Monthly Limit Reached'}
                        </Text>

                        <Text style={styles.upgradeMessage}>
                            {planType === 'free'
                                ? `You've used all ${planLimit} free AI recipes. Upgrade to Premium for unlimited AI recipe generation!`
                                : `You've reached your monthly limit of ${planLimit} AI recipes. Upgrade to unlimited for no limits!`}
                        </Text>

                        <TouchableOpacity
                            style={styles.upgradeButton}
                            onPress={() => {
                                setShowUpgradeModal(false);
                                // Navigate to pricing/upgrade page
                                Alert.alert('Upgrade', 'Visit ermajean.com to upgrade your plan');
                            }}
                        >
                            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.upgradeCancelButton}
                            onPress={() => setShowUpgradeModal(false)}
                        >
                            <Text style={styles.upgradeCancelText}>Maybe Later</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

    const planLimit = getPlanLimit();
    const remainingRecipes = planLimit !== null ? Math.max(0, planLimit - recipeUsageCount) : null;

    return (
        <LinearGradient
            colors={['#f0f9ff', '#e0f2fe', '#bae6fd']}
            className="flex-1"
        >
            <SafeAreaView className="flex-1">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <ScrollView className="px-6 py-8">
                        <View style={styles.headerContainer}>
                            <View>
                                <Text className="text-3xl font-bold text-gray-900 mb-2">AI Chef</Text>
                                <Text className="text-gray-500">Tell us what you have, and we'll cook up something magic.</Text>
                            </View>
                            {/* Requirement 2.5: Show remaining recipe count */}
                            {remainingRecipes !== null && (
                                <View style={styles.remainingBadge}>
                                    <Ionicons name="sparkles" size={12} color="#8b5cf6" />
                                    <Text style={styles.remainingText}>{remainingRecipes} AI left</Text>
                                </View>
                            )}
                        </View>

                        <View className="bg-white p-6 rounded-2xl shadow-sm mb-6 mt-4">
                            <Text className="font-bold text-gray-700 mb-2">Ingredients</Text>
                            <TextInput
                                className="bg-gray-50 p-4 rounded-xl text-gray-900 mb-4 h-32"
                                placeholder="Chicken, rice, broccoli..."
                                placeholderTextColor="#9ca3af"
                                multiline
                                textAlignVertical="top"
                                value={ingredients}
                                onChangeText={setIngredients}
                                editable={!loading}
                            />

                            <Text className="font-bold text-gray-700 mb-2">Taste / Mood</Text>
                            <TextInput
                                className="bg-gray-50 p-4 rounded-xl text-gray-900 mb-4"
                                placeholder="Spicy, Comforting, Asian..."
                                placeholderTextColor="#9ca3af"
                                value={taste}
                                onChangeText={setTaste}
                                editable={!loading}
                            />

                            <Text className="font-bold text-gray-700 mb-2">Time Available</Text>
                            <TextInput
                                className="bg-gray-50 p-4 rounded-xl text-gray-900 mb-4"
                                placeholder="30 minutes"
                                placeholderTextColor="#9ca3af"
                                value={time}
                                onChangeText={setTime}
                                editable={!loading}
                            />

                            <Text className="font-bold text-gray-700 mb-2">Servings</Text>
                            <TextInput
                                className="bg-gray-50 p-4 rounded-xl text-gray-900 mb-4"
                                placeholder="2"
                                placeholderTextColor="#9ca3af"
                                value={servings}
                                onChangeText={setServings}
                                editable={!loading}
                                keyboardType="numeric"
                            />

                            <Text className="font-bold text-gray-700 mb-2">Course</Text>
                            <TextInput
                                className="bg-gray-50 p-4 rounded-xl text-gray-900 mb-4"
                                placeholder="Main Course, Breakfast, Dessert..."
                                placeholderTextColor="#9ca3af"
                                value={course}
                                onChangeText={setCourse}
                                editable={!loading}
                            />

                            <Text className="font-bold text-gray-700 mb-2">Dietary Restrictions (Optional)</Text>
                            <TextInput
                                className="bg-gray-50 p-4 rounded-xl text-gray-900 mb-6"
                                placeholder="Vegan, Gluten-free, Keto..."
                                placeholderTextColor="#9ca3af"
                                value={restrictions}
                                onChangeText={setRestrictions}
                                editable={!loading}
                            />

                            <View style={styles.toggleContainer}>
                                <View style={styles.toggleTextContainer}>
                                    <View style={styles.toggleIconLabel}>
                                        <Ionicons name="body" size={18} color="#374151" />
                                        <Text style={styles.toggleLabel}>Kid Friendly</Text>
                                    </View>
                                    <Text style={styles.toggleDescription}>Optimize recipe for children's tastes</Text>
                                </View>
                                <Switch
                                    trackColor={{ false: '#d1d5db', true: '#bae6fd' }}
                                    thumbColor={isKidFriendly ? '#0ea5e9' : '#f4f3f4'}
                                    ios_backgroundColor="#d1d5db"
                                    onValueChange={setIsKidFriendly}
                                    value={isKidFriendly}
                                    disabled={loading}
                                />
                            </View>

                            {/* Requirement 2.2: Improved loading state */}
                            <TouchableOpacity
                                onPress={handleGenerate}
                                disabled={loading}
                                className="bg-primary py-4 rounded-xl shadow-lg active:opacity-90"
                                style={loading && { opacity: 0.7 }}
                            >
                                {loading ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator color="white" />
                                        <Text style={styles.loadingText}>Generating your recipes...</Text>
                                    </View>
                                ) : (
                                    <View style={styles.generateButtonContent}>
                                        <Ionicons name="sparkles" size={20} color="white" />
                                        <Text className="text-white text-center font-bold text-lg ml-2">Generate Recipes</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Requirement 2.3: Recipe Preview Modal */}
                <RecipePreviewModal />

                {/* Requirements 2.4, 2.5: Upgrade Modal */}
                <UpgradeModal />
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f9fafb',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
    },
    toggleTextContainer: {
        flex: 1,
        marginRight: 12,
    },
    toggleIconLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 2,
    },
    toggleLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    toggleDescription: {
        fontSize: 12,
        color: '#6b7280',
    },
    remainingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3e8ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    remainingText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8b5cf6',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    loadingText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    generateButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    recipeName: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
    },
    recipeDescription: {
        fontSize: 16,
        color: '#6b7280',
        lineHeight: 24,
        marginBottom: 20,
    },
    recipeMetaContainer: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    recipeMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    recipeMetaText: {
        fontSize: 14,
        color: '#6b7280',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
    },
    sectionContent: {
        fontSize: 15,
        color: '#374151',
        lineHeight: 24,
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        marginTop: 20,
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    navButtonDisabled: {
        opacity: 0.4,
    },
    navButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#10b981',
    },
    navButtonTextDisabled: {
        color: '#d1d5db',
    },
    recipeCounter: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '600',
    },
    modalFooter: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    saveButton: {
        backgroundColor: '#10b981',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
    upgradeOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    upgradeModal: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
    },
    upgradeIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#f3e8ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    upgradeTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
        textAlign: 'center',
    },
    upgradeMessage: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    upgradeButton: {
        backgroundColor: '#8b5cf6',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
        marginBottom: 12,
    },
    upgradeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },
    upgradeCancelButton: {
        paddingVertical: 12,
    },
    upgradeCancelText: {
        color: '#6b7280',
        fontSize: 16,
        fontWeight: '600',
    },
});
