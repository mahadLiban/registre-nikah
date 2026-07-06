import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, CONTENT_MAX_WIDTH, FONTS } from "../components/theme";
import { supabaseEstConfiguree } from "../lib/supabase";

type Props = {
  onStart: () => void;
  onLogin: () => void;
  onDemo: () => void;
};

export default function WelcomeScreen({ onStart, onLogin, onDemo }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + 28 }]}>
      <View style={styles.contenu}>
        <View style={styles.hero}>
          <View style={styles.pastille}>
            <Text style={styles.pastilleTexte}>✍️</Text>
          </View>
          <Text style={styles.titre}>Le Registre</Text>
          <Text style={styles.sousTitre}>
            Un endroit unique où chaque union célébrée est inscrite.
            Réservé aux témoins qui enregistrent les cérémonies.
          </Text>
        </View>

        {!supabaseEstConfiguree && (
          <View style={styles.avertissement}>
            <Text style={styles.avertissementTexte}>
              ⚠ Base de données non configurée — voir le README.
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <Pressable style={({ pressed }) => [styles.btnPrimaire, pressed && { opacity: 0.9 }]} onPress={onStart}>
            <Text style={styles.btnPrimaireTexte}>Créer mon compte témoin</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.btnSecondaire, pressed && { opacity: 0.9 }]} onPress={onLogin}>
            <Text style={styles.btnSecondaireTexte}>Se connecter</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.btnDemo, pressed && { opacity: 0.7 }]} onPress={onDemo}>
            <Text style={styles.btnDemoTexte}>Essayer avec le compte de démonstration</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg, alignItems: "center" },
  contenu: {
    flex: 1,
    width: "100%",
    maxWidth: CONTENT_MAX_WIDTH,
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },
  hero: { flex: 1, justifyContent: "center", gap: 16 },
  pastille: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  pastilleTexte: { fontSize: 30 },
  titre: { fontFamily: FONTS.extrabold, fontSize: 34, color: COLORS.text },
  sousTitre: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    lineHeight: 25,
    color: COLORS.muted,
  },

  avertissement: {
    backgroundColor: COLORS.warningBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  avertissementTexte: { color: COLORS.warningText, fontFamily: FONTS.semibold, fontSize: 13 },

  actions: { gap: 12 },
  btnPrimaire: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaireTexte: { color: COLORS.onAccent, fontFamily: FONTS.bold, fontSize: 16 },
  btnSecondaire: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSecondaireTexte: { color: COLORS.text, fontFamily: FONTS.bold, fontSize: 16 },
  btnDemo: { alignItems: "center", paddingVertical: 10 },
  btnDemoTexte: {
    color: COLORS.muted,
    fontFamily: FONTS.semibold,
    fontSize: 13.5,
    textDecorationLine: "underline",
  },
});
