import { Picker } from "@react-native-picker/picker";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { colors, typography, spacing, borderRadius } from '../styles/tokens';
import { slimCurrency } from "../utils/currencyUtils";

type CurrencySelectorProps = {
    currency: slimCurrency | undefined;
    currenciesList: slimCurrency[];
    extraStyles?: ViewStyle;
    onValueChange: (currency: slimCurrency) => void;
}
export function CurrencyPicker({currency, currenciesList, extraStyles, onValueChange, }: CurrencySelectorProps) {
    const reorderedList = currenciesList.sort((a, b) => {
                    if (a.code === currency?.code) return -1;
                    if (b.code === currency?.code) return 1;
                    return 0;
                });
    return(               
        <Picker
            style={[styles.currencyPicker, extraStyles]}                    
            selectedValue={currency}
            mode="dropdown"
            onValueChange={onValueChange}>
                {reorderedList.map((cat) => (
                    <Picker.Item key={cat.code} label={cat.symbol} value={cat} style={styles.text_md}/>
                ))}
        </Picker>    
          
    );
}

export const styles = StyleSheet.create({
    text_md: {
        fontSize: typography.md,
        color: colors.textPrimary,
    },    
    currencyPicker: {        
               
        backgroundColor: colors.textWhite,        
        borderRadius: borderRadius.sm,
        marginBottom: spacing.sm,        
    },   
});