import React, { useState, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Audio } from "expo-av";
import {
  createPartFromUri,
  createUserContent,
  GoogleGenAI,
} from "@google/genai";
import {
  AndroidAudioEncoder,
  AndroidOutputFormat,
  IOSAudioQuality,
  IOSOutputFormat,
} from "expo-av/build/Audio";
import { useAppStore } from "store/appStore";
import { SUPPORTED_SOURCE_LANGUAGE } from "constants/Language";

// Configuration
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.5-pro-exp-03-25"; // Or other appropriate model

// Initialize Gemini client
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const getBlobFromUri = async (uri) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
};

const AudioLanguageDetector = () => {
  // State
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [detectedLanguage, setDetectedLanguage] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [buttonText, setButtonText] = useState("Tap to Record");

  // Toggle recording
  const toggleRecording = useCallback(async () => {
    if (recording) {
      // Stop recording
      await stopRecordingAndAnalyze();
    } else {
      // Start recording
      await startRecording();
    }
  }, [recording]);

  const { targetLanguage } = useAppStore();

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      // Reset states
      setDetectedLanguage("");
      setTranslatedText("");

      // Check permission
      if (permissionResponse?.status !== Audio.PermissionStatus.GRANTED) {
        const response = await requestPermission();
        if (response.status !== Audio.PermissionStatus.GRANTED) {
          Alert.alert(
            "Permission Required",
            "Microphone access is needed to record audio."
          );
          return;
        }
      }

      // Configure audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Create recording
      const { recording: newRecording } = await Audio.Recording.createAsync({
        isMeteringEnabled: true,
        android: {
          extension: ".mp3",
          outputFormat: AndroidOutputFormat.MPEG_4,
          audioEncoder: AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: ".m4a",
          outputFormat: IOSOutputFormat.MPEG4AAC,
          audioQuality: IOSAudioQuality.MAX,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        web: {
          mimeType: "audio/webm",
          bitsPerSecond: 128000,
        },
      });

      setRecording(newRecording);
      setButtonText("Recording... Tap to Stop");
    } catch (err) {
      console.error("Recording error:", err);
      Alert.alert("Recording Error", err.message);
      setButtonText("Tap to Record");
    }
  }, [permissionResponse, requestPermission]);

  // Stop recording and analyze
  const stopRecordingAndAnalyze = useCallback(async () => {
    if (!recording) return;

    try {
      setButtonText("Processing...");
      setIsLoading(true);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (!uri) {
        throw new Error("Failed to get recording file");
      }

      setRecording(null);

      // Analyze the audio
      await identifyLanguage(uri);
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", error.message);
      setIsLoading(false);
      setButtonText("Tap to Record");
    }
  }, [recording]);

  // Identify language from audio
  const identifyLanguage = async (uri) => {
    if (!uri || !ai) {
      const message = !uri ? "No audio recorded" : "API not configured";
      Alert.alert("Error", message);
      setIsLoading(false);
      setButtonText("Tap to Record");
      return;
    }

    try {
      const blob = await getBlobFromUri(uri);

      const audio = await ai.files.upload({
        file: blob,
        config: {
          mimeType: "audio/mpeg",
        },
      });

      if (audio?.uri && audio.mimeType) {
        const res = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: [
            createUserContent([
              `First, identify only the language spoken in this audio. Then, provide an accurate transcription and translation of the content to ${
                SUPPORTED_SOURCE_LANGUAGE.find(
                  (i) => i.iso_code == targetLanguage
                )?.name
              } . Format your response exactly like this: 'Language: [language name]\nTranscription: [original text]\nTranslation: [English translation]'`,
              createPartFromUri(audio?.uri, audio?.mimeType),
            ]),
          ],
        });

        if (res?.text) {
          // Extract language and translation from response
          const responseText = res.text;
          const languageMatch = responseText.match(/Language:\s*([^\n]+)/i);
          const transcriptionMatch = responseText.match(
            /Transcription:\s*([^\n]+)/i
          );
          const translationMatch = responseText.match(
            /Translation:\s*([^\n]+)/i
          );

          setDetectedLanguage(languageMatch?.[1] || "Unknown language");
          setTranslatedText(
            translationMatch?.[1] || transcriptionMatch?.[1] || ""
          );
        }
      }
    } catch (error) {
      console.error("Analysis error:", error);
      setDetectedLanguage("Error detecting language");
    } finally {
      setIsLoading(false);
      setButtonText("Tap to Record");
    }
  };

  // Render
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.recordButton,
          recording ? styles.recordingActive : null,
          isLoading ? styles.buttonDisabled : null,
        ]}
        onPress={toggleRecording}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>{buttonText}</Text>
        {isLoading && (
          <ActivityIndicator size="small" color="#fff" style={styles.loader} />
        )}
      </TouchableOpacity>

      {detectedLanguage && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Detected Language:</Text>
          <Text style={styles.resultText}>{detectedLanguage}</Text>

          {translatedText && (
            <>
              <Text style={styles.resultTitle}>Translation:</Text>
              <Text style={styles.translationText}>{translatedText}</Text>
            </>
          )}
        </View>
      )}

      {!API_KEY && (
        <Text style={styles.warning}>
          Gemini API Key missing. Set EXPO_PUBLIC_GEMINI_API_KEY in .env
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  recordButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4285F4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    marginBottom: 30,
  },
  recordingActive: {
    backgroundColor: "#EA4335",
  },
  buttonDisabled: {
    backgroundColor: "#9AA0A6",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  loader: {
    marginTop: 10,
  },
  resultContainer: {
    width: "90%",
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#5F6368",
    marginTop: 10,
  },
  resultText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A73E8",
    marginBottom: 15,
  },
  translationText: {
    fontSize: 18,
    color: "#202124",
    lineHeight: 24,
  },
  warning: {
    marginTop: 20,
    color: "#EA4335",
    textAlign: "center",
    fontSize: 14,
  },
});

export default AudioLanguageDetector;
