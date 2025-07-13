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
       <View style={[extraStyles]}>
        <Picker
            style={[styles.currencyPicker]}                    
            selectedValue={input}
            mode="dropdown"
            onValueChange={onValueChange}>
                {inputArray.map((cat) => (
                    <Picker.Item key={cat} label={cat} value={cat} style={styles.text_md}/>
                ))}
        </Picker>   
        </View> 
          
    );
}

export const styles = StyleSheet.create({
    text_md: {
        fontSize: typography.md,
        color: colors.textPrimary,
    },    
    currencyPicker: {       
        // flex: 1,       
        backgroundColor: colors.textWhite,        
        // borderRadius: borderRadius.sm,
        // marginBottom: spacing.sm,        
    },   
});