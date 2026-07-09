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
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + 26 }]}>
      <View style={styles.contenu}>
        <View style={styles.hero}>
          {/* Arche de mihrab */}
          <View style={styles.arche}>
            <View style={styles.archeInterieure}>
              <Text style={styles.etoile}>۞</Text>
              <Text style={styles.titre}>Le Registre</Text>
            </View>
          </View>

          <View style={styles.filet}>
            <View style={styles.filetLigne} />
            <Text style={styles.filetEtoile}>✦</Text>
            <View style={styles.filetLigne} />
          </View>

          <Text style={styles.sousTitre}>
            Les fiançailles célébrées, inscrites en un lieu unique.{"\n"}
            Réservé aux témoins des cérémonies.
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
          <Pressable style={({ pressed }) => [styles.btnOr, pressed && { opacity: 0.9 }]} onPress={onStart}>
            <Text style={styles.btnOrTexte}>Créer mon compte témoin</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.btnGhost, pressed && { opacity: 0.85 }]} onPress={onLogin}>
            <Text style={styles.btnGhostTexte}>Se connecter</Text>
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
  root: { flex: 1, backgroundColor: COLORS.nuit, alignItems: "center" },
  contenu: {
    flex: 1,
    width: "100%",
    maxWidth: CONTENT_MAX_WIDTH,
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },

  hero: { flex: 1, alignItems: "center", justifyContent: "center", gap: 22 },

  arche: {
    width: 216,
    height: 264,
    borderTopLeftRadius: 108,
    borderTopRightRadius: 108,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.or,
    padding: 10,
    backgroundColor: COLORS.nuitProfonde,
  },
  archeInterieure: {
    flex: 1,
    borderTopLeftRadius: 98,
    borderTopRightRadius: 98,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.orFonce,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 14,
  },
  etoile: { fontSize: 40, color: COLORS.or, marginBottom: 2 },
  titre: {
    fontFamily: FONTS.display,
    fontSize: 34,
    color: COLORS.ivoire,
    textAlign: "center",
    lineHeight: 44,
  },

  filet: { flexDirection: "row", alignItems: "center", gap: 12, alignSelf: "stretch" },
  filetLigne: { flex: 1, height: 1, backgroundColor: COLORS.orFonce, opacity: 0.55 },
  filetEtoile: { color: COLORS.or, fontSize: 14 },

  sousTitre: {
    fontFamily: FONTS.regular,
    fontSize: 15.5,
    lineHeight: 25,
    color: COLORS.ivoireDoux,
    textAlign: "center",
  },

  avertissement: {
    backgroundColor: COLORS.warningBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  avertissementTexte: { color: COLORS.warningText, fontFamily: FONTS.semibold, fontSize: 13 },

  actions: { gap: 12 },
  btnOr: {
    backgroundColor: COLORS.or,
    borderRadius: 14,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  btnOrTexte: { color: COLORS.nuitProfonde, fontFamily: FONTS.extrabold, fontSize: 16 },
  btnGhost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.orFonce,
    borderRadius: 14,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  btnGhostTexte: { color: COLORS.ivoire, fontFamily: FONTS.bold, fontSize: 16 },
  btnDemo: { alignItems: "center", paddingVertical: 10 },
  btnDemoTexte: {
    color: COLORS.ivoireDoux,
    fontFamily: FONTS.semibold,
    fontSize: 13.5,
    textDecorationLine: "underline",
  },
});
