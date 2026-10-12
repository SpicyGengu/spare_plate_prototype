import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import qrcode from "qrcode-generator";
import { colors } from "../theme";

export function QrCode({ value, size = 208 }) {
  const cells = useMemo(() => {
    const code = qrcode(0, "M");
    code.addData(value);
    code.make();
    const count = code.getModuleCount();
    const rows = [];
    for (let row = 0; row < count; row += 1) {
      const line = [];
      for (let column = 0; column < count; column += 1) line.push(code.isDark(row, column));
      rows.push(line);
    }
    return rows;
  }, [value]);

  const count = cells.length || 1;
  const cell = size / count;

  return (
    <View style={styles.quiet}>
      <View style={{ width: size, height: size }}>
        {cells.map((row, rowIndex) => (
          <View key={rowIndex} style={{ flexDirection: "row", height: cell }}>
            {row.map((dark, columnIndex) => (
              <View
                key={columnIndex}
                style={{
                  width: cell,
                  height: cell,
                  backgroundColor: dark ? colors.text : colors.card,
                }}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  quiet: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 20,
    alignSelf: "center",
  },
});
