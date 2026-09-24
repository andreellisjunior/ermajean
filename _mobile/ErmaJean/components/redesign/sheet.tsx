import { ReactNode, useEffect } from "react";
import {
  Modal,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  Pressable,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { C, S } from "./ui";
let openSheets = 0;
let previousHidden: string | null = null;
let previousInert = false;
export function Sheet({
  visible,
  onClose,
  title,
  children,
  scroll = true,
  busy = false,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  scroll?: boolean;
  busy?: boolean;
}) {
  useEffect(() => {
    if (!visible || Platform.OS !== "web" || typeof document === "undefined")
      return;
    const root = document.getElementById("root");
    if (!root) return;
    if (openSheets === 0) {
      previousHidden = root.getAttribute("aria-hidden");
      previousInert = root.inert;
    }
    openSheets++;
    root.setAttribute("aria-hidden", "true");
    root.inert = true;
    return () => {
      openSheets--;
      if (openSheets === 0) {
        if (previousHidden === null) root.removeAttribute("aria-hidden");
        else root.setAttribute("aria-hidden", previousHidden);
        root.inert = previousInert;
      }
    };
  }, [visible]);
  return (
    <Modal
      accessibilityLabel={title}
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {
        if (!busy) onClose();
      }}
    >
      <SafeAreaView
        accessibilityViewIsModal
        style={{ flex: 1, backgroundColor: C.oat }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View
            style={[
              S.row,
              { padding: 18, borderBottomWidth: 1, borderBottomColor: C.line },
            ]}
          >
            <Text accessibilityRole="header" style={[S.heading, { flex: 1 }]}>
              {title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Close ${title}`}
              disabled={busy}
              accessibilityState={{ disabled: busy }}
              onPress={onClose}
              style={{
                minWidth: 48,
                minHeight: 48,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 24,
                backgroundColor: C.sage,
                opacity: busy ? 0.5 : 1,
              }}
            >
              <X color={C.ink} />
            </Pressable>
          </View>
          {scroll ? (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              contentInsetAdjustmentBehavior="automatic"
              contentContainerStyle={{
                padding: 22,
                gap: 20,
                paddingBottom: 40,
                maxWidth: 620,
                width: "100%",
                alignSelf: "center",
              }}
            >
              {children}
            </ScrollView>
          ) : (
            children
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
