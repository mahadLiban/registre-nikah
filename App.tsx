import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
} from "@expo-google-fonts/ibm-plex-sans";
import {
  SourceSerif4_600SemiBold,
  SourceSerif4_700Bold,
} from "@expo-google-fonts/source-serif-4";
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

export type Session = { nom: string; mosquee: string; email: string };
type Screen = "loading" | "welcome" | "login" | "signup" | "home";

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  constructor(props: any) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, backgroundColor: "#FAF8F3", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ fontSize: 16, color: "#B3362B", fontWeight: "bold", marginBottom: 12 }}>Erreur application</Text>
          <Text style={{ fontSize: 12, color: "#333", textAlign: "center" }}>{this.state.error.message}</Text>
          <Text style={{ fontSize: 10, color: "#888", marginTop: 12, textAlign: "center" }}>{this.state.error.stack?.slice(0, 300)}</Text>
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
    SourceSerif4_600SemiBold,
    SourceSerif4_700Bold,
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
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
      setSession({ nom: profile.nom, mosquee: profile.mosquee, email: user.email ?? "" });
      setScreen("home");
    })();
  }, []);

  const handleAuthenticated = (nom: string, mosquee: string, email: string) => {
    setSession({ nom, mosquee, email });
    setScreen("home");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setScreen("welcome");
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
        <StatusBar style="light" />
      </>
    );
  }

  if (screen === "home" && session) {
    return (
      <>
        <HomeScreen session={session} onLogout={handleLogout} />
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <>
      <WelcomeScreen onStart={() => setScreen("signup")} onLogin={() => setScreen("login")} />
      <StatusBar style="light" />
    </>
  );
}
