import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, FONTS } from "./theme";

type Option = { value: string; label: string };

type Props = {
  placeholder: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
};

// Équivalent React Native du <select> du prototype :
// un champ qui déplie la liste des options en dessous.
export default function Select({ placeholder, value, options, onChange }: Props) {
  const [ouvert, setOuvert] = useState(false);
  const selection = options.find((o) => o.value === value);

  return (
    <View>
      <Pressable style={styles.champ} onPress={() => setOuvert(!ouvert)}>
        <Text style={[styles.valeur, !selection && { color: COLORS.textSoft }]} numberOfLines={1}>
          {selection ? selection.label : placeholder}
        </Text>
        <Text style={styles.chevron}>{ouvert ? "▴" : "▾"}</Text>
      </Pressable>
      {ouvert && (
        <View style={styles.liste}>
          {options.length === 0 && (
            <Text style={styles.vide}>Aucune option disponible.</Text>
          )}
          {options.map((o) => (
            <Pressable
              key={o.value}
              style={({ pressed }) => [
                styles.option,
                o.value === value && styles.optionActive,
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => {
                onChange(o.value);
                setOuvert(false);
              }}
            >
              <Text
                style={[styles.optionTexte, o.value === value && styles.optionTexteActif]}
                numberOfLines={2}
              >
                {o.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  champ: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 6,
    paddingHorizontal: 12,
    minHeight: 42,
    gap: 8,
  },
  valeur: { flex: 1, fontSize: 14, fontFamily: FONTS.regular, color: COLORS.text },
  chevron: { fontSize: 12, color: COLORS.textMuted },
  liste: {
    marginTop: 4,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    overflow: "hidden",
  },
  vide: { padding: 12, fontSize: 13, fontFamily: FONTS.regular, color: COLORS.textMuted },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  optionActive: { backgroundColor: COLORS.accent },
  optionTexte: { fontSize: 13.5, fontFamily: FONTS.regular, color: COLORS.text },
  optionTexteActif: { color: COLORS.onAccent, fontFamily: FONTS.semibold },
});
