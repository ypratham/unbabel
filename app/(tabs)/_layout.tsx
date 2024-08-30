import { Link, Tabs } from "expo-router";
import { Button, useTheme } from "tamagui";
import { Atom, AudioWaveform } from "@tamagui/lucide-icons";

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.red10.val,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Unbabel",
          tabBarIcon: ({ color }) => <AudioWaveform color={color} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Button mr="$4" bg="$purple8" color="$purple12">
                Configure
              </Button>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: "Services",
          tabBarIcon: ({ color }) => <Atom color={color} />,
        }}
      />
    </Tabs>
  );
}
