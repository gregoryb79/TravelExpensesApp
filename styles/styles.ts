import { colors, typography, spacing, borderRadius } from '../styles/tokens';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
    quickStats: {
        backgroundColor: colors.surface,
        padding: spacing.lg,
        borderRadius: borderRadius.base,        
    },
    statsTitle: {
        fontSize: typography.md,
        fontWeight: typography.weights.semibold,
        marginBottom: spacing.sm,
        color: colors.textPrimary,
    },
    statsSubtitle: {
        fontSize: typography.base,
        color: colors.textSecondary,
    },
    buttonContainer: {
        gap: spacing.md,
    },   
    secondaryButton: {
        backgroundColor: colors.surfaceLight,
        padding: spacing.md,
        borderRadius: borderRadius.base,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: colors.textPrimary,
        fontSize: typography.base,
        fontWeight: typography.weights.medium,
    },
    recentExpencesContainter: {
        flex: 1,        
        padding: spacing.base,
        backgroundColor: colors.surfaceSecondary,
        borderRadius: borderRadius.base,
    },    
    listItem: {
        padding: spacing.xs,
        flexDirection: 'row',
        justifyContent: 'space-between',               
        marginBottom: spacing.sm,
    },
    addExpenseContainter: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.base,
    },
    amountContainer:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',        
        padding: spacing.sm,
    },
    amountInput: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,          
    }, 
    amountInputBox: {
        fontSize: typography.md,
        backgroundColor: colors.textWhite,
        borderRadius: borderRadius.sm,   
        width: typography.md*5,
        textAlign: 'right',    
    },
    pickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.sm,
        gap: spacing.sm,
    },   
    categoriesPicker: {        
        flex: 1,        
        backgroundColor: colors.textWhite,
        borderRadius: borderRadius.sm,
        marginBottom: spacing.sm,        
    },
    currencyPicker: {        
        // flex: 1,        
        backgroundColor: colors.textWhite,
        width: typography.md*7,
        borderRadius: borderRadius.sm,
        marginBottom: spacing.sm,        
    },
    descriptionInput: {
        backgroundColor: colors.textWhite,
        borderRadius: borderRadius.sm,
        padding: spacing.sm,
        fontSize: typography.md,              
    },
    newTripHeader:{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    newTripForm:{
        backgroundColor: colors.surface,
        borderRadius: borderRadius.base,
        padding: spacing.md,
        gap: spacing.sm,
    },
    baseCurencyContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.sm,
        gap: spacing.sm,
    },
    recentTripsContainter:{
        flex: 1,        
        padding: spacing.base,
        backgroundColor: colors.surfaceSecondary,
        borderRadius: borderRadius.base,
    },
    selectedItem: {
        color: colors.primaryBlue,
        fontWeight: typography.weights.semibold,
    },
    curenciesListContainer:{
        maxHeight: '70%',
        backgroundColor: colors.surfaceSecondary,
        borderRadius: borderRadius.base,
        padding: spacing.md,
        margin: spacing.sm,
    },
    expensesListContainer:{
        maxHeight: '80%',
        backgroundColor: colors.surfaceSecondary,
        borderRadius: borderRadius.base,
        padding: spacing.md,
        margin: spacing.sm,
    },
    expenseListItem: {
        padding: spacing.xs,
        flexDirection: 'column',                       
        marginBottom: spacing.sm,
    },
    expenseListItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',               
        marginBottom: spacing.sm,
    },   
});