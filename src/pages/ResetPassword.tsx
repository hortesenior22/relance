import { useState, useEffect, FormEvent } from "react";
import { supabase } from "../lib/supabase";
import logoUrl from "../assets/logo_relance.jpg";

export default function ResetPassword() {
  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [hasSession, setHasSession] = useState<boolean>(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      // session estará definido si el usuario llegó desde el enlace de recuperación
      setHasSession(!!session);
    });
  }, []);

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

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-md p-8">
        <div className="flex justify-center mb-6">
          <img src={logoUrl} alt="Relance" className="h-8 rounded-md" />
        </div>

        {success ? (
          <div className="text-center">
            <div className="text-5xl mb-4 flex justify-center">
              <svg className="size-12">
                <use href="icons.svg#icon-success" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-bold text-white mb-2">
              Contraseña actualizada
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Tu contraseña se ha cambiado correctamente.
            </p>
            <a href="/" className="btn-primary block w-full text-center">
              Ir al inicio
            </a>
          </div>
        ) : !hasSession ? (
          <div className="text-center">
            <div className="text-5xl mb-4 flex justify-center text-yellow-400">
              <svg className="size-12">
                <use href="icons.svg#icon-warning" />
              </svg>
            </div>
            <h2 className="font-display text-xl font-bold text-white mb-2">
              Enlace inválido o expirado
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Solicita un nuevo enlace de recuperación desde la pantalla de
              inicio de sesión.
            </p>
            <a href="/" className="btn-secondary block w-full text-center">
              Volver al inicio
            </a>
          </div>
        ) : (
          <>
            <h2 className="font-display text-2xl font-bold text-white text-center mb-1">
              Nueva contraseña
            </h2>
            <p className="text-gray-500 text-sm text-center mb-6">
              Elige una contraseña segura para tu cuenta
            </p>

            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" viewBox="0 0 640 640">
                        <use href="/icons.svg#icon-eye-slash" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 640 640">
                        <use href="/icons.svg#icon-eye" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  Confirmar contraseña
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repite la contraseña"
                  className="input-field"
                />
                {confirm && confirm !== password && (
                  <p className="text-xs text-red-400 mt-1">No coinciden</p>
                )}
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex justify-center items-center gap-2 disabled:opacity-60"
              >
                {loading ? "Actualizando..." : "Actualizar contraseña"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
