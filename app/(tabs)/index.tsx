import Voice, {
  SpeechErrorEvent,
  SpeechRecognizedEvent,
  SpeechResultsEvent,
} from "@react-native-voice/voice";
import LanguageSelector from "components/LanguageSelector";
import { processLanguagePipeline } from "components/request";
import { Audio as ExpoAudio } from "expo-av";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useAppStore } from "store/appStore";
import { Theme, View, XStack, YStack } from "tamagui";

export default function TabOneScreen() {
  const { sourceLanguage, targetLanguage, textToSpeechSourceLanguage } =
    useAppStore();

  const [recognized, setRecognized] = useState("");
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState("");
  const [end, setEnd] = useState("");
  const [started, setStarted] = useState(false);
  const [results, setResults] = useState([]);
  const [partialResults, setPartialResults] = useState([]);

  const [audioResponse, setAudioResponse] = useState<any>();

  const animatedRedCircle = useAnimatedStyle(() => ({
    width: withTiming(started ? "60%" : "100%"),
    borderRadius: withTiming(started ? 5 : 35),
  }));

  const animatedRecordWave = useAnimatedStyle(() => {
    const size = withTiming(interpolate(volume, [-10, -1, 0], [5, 0, -1]), {
      duration: 100,
    });
    return {
      top: size,
      bottom: size,
      left: size,
      right: size,
      backgroundColor: `rgba(255, 45, 0, .3)`,
    };
  });

  const onSpeechStart = (e: any) => {
    console.log("onSpeechStart: ", e);
    setStarted(true);
  };

  const onSpeechRecognized = (e: SpeechRecognizedEvent) => {
    console.log("onSpeechRecognized: ", e);
    setRecognized("√");
  };

  const onSpeechEnd = (e: any) => {
    console.log("onSpeechEnd: ", e);
    setEnd("√");
  };

  const onSpeechError = (e: SpeechErrorEvent) => {
    _clearState();
    console.log("onSpeechError: ", e);
    setError(JSON.stringify(e.error));
  };

  const onSpeechResults = async (e: SpeechResultsEvent) => {
    console.log("onSpeechResults: ", e);
    setResults(e.value as any);

    if (e.value) {
      translateSpeechToSpeech(e.value[0]);
      setStarted(false);
    }

    // stopRecordingAudio();
  };

  const onSpeechPartialResults = (e: SpeechResultsEvent) => {
    // console.log("onSpeechPartialResults: ", e);
    setPartialResults(e.value as any);
  };

  const onSpeechVolumeChanged = (e: any) => {
    // console.log("onSpeechVolumeChanged: ", e);
    setVolume(e.value);
  };

  const _startRecognizing = async () => {
    _clearState();
    try {
      await Voice.start(textToSpeechSourceLanguage, {
        EXTRA_PARTIAL_RESULTS: true,
      });
      console.log("called start");
      // startRecording();
    } catch (e) {
      console.error(e);
    }
  };

  const _stopRecognizing = async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error(e);
    }
    setStarted(false);
    setVolume(0);
  };

  const _cancelRecognizing = async () => {
    try {
      await Voice.cancel();
    } catch (e) {
      console.error(e);
    }
  };

  const _destroyRecognizer = async () => {
    try {
      await Voice.destroy();
      // stopRecordingAudio();
    } catch (e) {
      console.error(e);
    }
    _clearState();
  };

  const _clearState = () => {
    setRecognized("");
    setVolume(0);
    setError("");
    setEnd("");
    setStarted(false);
    setResults([]);
    setPartialResults([]);
  };

  const translateSpeechToSpeech = async (speechResult) => {
    const audioResponse = await processLanguagePipeline({
      audioContent: "",
      distLang: targetLanguage,
      srcLang: sourceLanguage,
      inputSource: speechResult,
    });

    setAudioResponse(audioResponse);

    const soundObject = new ExpoAudio.Sound();
    try {
      await soundObject.loadAsync({
        uri: audioResponse!,
      });
      await soundObject.playAsync();
    } catch (error) {
      console.log("Something went wrong playing audio.", error);
    }
  };

  useEffect(() => {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechRecognized = onSpeechRecognized;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;
    Voice.onSpeechVolumeChanged = onSpeechVolumeChanged;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [sourceLanguage, targetLanguage]);

  return (
    <Theme name={"light"}>
      <YStack f={1} ai="center" gap="$8" px="$3" pt="$5">
        <LanguageSelector />

        <XStack w={"100%"} flex={1}>
          <View m="auto">
            <Animated.View style={[styles.recordWave, animatedRecordWave]} />
            <Pressable
              style={styles.recordButton}
              onPress={started ? _destroyRecognizer : _startRecognizing}
            >
              <Animated.View style={[styles.redCircle, animatedRedCircle]} />
            </Pressable>
          </View>
        </XStack>
      </YStack>
    </Theme>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ecf0f1",
  },
  footer: {
    height: 150,
    alignItems: "center",
    justifyContent: "center",
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,

    borderWidth: 3,
    borderColor: "gray",
    padding: 3,

    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  recordWave: {
    position: "absolute",
    top: -20,
    bottom: -20,
    left: -20,
    right: -20,
    borderRadius: 1000,
  },

  redCircle: {
    backgroundColor: "rgb(229, 0, 49)",
    aspectRatio: 1,
  },
});
