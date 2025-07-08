import { TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';

export default function SettingsButton() {
    return (
        <TouchableOpacity 
            onPress={() => router.push('/settings')}
            style={{ padding: 8, marginRight: 8 }}
        >
            <Text style={{ fontSize: 20 }}>⚙️</Text>
        </TouchableOpacity>
    );
}