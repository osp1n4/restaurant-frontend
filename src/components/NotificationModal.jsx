/**
 * Modal para mostrar notificaciones al usuario
 */
export default function NotificationModal({
  isOpen,
  type = 'info',
  title,
  message,
  onAccept,
  acceptText = 'Aceptar',
  onCancel,
  cancelText = 'Cancelar'
}) {
  // Log para debugging
  console.log('🎭 NotificationModal render:', { isOpen, type, title });

  if (!isOpen) return null;

  // Iconos y colores según el tipo
  const config = {
    success: {
      icon: 'check_circle',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    warning: {
      icon: 'warning',
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    info: {
      icon: 'info',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
    }
  };

  const { icon, iconColor, bgColor } = config[type] || config.info;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-background-dark w-full max-w-sm rounded-xl shadow-lg p-6 text-center flex flex-col items-center animate-fadeIn">
        {/* Icono */}
        <div className={`flex items-center justify-center size-16 ${bgColor} rounded-full mb-4`}>
          <span className={`material-symbols-outlined text-4xl ${iconColor}`}>
            {icon}
          </span>
        </div>

        {/* Título */}
        <h3 className="text-xl font-bold text-[#181311] dark:text-white mb-2">
          {title}
        </h3>

        {/* Mensaje */}
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {message}
        </p>

        {/* Botones */}
        <div className="flex gap-3 w-full">
          <button
            onClick={onAccept}
            className={`bg-primary text-white font-bold py-3 px-6 rounded-lg ${onCancel ? 'flex-1' : 'w-full'} hover:bg-primary/90 transition-colors`}
          >
            {acceptText}
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="bg-primary text-white font-bold py-3 px-6 rounded-lg flex-1 hover:bg-primary/90 transition-colors"
            >
              {cancelText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}