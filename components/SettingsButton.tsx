import { TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, typography, spacing, borderRadius } from '../styles/tokens';

export default function SettingsButton() {
    return (
        <TouchableOpacity 
            onPress={() => router.push('/settings')}
            style={{ padding: 0, marginRight: 0 }}
        >            
            <Icon name="settings" size={30} color={colors.primaryBlue}/>
        </TouchableOpacity>
    );
}