import Swal, { SweetAlertIcon, SweetAlertResult } from "sweetalert2";

export type ShowAlertProps = {
  icon?: SweetAlertIcon;
  title?: string;
  html?: string;

  showConfirmButton?: boolean;
  confirmButtonText?: string;

  showCancelButton?: boolean;
  cancelButtonText?: string;

  // opcional: permitir cerrar con ESC o click fuera
  allowOutsideClick?: boolean;
  allowEscapeKey?: boolean;
};

export function showAlert({
  icon = "info",
  title = "",
  html = "",

  showConfirmButton = true,
  confirmButtonText = "Aceptar",

  showCancelButton = false,
  cancelButtonText = "Cancelar",

  allowOutsideClick = true,
  allowEscapeKey = true,
}: ShowAlertProps): Promise<SweetAlertResult<any>> {
  return Swal.fire({
    icon,
    title,
    html,

    showConfirmButton,
    confirmButtonText,

    showCancelButton,
    cancelButtonText,

    allowOutsideClick,
    allowEscapeKey,

    background: "#1f2937", // dark-800
    color: "#e5e7eb",

    customClass: {
      popup: "rounded-xl border border-white/10 shadow-2xl px-2 py-4",
      title: "text-white font-semibold text-lg font-display",
      htmlContainer: "text-gray-300 text-sm leading-relaxed",
      confirmButton:
        "bg-brand hover:bg-brand/80 text-dark font-semibold p-2 text-sm rounded-lg transition",
      cancelButton:
        "bg-white/10 hover:bg-white/20 text-white p-2 text-sm rounded-lg transition ml-2",
    },

    buttonsStyling: false,

    showClass: {
      popup: "animate-slide-down",
    },
    hideClass: {
      popup: "animate-fade-out",
    },
  });
}
