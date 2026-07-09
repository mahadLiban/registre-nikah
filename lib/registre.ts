import { supabase } from "./supabase";

export type Personne = {
  id: string;
  prenom: string;
  nom: string;
  date_naissance: string;
  sexe: "H" | "F";
};

export type Union = {
  id: string;
  epoux_id: string;
  epouse_id: string;
  date_mariage: string;
  lieu: string | null;
  imam: string | null; // nom du témoin qui a enregistré la cérémonie
  statut: "actif" | "divorce" | "veuvage";
  date_fin: string | null;
  cloture_par: string | null; // nom du compte qui a clôturé
  epoux: Personne;
  epouse: Personne;
};

const SELECTION_UNION = `*,
  epoux:personnes!mariages_epoux_id_fkey(*),
  epouse:personnes!mariages_epouse_id_fkey(*)`;

// ---- Statut d'une personne : union en cours > dernière union terminée > aucune

export type KindStatut = "actif" | "divorce" | "veuf" | "none";

export type Statut = {
  kind: KindStatut;
  label: string;
  union: Union | null;
};

export function statutDepuisUnions(unions: Union[]): Statut {
  if (unions.length === 0) return { kind: "none", label: "Libre", union: null };
  const active = unions.find((u) => u.statut === "actif");
  if (active) return { kind: "actif", label: "Fiancé(e)", union: active };
  const triees = [...unions].sort((a, b) =>
    (a.date_fin || a.date_mariage).localeCompare(b.date_fin || b.date_mariage)
  );
  const derniere = triees[triees.length - 1];
  if (derniere.statut === "veuvage") return { kind: "veuf", label: "Veuf(ve)", union: derniere };
  return { kind: "divorce", label: "Rupture", union: derniere };
}

export function conjointDe(u: Union, personneId: string): Personne {
  return u.epoux_id === personneId ? u.epouse : u.epoux;
}

// ---- Vérification

export type ResultatRecherche = { personne: Personne; statut: Statut };

export async function rechercherStatuts(q: string): Promise<ResultatRecherche[]> {
  const motif = `%${q.trim()}%`;
  const { data: personnes, error } = await supabase
    .from("personnes")
    .select("*")
    .or(`prenom.ilike.${motif},nom.ilike.${motif}`)
    .order("nom")
    .limit(30);
  if (error) throw new Error(error.message);
  if (!personnes || personnes.length === 0) return [];

  const ids = personnes.map((p) => p.id).join(",");
  const { data: unions, error: erreurUnions } = await supabase
    .from("mariages")
    .select(SELECTION_UNION)
    .or(`epoux_id.in.(${ids}),epouse_id.in.(${ids})`);
  if (erreurUnions) throw new Error(erreurUnions.message);
  const toutes = (unions ?? []) as unknown as Union[];

  return personnes.map((p) => ({
    personne: p,
    statut: statutDepuisUnions(
      toutes.filter((u) => u.epoux_id === p.id || u.epouse_id === p.id)
    ),
  }));
}

// ---- Alerte en temps réel (par prénom + nom)

export async function unionActiveDe(prenom: string, nom: string): Promise<Union | null> {
  if (!prenom.trim() || !nom.trim()) return null;
  const { data: personnes, error } = await supabase
    .from("personnes")
    .select("id")
    .ilike("prenom", prenom.trim())
    .ilike("nom", nom.trim());
  if (error || !personnes || personnes.length === 0) return null;

  const ids = personnes.map((p) => p.id).join(",");
  const { data: unions } = await supabase
    .from("mariages")
    .select(SELECTION_UNION)
    .eq("statut", "actif")
    .or(`epoux_id.in.(${ids}),epouse_id.in.(${ids})`)
    .limit(1);
  return ((unions ?? [])[0] as unknown as Union) ?? null;
}

// ---- Registre

export async function listerUnions(): Promise<Union[]> {
  const { data, error } = await supabase
    .from("mariages")
    .select(SELECTION_UNION)
    .order("date_mariage", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Union[];
}

// ---- Enregistrement

type NouvellePersonne = { prenom: string; nom: string; date_naissance: string };

async function trouverOuCreerPersonne(p: NouvellePersonne, sexe: "H" | "F"): Promise<Personne> {
  // ilike sans joker = comparaison exacte insensible à la casse
  const { data: existante, error: erreurRecherche } = await supabase
    .from("personnes")
    .select("*")
    .ilike("prenom", p.prenom.trim())
    .ilike("nom", p.nom.trim())
    .eq("date_naissance", p.date_naissance)
    .eq("sexe", sexe)
    .maybeSingle();
  if (erreurRecherche) throw new Error(erreurRecherche.message);
  if (existante) return existante;

  const { data: creee, error: erreurCreation } = await supabase
    .from("personnes")
    .insert({ prenom: p.prenom.trim(), nom: p.nom.trim(), date_naissance: p.date_naissance, sexe })
    .select()
    .single();
  if (erreurCreation) throw new Error(erreurCreation.message);
  return creee;
}

export type DemandeUnion = {
  epoux: NouvellePersonne;
  epouse: NouvellePersonne;
  date_mariage: string;
  lieu: string;
  temoin: string;
};

export async function enregistrerUnion(demande: DemandeUnion): Promise<void> {
  const epoux = await trouverOuCreerPersonne(demande.epoux, "H");
  const epouse = await trouverOuCreerPersonne(demande.epouse, "F");
  if (epoux.id === epouse.id) {
    throw new Error("Les deux personnes ne peuvent pas être identiques.");
  }

  const { data: session } = await supabase.auth.getSession();
  const { error } = await supabase.from("mariages").insert({
    epoux_id: epoux.id,
    epouse_id: epouse.id,
    date_mariage: demande.date_mariage,
    lieu: demande.lieu.trim() || null,
    imam: demande.temoin,
    enregistre_par: session.session?.user.id ?? null,
  });
  if (error) throw new Error(error.message);
}

// ---- Clôture

export async function cloturerUnion(
  unionId: string,
  type: "divorce" | "veuvage",
  dateFin: string,
  par: string
): Promise<void> {
  const { error } = await supabase
    .from("mariages")
    .update({ statut: type, date_fin: dateFin, cloture_par: par })
    .eq("id", unionId)
    .eq("statut", "actif");
  if (error) throw new Error(error.message);
}

// ---- Corrections (réservées au compte admin — la base le vérifie aussi via RLS)

export async function corrigerPersonne(
  personneId: string,
  champs: { prenom: string; nom: string }
): Promise<void> {
  const { error } = await supabase
    .from("personnes")
    .update({ prenom: champs.prenom.trim(), nom: champs.nom.trim() })
    .eq("id", personneId);
  if (error) throw new Error(error.message);
}

export async function corrigerUnion(
  unionId: string,
  champs: { date_mariage: string; lieu: string }
): Promise<void> {
  const { error } = await supabase
    .from("mariages")
    .update({ date_mariage: champs.date_mariage, lieu: champs.lieu.trim() || null })
    .eq("id", unionId);
  if (error) throw new Error(error.message);
}

export async function rouvrirUnion(unionId: string): Promise<void> {
  const { error } = await supabase
    .from("mariages")
    .update({ statut: "actif", date_fin: null, cloture_par: null })
    .eq("id", unionId);
  if (error) throw new Error(error.message);
}

export async function supprimerUnion(unionId: string): Promise<void> {
  const { error } = await supabase.from("mariages").delete().eq("id", unionId);
  if (error) throw new Error(error.message);
}
