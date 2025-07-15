import { Picker } from "@react-native-picker/picker";
import { View, Text, StyleSheet, ViewStyle, TextInput } from "react-native";
import { colors, typography, spacing, borderRadius } from '../styles/tokens';
import { slimCurrency } from "../utils/currencyUtils";
import { MainButton } from "./MainButton";
import { CurrencyPicker } from "./CurrencyPicker";
import { Trip } from "../types/trip";

type ExpenseContainerProps = {
    amount: string;
    onAmountChangeText: (amount: string) => void;
    currency: slimCurrency| undefined;
    onCurrencyValueChange: (currency: slimCurrency) => void;
    currenciesList: slimCurrency[];
    category: string;
    onCategoryValueChange: (category: string) => void;
    categories: string[];
    description: string;
    onDescriptionChangeText: (description: string) => void;
    onSubmit: () => void;
}


export function ExpenseContainer({amount,onAmountChangeText,currency,onCurrencyValueChange,currenciesList, 
                 category, onCategoryValueChange,categories, description, onDescriptionChangeText,onSubmit}: ExpenseContainerProps) {
  return (
    <View style={styles.addExpenseContainter}>
            <View style={styles.amountContainer}>
                <Text style={styles.text_md}>Amount:</Text>
                <View style={styles.amountInput}>
                    <TextInput
                        style={styles.amountInputBox}
                        value={amount}
                        onChangeText={onAmountChangeText}
                        keyboardType="numeric"
                        placeholder="0.00"
                    /> 
                    <CurrencyPicker 
                        currency={currency} 
                        currenciesList={currenciesList || []} 
                        extraStyles={{width: typography.md*7}}
                        onValueChange={onCurrencyValueChange} 
                    />                  

                </View>                              
            </View>
            <View style={styles.pickerContainer}>
                <Text style={styles.text_md}>Category:</Text>
                <Picker
                    style={styles.categoriesPicker}                    
                    selectedValue={category}
                    mode="dropdown"
                    onValueChange={onCategoryValueChange}>
                        {categories.map((cat) => (
                            <Picker.Item key={cat} label={cat} value={cat} style={styles.text_md}/>
                        ))}
                </Picker>
            </View>
            <View style={styles.padding_sm}>
                <Text style={styles.text_md}>Description:</Text>
                <TextInput
                    style={styles.descriptionInput}
                    value={description}
                    onChangeText={onDescriptionChangeText}
                    placeholder="Expense description"
                />
            </View>           
            <MainButton label="Add Expense" onPress={onSubmit} extraStyles={{ minWidth: '60%', marginBottom: spacing.md }}/>            
        </View>
  );
}


export const styles = StyleSheet.create({ 
    text_md: {
        fontSize: typography.md,
        color: colors.textPrimary,
    },
    borderRadius_sm:{
        borderRadius: borderRadius.sm,
    },
    padding_sm: {
        padding: spacing.sm,
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
});