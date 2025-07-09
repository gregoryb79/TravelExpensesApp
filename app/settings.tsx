import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '../styles/tokens';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Currency and app settings</Text>
      
      
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: colors.background,
        padding: spacing.lg,  
        gap: spacing.md,     
    },
    h3: {
        fontSize: typography.lg,
        fontWeight: typography.weights.bold,        
        color: colors.textPrimary,
    },
    padding_bottom_10: {
        paddingBottom: spacing.base,
    },
    text_md: {
        fontSize: typography.md,
        color: colors.textPrimary,
    },
    backgroundWhite:{
        backgroundColor: colors.textWhite,
    },
    borderRadius_sm:{
        borderRadius: borderRadius.sm,
    },
    padding_sm: {
        padding: spacing.sm,
    },
    title: {
        fontSize: typography.xxl,
        fontWeight: typography.weights.bold,
        textAlign: 'center',
        marginBottom: spacing.sm,
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: typography.base,
        textAlign: 'center',
        marginBottom: spacing.xl,
        color: colors.textSecondary,
    },    
});