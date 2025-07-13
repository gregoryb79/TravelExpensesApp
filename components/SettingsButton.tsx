import { TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, typography, spacing, borderRadius } from '../styles/tokens';

type SettingsButtonProps = {
    onPress?: () => void;
}
export default function SettingsButton({onPress}: SettingsButtonProps) {
    return (
        <TouchableOpacity 
            onPress={onPress}
            style={{ padding: 0, marginRight: 0 }}
        >            
            <Icon name="settings" size={30} color={colors.primaryBlue}/>
        </TouchableOpacity>
    );
}