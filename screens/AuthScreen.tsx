import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, CONTENT_MAX_WIDTH, FONTS } from "../components/theme";
import { supabase } from "../lib/supabase";

type Props = {
  initialMode?: "login" | "signup";
  onAuthenticated: (nom: string, communaute: string, email: string) => void;
  onBack: () => void;
};

export default function AuthScreen({ initialMode = "login", onAuthenticated, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [nom, setNom] = useState("");
  const [communaute, setCommunaute] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignup = mode === "signup";

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password) { setError("Entrez votre email et votre mot de passe."); return; }
    setLoading(true);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (signInError || !data.user) {
      setLoading(false);
      setError(signInError?.message === "Invalid login credentials" ? "Email ou mot de passe incorrect." : signInError?.message ?? "Connexion impossible.");
      return;
    }
    const { data: profile, error: profileError } = await supabase.from("profiles").select("nom, mosquee").eq("id", data.user.id).single();
    setLoading(false);
    if (profileError || !profile) { setError("Profil introuvable pour ce compte."); return; }
    onAuthenticated(profile.nom, profile.mosquee, data.user.email ?? "");
  };

  const handleSignup = async () => {
    setError(null);
    if (!nom.trim()) { setError("Entrez votre nom."); return; }
    if (!communaute.trim()) { setError("Indiquez votre communauté ou votre lieu de culte."); return; }
    if (!email.trim() || !email.includes("@")) { setError("Entrez un email valide."); return; }
    if (password.length < 6) { setError("Le mot de passe doit faire au moins 6 caractères."); return; }
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { nom: nom.trim(), mosquee: communaute.trim() } },
    });
    setLoading(false);
    if (signUpError || !data.user) {
      const msg = signUpError?.message ?? "";
      setError(msg === "User already registered" ? "Un compte existe déjà avec cet email." : msg || "Inscription impossible.");
      return;
    }
    onAuthenticated(nom.trim(), communaute.trim(), email.trim());
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 16 }]}>
      <View style={styles.contenu}>
        <Pressable style={styles.backBtn} onPress={onBack} hitSlop={10}>
          <Text style={styles.backBtnText}>‹</Text>
        </Pressable>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>{isSignup ? "Créer mon compte témoin" : "Connexion"}</Text>
            <Text style={styles.subtitle}>
              {isSignup
                ? "Le registre est réservé aux témoins qui enregistrent les cérémonies."
                : "Content de vous revoir."}
            </Text>

            <View style={styles.form}>
              {isSignup && (
                <>
                  <View>
                    <Text style={styles.label}>Votre nom complet</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Youssef Benali"
                      placeholderTextColor={COLORS.soft}
                      value={nom}
                      onChangeText={setNom}
                      autoCorrect={false}
                    />
                  </View>
                  <View>
                    <Text style={styles.label}>Communauté ou lieu de culte</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Al-Fath, Anvers"
                      placeholderTextColor={COLORS.soft}
                      value={communaute}
                      onChangeText={setCommunaute}
                      autoCorrect={false}
                    />
                  </View>
                </>
              )}

              <View>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="vous@email.com"
                  placeholderTextColor={COLORS.soft}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                />
              </View>

              <View>
                <Text style={styles.label}>Mot de passe</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.soft}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              {error && <Text style={styles.error}>{error}</Text>}

              <Pressable
                style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.9 }]}
                onPress={isSignup ? handleSignup : handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.onAccent} />
                ) : (
                  <Text style={styles.submitText}>{isSignup ? "Créer le compte" : "Se connecter"}</Text>
                )}
              </Pressable>
            </View>

            <Pressable onPress={() => { setError(null); setMode(isSignup ? "login" : "signup"); }}>
              <Text style={styles.switchText}>
                {isSignup ? "Déjà inscrit ? Se connecter" : "Pas encore de compte ? S'inscrire"}
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg, alignItems: "center" },
  contenu: { flex: 1, width: "100%", maxWidth: CONTENT_MAX_WIDTH, paddingHorizontal: 24 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  backBtnText: { fontSize: 22, color: COLORS.text, fontFamily: FONTS.bold, marginTop: -2 },

  scroll: { paddingTop: 20, paddingBottom: 40 },
  title: { fontFamily: FONTS.display, fontSize: 28, color: COLORS.accentDark, marginBottom: 6, lineHeight: 40 },
  subtitle: { fontFamily: FONTS.regular, fontSize: 15, color: COLORS.muted, marginBottom: 26 },

  form: { gap: 16 },
  label: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.text, marginBottom: 7 },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 52,
    fontSize: 15.5,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  error: { color: COLORS.danger, fontFamily: FONTS.semibold, fontSize: 13, textAlign: "center" },
  submitBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  submitText: { color: COLORS.onAccent, fontFamily: FONTS.bold, fontSize: 16 },
  switchText: {
    color: COLORS.muted,
    fontFamily: FONTS.semibold,
    fontSize: 13.5,
    textAlign: "center",
    marginTop: 24,
  },
});
