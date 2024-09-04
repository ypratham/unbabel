import {
  SUPPORTED_SOURCE_LANGUAGE,
  SUPPORTED_TARGET_LANGUAGE,
} from "constants/Language";
import { useAppStore } from "store/appStore";
import {
  Anchor,
  Label,
  Paragraph,
  Text,
  Theme,
  View,
  XStack,
  YStack,
} from "tamagui";

export default function ModalScreen() {
  const {
    sourceLanguage,
    targetLanguage,
    setSourceLanguage,
    setTargetLanguage,
    setTextToSpeechSourceLanguage,
  } = useAppStore();

  return (
    <Theme name={"dark"}>
      <View flex={1} p="$3" bg={"black"} gap="$12">
        <YStack>
          <Label>Source Language</Label>
          <XStack gap="$2">
            {SUPPORTED_SOURCE_LANGUAGE.map(
              ({ id, name, iso_code, iso_code2 }, i) => (
                <YStack
                  key={id}
                  bg={"$gray5"}
                  minWidth={80}
                  p="$2"
                  onPress={() => {
                    setSourceLanguage(iso_code);
                    setTextToSpeechSourceLanguage(iso_code2);
                  }}
                  alignItems="center"
                  justifyContent="center"
                  borderRadius={"$2"}
                  borderWidth={1}
                  borderColor={
                    sourceLanguage === iso_code ? "$white075" : "$white025"
                  }
                >
                  <Text>{name}</Text>
                  <Text fontSize={"$1"} opacity={0.5}>{`(${name})`}</Text>
                </YStack>
              )
            )}
          </XStack>
        </YStack>

        <YStack>
          <Label>Target Language</Label>
          <XStack gap="$2" flexWrap="wrap">
            {SUPPORTED_TARGET_LANGUAGE.map(({ id, name, iso_code }, i) => (
              <YStack
                key={id}
                bg={"$gray5"}
                minWidth={80}
                p="$2"
                onPress={() => {
                  setTargetLanguage(iso_code);
                }}
                alignItems="center"
                justifyContent="center"
                borderRadius={"$2"}
                borderWidth={1}
                borderColor={
                  targetLanguage === iso_code ? "$white075" : "$white025"
                }
              >
                <Text>{name}</Text>
                <Text fontSize={"$1"} opacity={0.5}>{`(${name})`}</Text>
              </YStack>
            ))}
          </XStack>
        </YStack>
      </View>
    </Theme>
  );
}
