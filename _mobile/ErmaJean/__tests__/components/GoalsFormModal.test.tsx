import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { GoalsFormModal } from "@/components/GoalsFormModal";
jest.mock("@/utils/haptics", () => ({
  Haptic: { success: jest.fn(), error: jest.fn() },
}));
jest.mock("@/components/redesign/sheet", () => ({
  Sheet: ({ children }: any) => children,
}));
jest.mock("@/components/redesign/ui", () => {
  const h = require("react")["createElement"];
  const { Text, TextInput, Pressable } = require("react-native");
  return {
    S: { body: {}, heading: {}, small: {}, card: {}, row: {} },
    C: { tomato: "#b84732" },
    Field: (props: any) => h(TextInput, props),
    Tip: ({ children }: any) => h(Text, null, children),
    Action: ({ label, onPress, disabled }: any) =>
      h(
        Pressable,
        { onPress, disabled, accessibilityRole: "button" },
        h(Text, null, label),
      ),
  };
});
const goals = { calories: 2000, protein: 100, carbs: 250, fat: 65 };
test("rejects non-numeric goals before submitting", () => {
  const save = jest.fn();
  const view = render(
    <GoalsFormModal
      visible
      onClose={jest.fn()}
      currentGoals={goals}
      onSave={save}
    />,
  );
  fireEvent.changeText(view.getByLabelText("Protein daily goal in g"), "abc");
  fireEvent.press(view.getByText("Save my goals"));
  expect(save).not.toHaveBeenCalled();
  expect(
    view.getAllByText("Enter a number for each goal.").length,
  ).toBeGreaterThan(0);
});
test("retains edited goals and a retry action after saving fails", async () => {
  const close = jest.fn();
  const save = jest.fn().mockRejectedValue(new Error("Offline. Try again."));
  const view = render(
    <GoalsFormModal
      visible
      onClose={close}
      currentGoals={goals}
      onSave={save}
    />,
  );
  fireEvent.changeText(view.getByLabelText("Protein daily goal in g"), "120");
  fireEvent.press(view.getByText("Save my goals"));
  await waitFor(() =>
    expect(view.getAllByText("Offline. Try again.").length).toBeGreaterThan(0),
  );
  expect(view.getByLabelText("Protein daily goal in g").props.value).toBe(
    "120",
  );
  expect(close).not.toHaveBeenCalled();
  expect(view.getByText("Save my goals")).toBeTruthy();
});
test("saves a valid edited goal and closes only after success", async () => {
  const close = jest.fn();
  const save = jest.fn().mockResolvedValue(undefined);
  const view = render(
    <GoalsFormModal
      visible
      onClose={close}
      currentGoals={goals}
      onSave={save}
    />,
  );
  fireEvent.changeText(view.getByLabelText("Protein daily goal in g"), "125");
  fireEvent.press(view.getByText("Save my goals"));
  await waitFor(() => expect(close).toHaveBeenCalledTimes(1));
  expect(save).toHaveBeenCalledWith({ ...goals, protein: 125 });
});
