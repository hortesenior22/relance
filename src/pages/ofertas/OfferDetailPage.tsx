// src/pages/ofertas/OfferDetailsPage.tsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

import OfferDetailsModal from "./OfferDetailsModal";

export default function OfferDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [oferta, setOferta] = useState<any>(null);
  const [yaPostulado, setYaPostulado] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // Cargar oferta
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!id) return;

    loadOferta();
  }, [id]);

  async function loadOferta() {
    try {
      setLoading(true);

      // ── Oferta ───────────────────────────────────────────────
      const { data, error } = await supabase
        .from("ofertas")
        .select(
          `
          *,
          tecnologias:oferta_tecnologia(
            id_tecnologia,
            tecnologia:id_tecnologia(
              id,
              nombre
            )
          )
        `,
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      // ── Transformar tecnologías ──────────────────────────────
      const tecnologias =
        data?.tecnologias?.map((t: any) => ({
          id_tecnologia: t.tecnologia?.id,
          nombre: t.tecnologia?.nombre,
        })) ?? [];

      const ofertaTransformada = {
        ...data,
        tecnologias,
      };

      setOferta(ofertaTransformada);

      // ── Verificar postulación ────────────────────────────────
      if (user?.id) {
        const { data: postData } = await supabase
          .from("postulaciones")
          .select("id")
          .eq("id_oferta", id)
          .eq("id_estudiante", user.id)
          .maybeSingle();

        setYaPostulado(!!postData);
      }
    } catch (err) {
      console.error("Error cargando oferta:", err);
    } finally {
      setLoading(false);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Postular
  // ─────────────────────────────────────────────────────────────

  async function handlePostular() {
    if (!user || !oferta) return;

    try {
      const { error } = await supabase.from("postulaciones").insert({
        id_oferta: oferta.id,
        id_estudiante: user.id,
      });

      if (error) throw error;

      setYaPostulado(true);
    } catch (err) {
      console.error(err);
      alert("No se pudo realizar la postulación");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-bg)",
          color: "var(--color-text)",
          fontFamily: "Plus Jakarta Sans, sans-serif",
        }}
      >
        Cargando oferta...
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Oferta no encontrada
  // ─────────────────────────────────────────────────────────────

  if (!oferta) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-bg)",
          color: "var(--color-text)",
          fontFamily: "Plus Jakarta Sans, sans-serif",
        }}
      >
        Oferta no encontrada
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────

  return (
    <OfferDetailsModal
      oferta={oferta}
      onClose={() => navigate(-1)}
      onPostular={handlePostular}
      yaPostulado={yaPostulado}
      isEstudiante={true}
    />
  );
}
