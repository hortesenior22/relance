import Swal, { SweetAlertOptions } from "sweetalert2";

type AlertOptions = {
  title: string;
  text?: string;
  icon?: "success" | "error" | "warning" | "info" | "question";
  customIcon?: string; // id del sprite (ej: icon-warning)
  showConfirmButton?: boolean;
  confirmText?: string;
  onClose?: () => void;
};

export const showAlert = ({
  title,
  text,
  icon,
  customIcon,
  showConfirmButton = true,
  confirmText = "Aceptar",
  onClose,
}: AlertOptions) => {
  const options: SweetAlertOptions = {
    title,
    text: customIcon ? undefined : text,
    icon: customIcon ? undefined : icon,
    confirmButtonText: confirmText,
    showConfirmButton,
    customClass: {
      popup: "bg-gray-900 text-white",
      confirmButton: "btn-primary w-full",
    },
    buttonsStyling: false,
  };

  if (customIcon) {
    options.html = `
      <div class="flex flex-col items-center">
        <svg class="w-12 h-12 mb-4">
          <use href="icons.svg#${customIcon}"></use>
        </svg>
        <p class="text-gray-400 text-sm">${text ?? ""}</p>
      </div>
    `;
  }

  return Swal.fire(options).then(() => {
    onClose?.();
  });
};
