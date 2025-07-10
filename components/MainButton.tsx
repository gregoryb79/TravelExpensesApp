import { TouchableOpacity, StyleSheet, Text, ViewStyle } from "react-native";
import { colors, typography, spacing, borderRadius } from '../styles/tokens';



type MainButtonProps = {    
    onPress: () => void;
    label: string;
    extraStyles?: ViewStyle;
}
export function MainButton({ onPress, label, extraStyles }: MainButtonProps) {
return(
    <TouchableOpacity style={[styles.primaryButton, extraStyles]} onPress={onPress}>
        <Text style={styles.primaryButtonText}>{label}</Text>
    </TouchableOpacity>
    );
}

export const styles = StyleSheet.create({    
    primaryButton: {
        backgroundColor: colors.primary,
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