import React from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, CONTENT_MAX_WIDTH, FONTS } from "../components/theme";
import { supabaseEstConfiguree } from "../lib/supabase";

type Props = {
  onLogin: () => void;
};

export default function WelcomeScreen({ onLogin }: Props) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  // L'arche s'adapte aux petits écrans (largeur ET hauteur).
  const largeurArche = Math.min(216, width * 0.56, height * 0.34);
  const hauteurArche = largeurArche * 1.22;
  const petitEcran = height < 640;

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
      <View style={[styles.contenu, { paddingHorizontal: width < 360 ? 20 : 28 }]}>
        <View style={[styles.hero, { gap: petitEcran ? 14 : 22 }]}>
          {/* Arche de mihrab */}
          <View
            style={[
              styles.arche,
              {
                width: largeurArche,
                height: hauteurArche,
                borderTopLeftRadius: largeurArche / 2,
                borderTopRightRadius: largeurArche / 2,
              },
            ]}
          >
            <View
              style={[
                styles.archeInterieure,
                { borderTopLeftRadius: largeurArche / 2 - 10, borderTopRightRadius: largeurArche / 2 - 10 },
              ]}
            >
              <Text style={[styles.etoile, petitEcran && { fontSize: 30 }]}>۞</Text>
              <Text style={[styles.titre, petitEcran && { fontSize: 27, lineHeight: 36 }]}>Le Registre</Text>
            </View>
          </View>

          <View style={styles.filet}>
            <View style={styles.filetLigne} />
            <Text style={styles.filetEtoile}>✦</Text>
            <View style={styles.filetLigne} />
          </View>

          <Text style={[styles.sousTitre, petitEcran && { fontSize: 14, lineHeight: 22 }]}>
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
          <Pressable style={({ pressed }) => [styles.btnOr, pressed && { opacity: 0.9 }]} onPress={onLogin}>
            <Text style={styles.btnOrTexte}>Se connecter</Text>
          </Pressable>
          <Text style={styles.mention}>
            L'accès est attribué par l'administrateur du registre.
          </Text>
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
    justifyContent: "space-between",
  },

  hero: { flex: 1, alignItems: "center", justifyContent: "center" },

  arche: {
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.or,
    padding: 10,
    backgroundColor: COLORS.nuitProfonde,
  },
  archeInterieure: {
    flex: 1,
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
  mention: {
    color: COLORS.ivoireDoux,
    fontFamily: FONTS.semibold,
    fontSize: 12.5,
    textAlign: "center",
    opacity: 0.8,
  },
});
