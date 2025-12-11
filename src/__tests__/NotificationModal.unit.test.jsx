import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NotificationModal from '../components/NotificationModal';
import '../i18n';

describe('NotificationModal', () => {
  it('no renderiza si isOpen es false', () => {
    const { container } = render(<NotificationModal isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renderiza con tipo success', () => {
    render(<NotificationModal isOpen type="success" title="Éxito" message="Operación exitosa" />);
    expect(screen.getByText('Éxito')).toBeInTheDocument();
    expect(screen.getByText('Operación exitosa')).toBeInTheDocument();
    expect(screen.getByText('check_circle')).toBeInTheDocument();
  });

  it('renderiza con tipo warning', () => {
    render(<NotificationModal isOpen type="warning" title="Advertencia" message="Cuidado" />);
    expect(screen.getByText('Advertencia')).toBeInTheDocument();
    expect(screen.getByText('Cuidado')).toBeInTheDocument();
    expect(screen.getByText('warning')).toBeInTheDocument();
  });

  it('renderiza con tipo info (por defecto)', () => {
    render(<NotificationModal isOpen title="Info" message="Mensaje informativo" />);
    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByText('Mensaje informativo')).toBeInTheDocument();
    expect(screen.getByText('info')).toBeInTheDocument();
  });

  it('muestra título y mensaje por defecto si no se pasan', () => {
    render(<NotificationModal isOpen />);
    // Ambos elementos contienen "Notificación" (título y mensaje)
    const notificacionElements = screen.getAllByText(/notificación/i);
    expect(notificacionElements.length).toBeGreaterThanOrEqual(1);
    // El mensaje por defecto también debe estar
    expect(screen.getByText(/tienes una nueva notificación\./i)).toBeInTheDocument();
  });

  it('renderiza solo botón aceptar si no hay onCancel', () => {
    const onAccept = jest.fn();
    render(<NotificationModal isOpen onAccept={onAccept} />);
    const acceptBtn = screen.getByRole('button', { name: /aceptar/i });
    expect(acceptBtn).toBeInTheDocument();
    fireEvent.click(acceptBtn);
    expect(onAccept).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: /cancelar/i })).toBeNull();
  });

  it('renderiza ambos botones si hay onCancel y responde a clicks', () => {
    const onAccept = jest.fn();
    const onCancel = jest.fn();
    render(
      <NotificationModal isOpen onAccept={onAccept} onCancel={onCancel} />
    );
    const acceptBtn = screen.getByRole('button', { name: /aceptar/i });
    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    expect(acceptBtn).toBeInTheDocument();
    expect(cancelBtn).toBeInTheDocument();
    fireEvent.click(acceptBtn);
    fireEvent.click(cancelBtn);
    expect(onAccept).toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalled();
  });

  it('muestra textos personalizados en los botones', () => {
    render(
      <NotificationModal isOpen acceptText="Sí" cancelText="No" onCancel={() => {}} />
    );
    expect(screen.getByRole('button', { name: /sí/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /no/i })).toBeInTheDocument();
  });
});
