import { Text, Linking } from "react-native";
import { Sheet } from "./sheet";
import { S, Action, Tip } from "./ui";
export function UpgradeSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="A little more kitchen help"
    >
      <Text style={S.body}>
        Your current plan has reached its limit for this feature. Your saved
        keepers are still here.
      </Text>
      <Tip>You can make plenty with what you’ve already got.</Tip>
      <Action
        label="Review plans on the website"
        onPress={() => void Linking.openURL("https://ermajean.com/#pricing")}
      />
      <Action secondary label="Back to my kitchen" onPress={onClose} />
      <Text style={S.small}>
        You’ll see current plan details before choosing. No purchase happens in
        this screen.
      </Text>
    </Sheet>
  );
}
