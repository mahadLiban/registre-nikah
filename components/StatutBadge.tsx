import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { KindStatut } from "../lib/registre";
import { COLORS, FONTS } from "./theme";

const STYLES_PAR_KIND: Record<KindStatut, { bg: string; texte: string }> = {
  actif: { bg: COLORS.badgeMarieBg, texte: COLORS.badgeMarieText },
  divorce: { bg: COLORS.badgeDivorceBg, texte: COLORS.badgeDivorceText },
  veuf: { bg: COLORS.badgeVeufBg, texte: COLORS.badgeVeufText },
  none: { bg: COLORS.badgeCelibBg, texte: COLORS.badgeCelibText },
};

export default function StatutBadge({ kind, label }: { kind: KindStatut; label: string }) {
  const s = STYLES_PAR_KIND[kind];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.texte, { color: s.texte }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 100,
    alignSelf: "flex-start",
  },
  texte: { fontSize: 12, fontFamily: FONTS.semibold },
});
