import { useState, useEffect, FormEvent, ChangeEvent, MouseEvent } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import logoUrl from "../assets/logo_relance.jpg";
import { showAlert } from "../utils/alert";

export default function ResetPasswordModal(): JSX.Element | null {
  const { isResetPasswordOpen, closeResetPasswordModal } = useAuth() as {
    isResetPasswordOpen: boolean;
    closeResetPasswordModal: () => void;
  };

  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [hasSession, setHasSession] = useState<boolean>(false);

  // comprobar sesión desde el link de recuperación
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
    });
  }, []);

  if (!isResetPasswordOpen) return null;

  const handleReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeResetPasswordModal();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-card relative">
        {/* Cerrar */}
        <button
          onClick={closeResetPasswordModal}
          className="absolute top-4 right-4 text-gray-500 hover:text-white"
        >
          ✕
        </button>
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logoUrl} alt="Relance" className="h-8 rounded-md" />
        </div>
        {/* {success ? (
          <div className="text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Contraseña actualizada
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Tu contraseña se ha cambiado correctamente.
            </p>
            <button
              onClick={closeResetPasswordModal}
              className="btn-primary w-full"
            >
              Cerrar
            </button>
          </div>
        ) : !hasSession ? (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <svg className="w-12 h-12 text-yellow-400">
                <use href="icons.svg#icon-warning" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">
              Enlace inválido o expirado
            </h2>

            <p className="text-gray-400 text-sm mb-6">
              Solicita un nuevo enlace de recuperación desde el login.
            </p>

            <button
              onClick={closeResetPasswordModal}
              className="btn-secondary w-full"
            >
              Cerrar
            </button>
          </div> */}
        {/* ) : (*/}
        <>
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            Nueva contraseña
          </h2>

          <form onSubmit={handleReset} className="space-y-4">
            {/* Nueva password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                placeholder="Mínimo 8 caracteres"
                className="input-field pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                👁
              </button>
            </div>

            {/* Confirmación */}
            <input
              type={showPassword ? "text" : "password"}
              required
              value={confirm}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setConfirm(e.target.value)
              }
              placeholder="Repite la contraseña"
              className="input-field"
            />

            {confirm && confirm !== password && (
              <p className="text-xs text-red-400">No coinciden</p>
            )}

            {/* Error */}
            {error && <div className="text-red-400 text-sm">{error}</div>}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center items-center gap-2"
            >
              {loading ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </form>
        </>
        {/* )} */}
      </div>
    </div>
  );
}
