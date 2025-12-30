import { View, Text, StyleSheet } from 'react-native';

export default function PhoneInputScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Ballers</Text>
      <Text style={styles.subtitle}>Enter your phone number to get started</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FAFAF9',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Manrope_700Bold',
    color: '#1C1917',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#78716C',
  },
});
