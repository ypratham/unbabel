import { Button, Text, View } from "tamagui";
import { Audio } from "expo-av";
import axios from "axios";
import { useEffect, useState } from "react";
import { Mic, Sparkle } from "@tamagui/lucide-icons";
import { useAppStore } from "store/appStore";
import { SUPPORTED_TARGET_LANGUAGE } from "constants/Language";
import * as Haptics from "expo-haptics";

export default function TabTwoScreen() {
  const [recording, setRecording] = useState<Audio.Recording>();
  const [audioUri, setAudioUri] = useState("");
  const [language, setLanguage] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access microphone is required!");
      }
    })();
  }, []);

  const startRecording = async () => {
    setError("");
    setLanguage("");
    try {
      console.log("Requesting permissions..");
      await Audio.requestPermissionsAsync();

      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    console.log("Stopping recording..");
    setRecording(undefined);

    if (recording) {
      await recording.stopAndUnloadAsync();

      const uri = recording.getURI();
      setAudioUri(uri + "");
      console.log("Recording stopped and stored at", uri);

      // Send audio data to the server
      await sendAudioToServer(uri);
    }
  };

  const sendAudioToServer = async (uri) => {
    setIsLoading(true);
    try {
      const audioFile: any = {
        uri: uri,
        name: "audio.wav",
        type: "audio/wav",
      };

      const formData = new FormData();
      formData.append("file", audioFile);

      const response = await axios.post(
        "https://d9e9-2409-40c0-3f-50ac-6919-8483-704b-2d19.ngrok-free.app/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { isMarathi, isGujarati } = response.data;

      if (isMarathi) {
        setLanguage("Marathi");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (isGujarati) {
        setLanguage("Gujarati");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setError("Unable to detect. Please try again!");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error sending audio to server:", error);
      setError("Unable to detect. Please try again!");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  const { setTargetLanguage } = useAppStore();

  const setAsTargetLanguage = () => {
    setTargetLanguage(
      SUPPORTED_TARGET_LANGUAGE.find((i) => i.name.toString() === language)
        ?.iso_code + ""
    );
  };

  return (
    <View flex={1} alignItems="center" gap="$10" justifyContent="center">
      {recording && <Text color={"red"}>Listening...</Text>}
      {error.length > 0 && <Text color={"red"}>{error}</Text>}

      <Button
        onPress={recording ? stopRecording : startRecording}
        icon={!recording ? <Sparkle /> : <Mic />}
      >
        {recording ? "Stop detecting" : "Detect Language"}
      </Button>
      {language ? (
        <Text
          color={"black"}
          borderColor={"$gray8Light"}
          p="$3"
          borderRadius={"$10"}
          borderWidth={0.5}
          fontWeight={"bold"}
          fontSize={"$5"}
        >
          {language} Detected
        </Text>
      ) : null}

      {language && (
        <Button
          variant="outlined"
          borderColor={"$gray8Light"}
          borderWidth={0.7}
          color={"black"}
          onPress={setAsTargetLanguage}
        >
          Set as target language
        </Button>
      )}
    </View>
  );
}
