import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Session } from "../App";
import { COLORS, CONTENT_MAX_WIDTH, FONTS } from "../components/theme";
import RegisterUnionScreen from "./RegisterUnionScreen";
import SearchScreen from "./SearchScreen";
import UnionsScreen from "./UnionsScreen";

type Props = {
  session: Session;
  onLogout: () => void;
};

type Onglet = "enregistrer" | "verifier" | "unions";

const ONGLETS: { id: Onglet; label: string }[] = [
  { id: "enregistrer", label: "Enregistrer" },
  { id: "verifier", label: "Vérifier" },
  { id: "unions", label: "Unions" },
];

export default function HomeScreen({ session, onLogout }: Props) {
  const insets = useSafeAreaInsets();
  const [onglet, setOnglet] = useState<Onglet>("enregistrer");

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <View style={styles.contenu}>
        <View style={styles.entete}>
          <View style={{ flex: 1 }}>
            <Text style={styles.marque}>Le Registre</Text>
            <Text style={styles.identite} numberOfLines={1}>
              {session.nom} · {session.communaute}
            </Text>
          </View>
          <Pressable onPress={onLogout} hitSlop={10}>
            <Text style={styles.deconnexion}>Se déconnecter</Text>
          </Pressable>
        </View>

        <View style={styles.segments}>
          {ONGLETS.map((o) => (
            <Pressable
              key={o.id}
              style={[styles.segment, onglet === o.id && styles.segmentActif]}
              onPress={() => setOnglet(o.id)}
            >
              <Text style={[styles.segmentTexte, onglet === o.id && styles.segmentTexteActif]}>
                {o.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 48 + insets.bottom, paddingTop: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {onglet === "enregistrer" && (
            <RegisterUnionScreen session={session} onVoirUnions={() => setOnglet("unions")} />
          )}
          {onglet === "verifier" && <SearchScreen />}
          {onglet === "unions" && <UnionsScreen />}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg, alignItems: "center" },
  contenu: { flex: 1, width: "100%", maxWidth: CONTENT_MAX_WIDTH, paddingHorizontal: 20 },

  entete: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  marque: { fontFamily: FONTS.extrabold, fontSize: 19, color: COLORS.text },
  identite: { fontFamily: FONTS.semibold, fontSize: 12.5, color: COLORS.muted, marginTop: 2 },
  deconnexion: { fontFamily: FONTS.semibold, fontSize: 13, color: COLORS.muted, textDecorationLine: "underline" },

  segments: {
    flexDirection: "row",
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    padding: 4,
    marginTop: 10,
  },
  segment: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 11,
    alignItems: "center",
  },
  segmentActif: { backgroundColor: COLORS.surface, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  segmentTexte: { fontFamily: FONTS.semibold, fontSize: 14, color: COLORS.muted },
  segmentTexteActif: { color: COLORS.text, fontFamily: FONTS.bold },
});
