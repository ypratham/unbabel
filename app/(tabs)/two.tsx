// In your App.tsx or other screen component
import AudioLanguageDetector from "components/AudioLanguageDetector";
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";

export default function App(): JSX.Element {
  // Use JSX.Element for component return type
  return (
    <SafeAreaView style={styles.container}>
      <AudioLanguageDetector />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
