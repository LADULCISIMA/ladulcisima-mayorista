import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { format, addDays, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface SelectorMetodoPagoProps {
  categoria: 'emprendedor' | 'mayorista' | 'distribuidor';
  onSeleccionar: (config: PagoConfig) => void;
}

interface PagoConfig {
  metodo_pago: 'efectivo' | 'transferencia' | 'pasarela';
  plazo_dias: number | null;
  split_50: boolean;
}

export const SelectorMetodoPago: React.FC<SelectorMetodoPagoProps> = ({
  categoria,
  onSeleccionar,
}) => {
  const [metodo, setMetodo] = useState<'efectivo' | 'transferencia' | 'pasarela' | null>(null);
  const [plazo, setPlazo] = useState<number | null>(null);
  const [split, setSplit] = useState<boolean>(false);
  const [mostrarPlazo, setMostrarPlazo] = useState(false);
  const [mostrarSplit, setMostrarSplit] = useState(false);

  const metodos: ('efectivo' | 'transferencia' | 'pasarela')[] =
    categoria === 'distribuidor'
      ? ['efectivo', 'transferencia', 'pasarela']
      : ['efectivo', 'transferencia', 'pasarela'];

  const puedeUsoOtro = categoria === 'distribuidor' && metodo === 'transferencia';

  const handleMetodoChange = (nuevoMetodo: 'efectivo' | 'transferencia' | 'pasarela' | 'otro') => {
    if (nuevoMetodo === 'otro') {
      setMetodo('transferencia');
      setMostrarPlazo(true);
    } else {
      setMetodo(nuevoMetodo as any);
      setMostrarPlazo(false);
      setPlazo(null);
      setSplit(false);
    }
  };

  const handlePlazoSelect = (dias: number) => {
    setPlazo(dias);
    setMostrarSplit(true);
  };

  const handleConfirmar = () => {
    if (!metodo) {
      alert('Selecciona método de pago');
      return;
    }

    const config: PagoConfig = {
      metodo_pago: metodo,
      plazo_dias: plazo,
      split_50: split,
    };

    onSeleccionar(config);
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #f3d9e4' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#a63a63', marginBottom: '16px' }}>💳 Método de Pago</h3>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#8b7480', marginBottom: '12px' }}>
          ¿Cómo va a pagar?
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {metodos.map((m) => (
            <button
              key={m}
              onClick={() => handleMetodoChange(m)}
              style={{
                padding: '12px',
                borderRadius: '6px',
                border: metodo === m && !mostrarPlazo ? '2px solid #c94f7c' : '2px solid #e0e0e0',
                backgroundColor: metodo === m && !mostrarPlazo ? '#fdf2f6' : '#fff',
                fontWeight: metodo === m && !mostrarPlazo ? 'bold' : 'normal',
                cursor: 'pointer',
              }}
            >
              {m === 'efectivo' && '💵 Efectivo'}
              {m === 'transferencia' && '🏦 Transferencia'}
              {m === 'pasarela' && '💳 Tarjeta'}
            </button>
          ))}
        </div>

        {puedeUsoOtro && (
          <button
            onClick={() => handleMetodoChange('otro')}
            style={{
              marginTop: '8px',
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              border: mostrarPlazo ? '2px solid #c94f7c' : '2px solid #ffb366',
              backgroundColor: mostrarPlazo ? '#fdf2f6' : '#fff5f0',
              color: mostrarPlazo ? '#c94f7c' : '#ff9933',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            🕐 OTRO (Pago a Plazo)
          </button>
        )}
      </div>

      {mostrarPlazo && (
        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#fff5f0', borderRadius: '8px', borderLeft: '4px solid #ffb366' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#ff9933', marginBottom: '12px' }}>
            📅 ¿Cuántos días de plazo?
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[8, 15, 30].map((dias) => (
              <button
                key={dias}
                onClick={() => handlePlazoSelect(dias)}
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  border: plazo === dias ? '2px solid #ff9933' : '2px solid #ffccaa',
                  backgroundColor: plazo === dias ? '#fff' : '#fff',
                  fontWeight: 'bold',
                  color: plazo === dias ? '#ff9933' : '#999',
                  cursor: 'pointer',
                }}
              >
                {dias} días
              </button>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: '#ff9933', marginTop: '8px' }}>
            💡 Vencimiento: {plazo ? format(addDays(new Date(), plazo), 'd MMM', { locale: es }) : '-'}
          </p>
        </div>
      )}

      {mostrarSplit && plazo && (
        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f5f0ff', borderRadius: '8px', borderLeft: '4px solid #9966ff' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#7744cc', marginBottom: '12px' }}>
            💰 ¿Cómo prefiere pagar?
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', padding: '12px', borderRadius: '6px', border: '2px solid #e8ccff', cursor: 'pointer' }}>
              <input
                type="radio"
                checked={!split}
                onChange={() => setSplit(false)}
                style={{ marginRight: '12px' }}
              />
              <span style={{ fontWeight: '600', color: '#7744cc' }}>Completo en {plazo} días</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', padding: '12px', borderRadius: '6px', border: '2px solid #d199ff', backgroundColor: '#f5f0ff', cursor: 'pointer' }}>
              <input
                type="radio"
                checked={split}
                onChange={() => setSplit(true)}
                style={{ marginRight: '12px' }}
              />
              <div>
                <span style={{ fontWeight: '600', color: '#7744cc', display: 'block' }}>50% Ahora + 50% en {plazo} días</span>
                <span style={{ fontSize: '12px', color: '#9966ff' }}>Flexibilidad de pago</span>
              </div>
            </label>
          </div>
        </div>
      )}

      {metodo && (
        <div style={{ backgroundColor: '#fdf2f6', padding: '16px', borderRadius: '6px', border: '1px solid #f3d9e4', marginBottom: '16px' }}>
          <p style={{ fontSize: '14px', color: '#8b5e7f', margin: 0 }}>
            <strong>Resumen:</strong> {metodo.toUpperCase()}
            {plazo && ` · ${plazo} días`}
            {split && ' · Split 50%'}
          </p>
        </div>
      )}

      <button
        onClick={handleConfirmar}
        disabled={!metodo}
        style={{
          width: '100%',
          backgroundColor: metodo ? '#c94f7c' : '#ccc',
          color: 'white',
          fontWeight: 'bold',
          padding: '12px',
          borderRadius: '8px',
          border: 'none',
          cursor: metodo ? 'pointer' : 'not-allowed',
        }}
      >
        ✅ Confirmar Método de Pago
      </button>
    </div>
  );
};

export const DashboardAdmin: React.FC = () => {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    setCargando(true);
    try {
      const { data, error } = await supabase.rpc('obtener_pedidos_con_calculos');
      if (error) throw error;
      setPedidos(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return <div style={{ padding: '32px', textAlign: 'center' }}>⏳ Cargando pedidos...</div>;
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#faf6f8', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b5e7f', marginBottom: '24px' }}>📊 Panel de Pedidos</h1>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f3d9e4', borderBottom: '2px solid #c94f7c' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Pedido</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Cliente</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Total</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Saldo</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Vencimiento</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Estado Pago</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Estado Pedido</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => (
              <tr key={pedido.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                <td style={{ padding: '12px' }}>{pedido.numero}</td>
                <td style={{ padding: '12px' }}>{pedido.cliente_nombre}</td>
                <td style={{ padding: '12px' }}>${pedido.total.toLocaleString('es-CO')}</td>
                <td style={{ padding: '12px', fontWeight: 'bold', color: '#c94f7c' }}>${pedido.saldo_pendiente.toLocaleString('es-CO')}</td>
                <td style={{ padding: '12px' }}>
                  {pedido.fecha_limite_pago
                    ? format(new Date(pedido.fecha_limite_pago), 'd MMM', { locale: es })
                    : '-'}
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: pedido.estado_pago === 'completo' ? '#e8f5ef' : '#fff3e0',
                    color: pedido.estado_pago === 'completo' ? '#2e7d5b' : '#b8791d',
                  }}>
                    {pedido.estado_pago}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#f0f0f0',
                    color: '#666',
                  }}>
                    {pedido.estado_pedido}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SelectorMetodoPago;
