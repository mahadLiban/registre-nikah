import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Session } from "../App";
import { COLORS, FONTS, MOBILE_BREAKPOINT } from "../components/theme";
import { Stats, statsRegistre } from "../lib/registre";
import DashboardScreen from "./DashboardScreen";
import EndUnionScreen from "./EndUnionScreen";
import MosquesScreen from "./MosquesScreen";
import NewMarriageScreen from "./NewMarriageScreen";
import SearchScreen from "./SearchScreen";

type Props = {
  session: Session;
  onLogout: () => void;
};

export type Vue = "dashboard" | "recherche" | "nouveau-mariage" | "nouveau-divorce" | "mosquees";

const NAV: { id: Vue; label: string }[] = [
  { id: "dashboard", label: "Tableau de bord" },
  { id: "recherche", label: "Vérifier une personne" },
  { id: "nouveau-mariage", label: "Nouveau mariage" },
  { id: "nouveau-divorce", label: "Nouveau divorce / veuvage" },
  { id: "mosquees", label: "Mosquées & imams" },
];

export default function HomeScreen({ session, onLogout }: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isMobile = width < MOBILE_BREAKPOINT;
  const [vue, setVue] = useState<Vue>("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    statsRegistre().then(setStats).catch(() => setStats(null));
  }, [vue]);

  const sidebar = (
    <View
      style={[
        isMobile ? styles.topbar : styles.sidebar,
        { paddingTop: (isMobile ? 20 : 32) + insets.top },
      ]}
    >
      <View>
        <Text style={styles.logo}>Registre des Mariages</Text>
        <Text style={styles.logoSub}>Registre officiel des mariages religieux</Text>
      </View>

      <View style={isMobile ? styles.navRow : styles.navCol}>
        {NAV.map((item) => (
          <Pressable
            key={item.id}
            style={[styles.navItem, vue === item.id && styles.navItemActive]}
            onPress={() => setVue(item.id)}
          >
            <Text style={[styles.navText, vue === item.id && styles.navTextActive]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
        <Pressable style={styles.navItem} onPress={onLogout}>
          <Text style={[styles.navText, { color: COLORS.sidebarFooter }]}>
            Déconnexion ({session.nom})
          </Text>
        </Pressable>
      </View>

      {!isMobile && (
        <Text style={styles.sidebarFooter}>
          {stats
            ? `${stats.mariages} mariages enregistrés · ${stats.mosquees} mosquées`
            : " "}
        </Text>
      )}
    </View>
  );

  return (
    <View style={[styles.root, { flexDirection: isMobile ? "column" : "row" }]}>
      {sidebar}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          isMobile ? styles.mainMobile : styles.main,
          { paddingBottom: 60 + insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {vue === "dashboard" && <DashboardScreen onNaviguer={setVue} />}
        {vue === "recherche" && <SearchScreen />}
        {vue === "nouveau-mariage" && <NewMarriageScreen />}
        {vue === "nouveau-divorce" && <EndUnionScreen />}
        {vue === "mosquees" && <MosquesScreen />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },

  sidebar: {
    width: 260,
    flexShrink: 0,
    backgroundColor: COLORS.sidebarBg,
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 32,
  },
  topbar: {
    width: "100%",
    backgroundColor: COLORS.sidebarBg,
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 16,
  },

  logo: {
    fontFamily: FONTS.serif,
    fontSize: 21,
    lineHeight: 27,
    color: COLORS.sidebarTitle,
  },
  logoSub: {
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: COLORS.sidebarMuted,
    marginTop: 8,
    fontFamily: FONTS.regular,
  },

  navCol: { gap: 4 },
  navRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  navItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  navItemActive: { backgroundColor: COLORS.accent },
  navText: { fontSize: 14, color: COLORS.sidebarNavIdle, fontFamily: FONTS.regular },
  navTextActive: { color: COLORS.onAccent, fontFamily: FONTS.semibold },

  sidebarFooter: {
    marginTop: "auto",
    fontSize: 12,
    color: COLORS.sidebarFooter,
    fontFamily: FONTS.regular,
  },

  main: { padding: 48, paddingHorizontal: 56 },
  mainMobile: { padding: 20, paddingTop: 28 },
});
