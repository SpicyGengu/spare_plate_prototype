import * as Haptics from "expo-haptics";

export async function hapticLight() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Web and simulators can omit haptics.
  }
}

export async function hapticSuccess() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Web and simulators can omit haptics.
  }
}
