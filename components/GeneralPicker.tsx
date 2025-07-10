import { Picker } from "@react-native-picker/picker";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { colors, typography, spacing, borderRadius } from '../styles/tokens';

type CurrencySelectorProps = {
    input: string | undefined;
    inputArray: string[];
    extraStyles?: ViewStyle;
    onValueChange: (input: string) => void;
}
export function GeneralPicker({input, inputArray, extraStyles, onValueChange, }: CurrencySelectorProps) {
    return(
        
        <Picker
            style={[styles.currencyPicker, extraStyles]}                    
            selectedValue={input}
            mode="dropdown"
            onValueChange={onValueChange}>
                {inputArray.map((cat) => (
                    <Picker.Item key={cat} label={cat} value={cat} style={styles.text_md}/>
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