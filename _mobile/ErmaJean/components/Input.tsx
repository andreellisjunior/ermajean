import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputProps {
    label?: string;
    type?: 'text' | 'password' | 'email' | 'number';
    placeholder?: string;
    icon?: any;
    value?: string;
    onChangeText?: (text: string) => void;
    multiline?: boolean;
}

export const Input = ({ label, type = "text", placeholder, icon: Icon, value, onChangeText, multiline = false }: InputProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    return (
        <View className="mb-4 w-full">
            {label && <Text className="text-sm font-bold text-stone-700 mb-2">{label}</Text>}
            <View className="relative w-full">
                <View className="absolute top-3.5 left-3 z-10">
                    {Icon && <Icon size={18} color="#A8A29E" />}
                </View>

                <TextInput
                    className={`w-full pl-10 pr-10 py-3 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 placeholder-stone-400 ${multiline ? 'min-h-[100px] text-top' : ''}`}
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={isPassword && !showPassword}
                    multiline={multiline}
                    placeholderTextColor="#A8A29E"
                />

                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        className="absolute top-3.5 right-3"
                    >
                        {showPassword ? <EyeOff size={18} color="#A8A29E" /> : <Eye size={18} color="#A8A29E" />}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};
