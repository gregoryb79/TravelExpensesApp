import { TouchableOpacity, StyleSheet, Text, ViewStyle } from "react-native";
import { colors, typography, spacing, borderRadius } from '../styles/tokens';



type MainButtonProps = {    
    onPress: () => void;
    label: string;
    extraStyles?: ViewStyle;
    disabled?: boolean;
}
export function MainButton({ onPress, label, extraStyles, disabled }: MainButtonProps) {
    
return(
    <TouchableOpacity style={[styles.primaryButton, extraStyles, disabled && { opacity: 0.5 }]} onPress={onPress} disabled={disabled}>
        <Text style={styles.primaryButtonText}>{label}</Text>
    </TouchableOpacity>
    );
}

export const styles = StyleSheet.create({    
    primaryButton: {
        backgroundColor: colors.primaryBlue,
        padding: spacing.md,
        borderRadius: borderRadius.base,
        alignItems: 'center',        
        alignSelf: 'center',
        // marginBottom: spacing.md,
    },
    primaryButtonText: {
        color: colors.textWhite,
        fontSize: typography.md,
        fontWeight: typography.weights.semibold,
    },
});