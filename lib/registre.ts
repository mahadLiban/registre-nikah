import { supabase } from "./supabase";

export type Personne = {
  id: string;
  prenom: string;
  nom: string;
  date_naissance: string;
  sexe: "H" | "F";
};

export type Mosquee = {
  id: string;
  nom: string;
  ville: string;
  imam: string;
};

export type Mariage = {
  id: string;
  epoux_id: string;
  epouse_id: string;
  date_mariage: string;
  lieu: string | null;
  mosquee_id: string | null;
  imam: string | null;
  statut: "actif" | "divorce" | "veuvage";
  date_fin: string | null;
  epoux: Personne;
  epouse: Personne;
  mosquee: Mosquee | null;
};

const SELECTION_MARIAGE = `*,
  epoux:personnes!mariages_epoux_id_fkey(*),
  epouse:personnes!mariages_epouse_id_fkey(*),
  mosquee:mosquees(*)`;

// ---- Statut matrimonial (logique du prototype : union active > dernière union terminée > célibataire)

export type KindStatut = "actif" | "divorce" | "veuf" | "none";

export type Statut = {
  kind: KindStatut;
  label: string;
  mariage: Mariage | null;
};

export function statutDepuisMariages(mariages: Mariage[]): Statut {
  if (mariages.length === 0) return { kind: "none", label: "Célibataire", mariage: null };
  const actif = mariages.find((m) => m.statut === "actif");
  if (actif) return { kind: "actif", label: "Marié(e)", mariage: actif };
  const tries = [...mariages].sort((a, b) =>
    (a.date_fin || a.date_mariage).localeCompare(b.date_fin || b.date_mariage)
  );
  const dernier = tries[tries.length - 1];
  if (dernier.statut === "veuvage") return { kind: "veuf", label: "Veuf(ve)", mariage: dernier };
  return { kind: "divorce", label: "Divorcé(e)", mariage: dernier };
}

export function conjointDe(m: Mariage, personneId: string): Personne {
  return m.epoux_id === personneId ? m.epouse : m.epoux;
}

// ---- Recherche

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
  const { data: mariages, error: erreurMariages } = await supabase
    .from("mariages")
    .select(SELECTION_MARIAGE)
    .or(`epoux_id.in.(${ids}),epouse_id.in.(${ids})`);
  if (erreurMariages) throw new Error(erreurMariages.message);
  const tous = (mariages ?? []) as unknown as Mariage[];

  return personnes.map((p) => ({
    personne: p,
    statut: statutDepuisMariages(
      tous.filter((m) => m.epoux_id === p.id || m.epouse_id === p.id)
    ),
  }));
}

// ---- Conflit en temps réel (par prénom + nom, comme le prototype)

export async function conflitActif(prenom: string, nom: string): Promise<Mariage | null> {
  if (!prenom.trim() || !nom.trim()) return null;
  const { data: personnes, error } = await supabase
    .from("personnes")
    .select("id")
    .ilike("prenom", prenom.trim())
    .ilike("nom", nom.trim());
  if (error || !personnes || personnes.length === 0) return null;

  const ids = personnes.map((p) => p.id).join(",");
  const { data: mariages } = await supabase
    .from("mariages")
    .select(SELECTION_MARIAGE)
    .eq("statut", "actif")
    .or(`epoux_id.in.(${ids}),epouse_id.in.(${ids})`)
    .limit(1);
  return ((mariages ?? [])[0] as unknown as Mariage) ?? null;
}

// ---- Statistiques (tableau de bord + pied de barre latérale)

export type Stats = { mariages: number; actifs: number; divorces: number; mosquees: number };

export async function statsRegistre(): Promise<Stats> {
  const compter = async (table: string, filtre?: { col: string; val: string }) => {
    let req = supabase.from(table).select("*", { count: "exact", head: true });
    if (filtre) req = req.eq(filtre.col, filtre.val);
    const { count, error } = await req;
    if (error) throw new Error(error.message);
    return count ?? 0;
  };
  const [mariages, actifs, divorces, mosquees] = await Promise.all([
    compter("mariages"),
    compter("mariages", { col: "statut", val: "actif" }),
    compter("mariages", { col: "statut", val: "divorce" }),
    compter("mosquees"),
  ]);
  return { mariages, actifs, divorces, mosquees };
}

export async function mariagesRecents(limite = 5): Promise<Mariage[]> {
  const { data, error } = await supabase
    .from("mariages")
    .select(SELECTION_MARIAGE)
    .order("date_mariage", { ascending: false })
    .limit(limite);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Mariage[];
}

export async function unionsActives(): Promise<Mariage[]> {
  const { data, error } = await supabase
    .from("mariages")
    .select(SELECTION_MARIAGE)
    .eq("statut", "actif")
    .order("date_mariage", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Mariage[];
}

// ---- Mosquées

export async function listerMosquees(): Promise<(Mosquee & { nb_mariages: number })[]> {
  const [{ data: mosquees, error }, { data: mariages, error: e2 }] = await Promise.all([
    supabase.from("mosquees").select("*").order("nom"),
    supabase.from("mosquees").select("id, mariages(count)"),
  ]);
  if (error) throw new Error(error.message);
  if (e2) throw new Error(e2.message);
  const compte = new Map(
    (mariages ?? []).map((m: any) => [m.id, m.mariages?.[0]?.count ?? 0])
  );
  return (mosquees ?? []).map((mq) => ({ ...mq, nb_mariages: compte.get(mq.id) ?? 0 }));
}

export async function ajouterMosquee(mq: { nom: string; ville: string; imam: string }): Promise<void> {
  const { error } = await supabase.from("mosquees").insert({
    nom: mq.nom.trim(),
    ville: mq.ville.trim(),
    imam: mq.imam.trim(),
  });
  if (error) throw new Error(error.message);
}

// ---- Enregistrement d'un mariage

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

export type DemandeMariage = {
  epoux: NouvellePersonne;
  epouse: NouvellePersonne;
  date_mariage: string;
  lieu: string;
  mosquee: Mosquee;
};

export async function enregistrerMariage(demande: DemandeMariage): Promise<void> {
  const epoux = await trouverOuCreerPersonne(demande.epoux, "H");
  const epouse = await trouverOuCreerPersonne(demande.epouse, "F");
  if (epoux.id === epouse.id) {
    throw new Error("L'époux et l'épouse ne peuvent pas être la même personne.");
  }

  const { data: session } = await supabase.auth.getSession();
  const { error } = await supabase.from("mariages").insert({
    epoux_id: epoux.id,
    epouse_id: epouse.id,
    date_mariage: demande.date_mariage,
    lieu: demande.lieu.trim() || demande.mosquee.ville,
    mosquee_id: demande.mosquee.id,
    imam: demande.mosquee.imam,
    enregistre_par: session.session?.user.id ?? null,
  });
  if (error) throw new Error(error.message);
}

// ---- Fin d'union

export async function finUnion(
  mariageId: string,
  type: "divorce" | "veuvage",
  dateFin: string
): Promise<void> {
  const { error } = await supabase
    .from("mariages")
    .update({ statut: type, date_fin: dateFin })
    .eq("id", mariageId)
    .eq("statut", "actif");
  if (error) throw new Error(error.message);
}
