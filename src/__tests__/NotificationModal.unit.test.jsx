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
    // Con el mock de i18n, se renderizan las keys directamente
    expect(screen.getByText('notification.defaultTitle')).toBeInTheDocument();
    expect(screen.getByText('notification.defaultMessage')).toBeInTheDocument();
  });

  it('renderiza solo botón aceptar si no hay onCancel', () => {
    const onAccept = jest.fn();
    render(<NotificationModal isOpen onAccept={onAccept} />);
    // Con el mock de i18n, el texto del botón es la key
    const acceptBtn = screen.getByRole('button', { name: 'notification.accept' });
    expect(acceptBtn).toBeInTheDocument();
    fireEvent.click(acceptBtn);
    expect(onAccept).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'notification.cancel' })).toBeNull();
  });

  it('renderiza ambos botones si hay onCancel y responde a clicks', () => {
    const onAccept = jest.fn();
    const onCancel = jest.fn();
    render(
      <NotificationModal isOpen onAccept={onAccept} onCancel={onCancel} />
    );
    // Con el mock de i18n, los textos de botones son las keys
    const acceptBtn = screen.getByRole('button', { name: 'notification.accept' });
    const cancelBtn = screen.getByRole('button', { name: 'notification.cancel' });
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
