import { Check } from "@tamagui/lucide-icons";
import {
  SUPPORTED_SOURCE_LANGUAGE,
  SUPPORTED_TARGET_LANGUAGE,
} from "constants/Language";
import { useAppStore } from "store/appStore";

import {
  Adapt,
  Label,
  Select,
  Sheet,
  XStack,
  YStack,
  getFontSize,
} from "tamagui";

export default function LanguageSelector() {
  const {
    sourceLanguage,
    targetLanguage,
    setSourceLanguage,
    setTargetLanguage,
    setTextToSpeechSourceLanguage,
  } = useAppStore();

  return (
    <XStack flex={1} gap="$2" alignItems="flex-end" mb="$4">
      {/* Source Language */}
      <YStack flex={1}>
        <Label>Source Language</Label>
        <Select
          value={sourceLanguage}
          onValueChange={(e) => {
            setSourceLanguage(
              SUPPORTED_SOURCE_LANGUAGE.find((i) => i.id.toString() === e)
                ?.iso_code + ""
            );
            setTextToSpeechSourceLanguage(
              SUPPORTED_SOURCE_LANGUAGE.find((i) => i.id.toString() === e)
                ?.iso_code2 + ""
            );
          }}
        >
          <Select.Trigger>
            <Select.Value placeholder="Please select something" />
          </Select.Trigger>

          <Adapt when="sm" platform="touch">
            <Sheet
              modal
              dismissOnSnapToBottom
              animationConfig={{
                type: "spring",
                damping: 20,
                mass: 1.2,
                stiffness: 250,
              }}
            >
              <Sheet.Frame>
                <Sheet.ScrollView>
                  <Adapt.Contents />
                </Sheet.ScrollView>
              </Sheet.Frame>
              <Sheet.Overlay
                animation="lazy"
                enterStyle={{ opacity: 0 }}
                exitStyle={{ opacity: 0 }}
              />
            </Sheet>
          </Adapt>

          <Select.Content zIndex={200000}>
            <Select.Viewport minWidth={200}>
              {SUPPORTED_SOURCE_LANGUAGE.map((language, index) => (
                <Select.Item
                  index={index}
                  key={language.id}
                  value={language.id.toString()}
                >
                  <Select.ItemText>{language.name}</Select.ItemText>
                  <Select.ItemIndicator marginLeft="auto">
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select>
      </YStack>

      {/* Target Language */}
      <YStack flex={1}>
        <Label>Target Language</Label>
        <Select
          value={targetLanguage}
          onValueChange={(e) => {
            setTargetLanguage(
              SUPPORTED_TARGET_LANGUAGE.find((i) => i.id.toString() === e)
                ?.iso_code + ""
            );
          }}
        >
          <Select.Trigger>
            <Select.Value placeholder="Please select something" />
          </Select.Trigger>

          <Adapt when="sm" platform="touch">
            <Sheet
              modal
              dismissOnSnapToBottom
              animationConfig={{
                type: "spring",
                damping: 20,
                mass: 1.2,
                stiffness: 250,
              }}
            >
              <Sheet.Frame>
                <Sheet.ScrollView>
                  <Adapt.Contents />
                </Sheet.ScrollView>
              </Sheet.Frame>
              <Sheet.Overlay
                animation="lazy"
                enterStyle={{ opacity: 0 }}
                exitStyle={{ opacity: 0 }}
              />
            </Sheet>
          </Adapt>

          <Select.Content zIndex={300000}>
            <Select.Viewport minWidth={200}>
              {SUPPORTED_TARGET_LANGUAGE.map((language, index) => (
                <Select.Item
                  index={index}
                  key={language.id}
                  value={language.id.toString()}
                >
                  <Select.ItemText>{language.name}</Select.ItemText>
                  <Select.ItemIndicator marginLeft="auto">
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select>
      </YStack>
    </XStack>
  );
}
