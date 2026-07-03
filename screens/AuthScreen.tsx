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
import { COLORS, FONTS } from "../components/theme";
import { supabase } from "../lib/supabase";

type Props = {
  initialMode?: "login" | "signup";
  onAuthenticated: (nom: string, mosquee: string, email: string) => void;
  onBack: () => void;
};

export default function AuthScreen({ initialMode = "login", onAuthenticated, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [nom, setNom] = useState("");
  const [mosquee, setMosquee] = useState("");
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
    if (!mosquee.trim()) { setError("Entrez le nom de votre mosquée."); return; }
    if (!email.trim() || !email.includes("@")) { setError("Entrez un email valide."); return; }
    if (password.length < 6) { setError("Le mot de passe doit faire au moins 6 caractères."); return; }
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { nom: nom.trim(), mosquee: mosquee.trim() } },
    });
    setLoading(false);
    if (signUpError || !data.user) {
      const msg = signUpError?.message ?? "";
      setError(msg === "User already registered" ? "Un compte existe déjà avec cet email." : msg || "Inscription impossible.");
      return;
    }
    onAuthenticated(nom.trim(), mosquee.trim(), email.trim());
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 16 }]}>
      <Pressable style={styles.backBtn} onPress={onBack} hitSlop={10}>
        <Text style={styles.backBtnText}>‹</Text>
      </Pressable>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{isSignup ? "Créer un compte imam" : "Connectez-vous"}</Text>
          <Text style={styles.subtitle}>
            {isSignup
              ? "L'accès au registre est réservé aux imams."
              : "Accédez au registre des mariages religieux."}
          </Text>

          <View style={styles.form}>
            {isSignup && (
              <>
                <View>
                  <Text style={styles.label}>Nom complet</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Imam Youssef Benali"
                    placeholderTextColor={COLORS.textSoft}
                    value={nom}
                    onChangeText={setNom}
                    autoCorrect={false}
                  />
                </View>
                <View>
                  <Text style={styles.label}>Mosquée</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Mosquée Al-Fath, Anvers"
                    placeholderTextColor={COLORS.textSoft}
                    value={mosquee}
                    onChangeText={setMosquee}
                    autoCorrect={false}
                  />
                </View>
              </>
            )}

            <View>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="imam@email.com"
                placeholderTextColor={COLORS.textSoft}
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
                placeholderTextColor={COLORS.textSoft}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <Pressable
              style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.88 }]}
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
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 24 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 6,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  backBtnText: { fontSize: 22, color: COLORS.text, fontFamily: FONTS.semibold, marginTop: -2 },

  scroll: { paddingTop: 16, paddingBottom: 40, maxWidth: 480, width: "100%", alignSelf: "center" },
  title: { fontFamily: FONTS.serif, fontSize: 28, color: COLORS.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: COLORS.textMuted, fontFamily: FONTS.regular, marginBottom: 24 },

  form: { gap: 16 },
  label: { fontSize: 12, color: COLORS.textMuted, fontFamily: FONTS.regular, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 6,
    paddingHorizontal: 14,
    minHeight: 48,
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  error: { color: COLORS.red, fontFamily: FONTS.medium, fontSize: 13, textAlign: "center" },
  submitBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 6,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  submitText: { color: COLORS.onAccent, fontFamily: FONTS.semibold, fontSize: 15 },

  switchText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.medium,
    fontSize: 13.5,
    textAlign: "center",
    marginTop: 22,
  },
});
