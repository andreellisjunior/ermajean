import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface ButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient';
    onClick?: () => void;
    className?: string;
    fullWidth?: boolean;
    disabled?: boolean;
}

export const Button = ({ children, variant = "primary", onClick, className = "", fullWidth = false, disabled = false }: ButtonProps) => {
    const baseStyles = "py-3.5 px-6 rounded-xl flex-row items-center justify-center gap-2";

    // Note: NativeWind/Tailwind classes. 
    // Shadow implementation might need adjustment for RN (elevation/shadow props), but using valid tw classes.

    const variants = {
        primary: "bg-emerald-800", // hover not supported in RN same way, removed
        secondary: "bg-stone-200",
        outline: "border-2 border-emerald-700 bg-transparent",
        ghost: "bg-transparent",
        danger: "bg-red-50",
        gradient: "bg-emerald-600", // Simple fallback for gradient if not using LinearGradient component here immediately
    };

    const textStyles = {
        primary: "text-white font-semibold",
        secondary: "text-stone-800 font-semibold",
        outline: "text-emerald-800 font-semibold",
        ghost: "text-stone-600 font-semibold",
        danger: "text-red-600 font-semibold",
        gradient: "text-white font-semibold",
    };

    return (
        <TouchableOpacity
            onPress={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : 'self-start'} ${className} ${disabled ? 'opacity-50' : ''}`}
        >
            <Text className={`${textStyles[variant]}`}>
                {children}
            </Text>
        </TouchableOpacity>
    );
};
