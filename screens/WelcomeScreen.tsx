import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONTS } from "../components/theme";
import { supabaseEstConfiguree } from "../lib/supabase";

type Props = {
  onStart: () => void;
  onLogin: () => void;
  onInvite: () => void;
};

export default function WelcomeScreen({ onStart, onLogin, onInvite }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }]}>
      <View style={styles.hero}>
        <Text style={styles.titre}>Registre des Mariages</Text>
        <Text style={styles.surTitre}>Registre officiel des mariages religieux</Text>
        <Text style={styles.sousTitre}>
          Vérifiez en quelques secondes si une personne est déjà mariée religieusement,
          avant de célébrer une nouvelle union.
        </Text>
      </View>

      {!supabaseEstConfiguree && (
        <View style={styles.avertissement}>
          <Text style={styles.avertissementTexte}>
            ⚠ Supabase n'est pas encore configuré. Suivez les instructions du README
            (créer le projet, exécuter supabase_setup.sql, coller l'URL et la clé dans lib/supabase.ts).
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        <Pressable style={({ pressed }) => [styles.btnPrimaire, pressed && { opacity: 0.88 }]} onPress={onStart}>
          <Text style={styles.btnPrimaireTexte}>Créer un compte imam</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.btnSecondaire, pressed && { opacity: 0.88 }]} onPress={onLogin}>
          <Text style={styles.btnSecondaireTexte}>Se connecter</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.btnInvite, pressed && { opacity: 0.7 }]} onPress={onInvite}>
          <Text style={styles.btnInviteTexte}>Continuer en invité — vérifier une personne</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.sidebarBg,
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },
  hero: { flex: 1, justifyContent: "center", gap: 12 },
  titre: { fontFamily: FONTS.serif, fontSize: 34, lineHeight: 42, color: COLORS.sidebarTitle },
  surTitre: {
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: COLORS.sidebarMuted,
    fontFamily: FONTS.regular,
  },
  sousTitre: {
    fontSize: 15,
    lineHeight: 23,
    color: COLORS.sidebarNavIdle,
    fontFamily: FONTS.regular,
    marginTop: 10,
  },

  avertissement: {
    backgroundColor: COLORS.warningBg,
    borderWidth: 1,
    borderColor: COLORS.warningBorder,
    borderRadius: 8,
    padding: 14,
    marginBottom: 18,
  },
  avertissementTexte: { color: COLORS.warningText, fontFamily: FONTS.medium, fontSize: 13, lineHeight: 19 },

  actions: { gap: 12 },
  btnPrimaire: {
    backgroundColor: COLORS.accent,
    borderRadius: 6,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaireTexte: { color: COLORS.onAccent, fontFamily: FONTS.semibold, fontSize: 15 },
  btnSecondaire: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.sidebarFooter,
    borderRadius: 6,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSecondaireTexte: { color: COLORS.sidebarText, fontFamily: FONTS.semibold, fontSize: 15 },
  btnInvite: { alignItems: "center", paddingVertical: 12 },
  btnInviteTexte: {
    color: COLORS.sidebarMuted,
    fontFamily: FONTS.medium,
    fontSize: 13.5,
    textDecorationLine: "underline",
  },
});
