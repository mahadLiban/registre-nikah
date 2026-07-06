import { Amiri_400Regular, Amiri_700Bold } from "@expo-google-fonts/amiri";
import {
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { COLORS } from "./components/theme";
import { supabase } from "./lib/supabase";
import AuthScreen from "./screens/AuthScreen";
import HomeScreen from "./screens/HomeScreen";
import WelcomeScreen from "./screens/WelcomeScreen";

export type Session = { nom: string; communaute: string; email: string };
type Screen = "loading" | "welcome" | "login" | "signup" | "home";

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  constructor(props: any) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, backgroundColor: "#FAFAF8", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ fontSize: 16, color: "#B3362B", fontWeight: "bold", marginBottom: 12 }}>Erreur application</Text>
          <Text style={{ fontSize: 12, color: "#333", textAlign: "center" }}>{this.state.error.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const [fontsLoaded] = useFonts({
    Amiri_400Regular,
    Amiri_700Bold,
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
  const [screen, setScreen] = useState<Screen>("loading");
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));
      const user = data.session?.user;
      if (!user) {
        setScreen("welcome");
        return;
      }
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("nom, mosquee")
        .eq("id", user.id)
        .single();
      if (error || !profile) {
        setScreen("welcome");
        return;
      }
      setSession({ nom: profile.nom, communaute: profile.mosquee, email: user.email ?? "" });
      setScreen("home");
    })();
  }, []);

  const handleAuthenticated = (nom: string, communaute: string, email: string) => {
    setSession({ nom, communaute, email });
    setScreen("home");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setScreen("welcome");
  };

  // Compte de démonstration partagé — pour essayer sans créer de compte.
  const handleDemo = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "demo@registre-nikah.app",
      password: "demo-nikah-2026",
    });
    if (error || !data.user) return;
    const { data: profile } = await supabase
      .from("profiles")
      .select("nom, mosquee")
      .eq("id", data.user.id)
      .single();
    setSession({
      nom: profile?.nom ?? "Témoin démo",
      communaute: profile?.mosquee ?? "Démonstration",
      email: data.user.email ?? "",
    });
    setScreen("home");
  };

  if (!fontsLoaded || screen === "loading") {
    return <View style={{ flex: 1, backgroundColor: COLORS.bg }} />;
  }

  if (screen === "login" || screen === "signup") {
    return (
      <>
        <AuthScreen
          initialMode={screen === "signup" ? "signup" : "login"}
          onAuthenticated={handleAuthenticated}
          onBack={() => setScreen("welcome")}
        />
        <StatusBar style="dark" />
      </>
    );
  }

  if (screen === "home" && session) {
    return (
      <>
        <HomeScreen session={session} onLogout={handleLogout} />
        <StatusBar style="dark" />
      </>
    );
  }

  return (
    <>
      <WelcomeScreen
        onStart={() => setScreen("signup")}
        onLogin={() => setScreen("login")}
        onDemo={handleDemo}
      />
      <StatusBar style="light" />
    </>
  );
}
