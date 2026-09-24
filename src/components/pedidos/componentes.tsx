// ============================================================================
//  COMPONENTES FRONTEND: 5 Componentes para los 14 Requirements
//  Tecnología: React + TypeScript + Supabase
// ============================================================================

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { format, addDays, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

// ============================================================================
//  1. SELECTOR MÉTODO DE PAGO (Cascada Dinámica)
// ============================================================================

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

  // Opciones disponibles según método de pago
  const metodos: ('efectivo' | 'transferencia' | 'pasarela')[] =
    categoria === 'distribuidor'
      ? ['efectivo', 'transferencia', 'pasarela']
      : ['efectivo', 'transferencia', 'pasarela'];

  // Si distribuidor + transferencia: mostrar opción OTRO (plazo)
  const puedeUsoOtro = categoria === 'distribuidor' && metodo === 'transferencia';

  const handleMetodoChange = (nuevoMetodo: 'efectivo' | 'transferencia' | 'pasarela' | 'otro') => {
    if (nuevoMetodo === 'otro') {
      setMetodo('transferencia'); // "OTRO" es una variante de transferencia
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
    <div className="selector-metodo-pago bg-white p-6 rounded-lg shadow-md border border-rose-200">
      <h3 className="text-lg font-bold text-rose-900 mb-4">💳 Método de Pago</h3>

      {/* Step 1: Seleccionar Método */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-rose-800 mb-3">
          ¿Cómo va a pagar?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {metodos.map((m) => (
            <button
              key={m}
              onClick={() => handleMetodoChange(m)}
              className={`p-3 rounded border-2 transition ${
                metodo === m && !mostrarPlazo
                  ? 'border-rose-500 bg-rose-50 font-bold'
                  : 'border-gray-300 hover:border-rose-300'
              }`}
            >
              {m === 'efectivo' && '💵 Efectivo'}
              {m === 'transferencia' && '🏦 Transferencia'}
              {m === 'pasarela' && '💳 Tarjeta'}
            </button>
          ))}
        </div>

        {/* "OTRO" (Plazo) - Solo distribuidor + transferencia */}
        {puedeUsoOtro && (
          <button
            onClick={() => handleMetodoChange('otro')}
            className={`mt-2 w-full p-3 rounded border-2 transition font-semibold ${
              mostrarPlazo
                ? 'border-rose-500 bg-rose-50'
                : 'border-orange-300 hover:border-orange-500 text-orange-700 bg-orange-50'
            }`}
          >
            🕐 OTRO (Pago a Plazo)
          </button>
        )}
      </div>

      {/* Step 2: Seleccionar Plazo (si es distribuidor + "OTRO") */}
      {mostrarPlazo && (
        <div className="mb-6 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
          <label className="block text-sm font-semibold text-orange-900 mb-3">
            📅 ¿Cuántos días de plazo?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[8, 15, 30].map((dias) => (
              <button
                key={dias}
                onClick={() => handlePlazoSelect(dias)}
                className={`p-3 rounded border-2 transition font-bold ${
                  plazo === dias
                    ? 'border-orange-500 bg-white text-orange-700'
                    : 'border-orange-200 hover:border-orange-400 text-gray-600'
                }`}
              >
                {dias} días
              </button>
            ))}
          </div>
          <p className="text-xs text-orange-700 mt-2">
            💡 Vencimiento: {plazo ? format(addDays(new Date(), plazo), 'd MMM', { locale: es }) : '-'}
          </p>
        </div>
      )}

      {/* Step 3: Split 50% (si tiene plazo) */}
      {mostrarSplit && plazo && (
        <div className="mb-6 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
          <label className="block text-sm font-semibold text-purple-900 mb-3">
            💰 ¿Cómo prefiere pagar?
          </label>
          <div className="space-y-2">
            <label className="flex items-center p-3 rounded border-2 border-purple-200 hover:bg-purple-100 cursor-pointer">
              <input
                type="radio"
                checked={!split}
                onChange={() => setSplit(false)}
                className="mr-3"
              />
              <span className="font-semibold text-purple-900">Completo en {plazo} días</span>
            </label>
            <label className="flex items-center p-3 rounded border-2 border-purple-300 bg-purple-50 hover:bg-purple-100 cursor-pointer">
              <input
                type="radio"
                checked={split}
                onChange={() => setSplit(true)}
                className="mr-3"
              />
              <div>
                <span className="font-semibold text-purple-900 block">50% Ahora + 50% en {plazo} días</span>
                <span className="text-xs text-purple-700">Flexibilidad de pago</span>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Resumen */}
      {metodo && (
        <div className="bg-rose-50 p-4 rounded-lg border border-rose-200 mb-4">
          <p className="text-sm text-rose-900">
            <strong>Resumen:</strong> {metodo.toUpperCase()}
            {plazo && ` · ${plazo} días`}
            {split && ' · Split 50%'}
          </p>
        </div>
      )}

      <button
        onClick={handleConfirmar}
        disabled={!metodo}
        className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-lg transition"
      >
        ✅ Confirmar Método de Pago
      </button>
    </div>
  );
};


// ============================================================================
//  2. MODAL PRÓRROGA (Solo Admin)
// ============================================================================

interface ModalProrrogaProps {
  pedidoId: string;
  pedidoNumero: string;
  fechaLimitePagoActual: Date;
  onClose: () => void;
  onGuardar: () => void;
}

export const ModalProrroga: React.FC<ModalProrrogaProps> = ({
  pedidoId,
  pedidoNumero,
  fechaLimitePagoActual,
  onClose,
  onGuardar,
}) => {
  const [nuevaFecha, setNuevaFecha] = useState<string>(
    format(addDays(fechaLimitePagoActual, 7), 'yyyy-MM-dd')
  );
  const [motivo, setMotivo] = useState('');
  const [cambiarLimiteRecompra, setCambiarLimiteRecompra] = useState(true);
  const [cargando, setCargando] = useState(false);

  const diasExtra = differenceInDays(new Date(nuevaFecha), fechaLimitePagoActual);

  const handleGuardar = async () => {
    if (!nuevaFecha || !motivo.trim()) {
      alert('Completa fecha y motivo');
      return;
    }

    setCargando(true);
    try {
      const { data, error } = await supabase.rpc('registrar_prorroga', {
        p_pedido_id: pedidoId,
        p_nueva_fecha: new Date(nuevaFecha).toISOString(),
        p_motivo: motivo,
        p_cambiar_limite_recompra: cambiarLimiteRecompra,
      });

      if (error) throw error;

      alert('✅ Prórroga registrada');
      onGuardar();
      onClose();
    } catch (error) {
      console.error(error);
      alert('❌ Error al registrar prórroga');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-2xl font-bold text-rose-900 mb-4">📅 Extender Vencimiento</h2>

        <p className="text-sm text-gray-600 mb-4">
          Pedido: <strong>{pedidoNumero}</strong>
        </p>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Vencimiento Actual
          </label>
          <input
            type="date"
            value={format(fechaLimitePagoActual, 'yyyy-MM-dd')}
            disabled
            className="w-full p-2 bg-gray-100 border rounded text-gray-600"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🗓️ Nueva Fecha de Vencimiento
          </label>
          <input
            type="date"
            value={nuevaFecha}
            onChange={(e) => setNuevaFecha(e.target.value)}
            min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
            className="w-full p-2 border border-rose-300 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <p className="text-xs text-orange-600 mt-1">
            ➕ {diasExtra} días extra
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📝 Motivo de la Prórroga
          </label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ej: Distribuidor pidió extra por incremento de compra"
            rows={3}
            className="w-full p-2 border border-rose-300 rounded focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
          />
        </div>

        <label className="flex items-center mb-6">
          <input
            type="checkbox"
            checked={cambiarLimiteRecompra}
            onChange={(e) => setCambiarLimiteRecompra(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">
            ✅ Cambiar también el límite de recompra
          </span>
        </label>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={cargando}
            className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-300 text-gray-800 font-bold py-2 rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={cargando}
            className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-300 text-white font-bold py-2 rounded-lg transition"
          >
            {cargando ? '⏳ Guardando...' : '💾 Guardar Prórroga'}
          </button>
        </div>
      </div>
    </div>
  );
};


// ============================================================================
//  3. MODAL AUDITORÍA (Timeline de Cambios)
// ============================================================================

interface RegistroAuditoria {
  id: string;
  tipo: string;
  estado_anterior: string | null;
  estado_nuevo: string;
  usuario_nombre: string;
  fecha: string;
  nota: string | null;
  dias_hace_text: string;
}

interface ModalAuditoriaProps {
  pedidoId: string;
  pedidoNumero: string;
  onClose: () => void;
}

export const ModalAuditoria: React.FC<ModalAuditoriaProps> = ({
  pedidoId,
  pedidoNumero,
  onClose,
}) => {
  const [registros, setRegistros] = useState<RegistroAuditoria[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarAuditoria = async () => {
      try {
        const { data, error } = await supabase.rpc('obtener_auditoria_pedido', {
          p_pedido_id: pedidoId,
        });
        if (error) throw error;
        setRegistros(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setCargando(false);
      }
    };

    cargarAuditoria();
  }, [pedidoId]);

  const getIconoTipo = (tipo: string) => {
    const iconos: Record<string, string> = {
      'estado_pedido': '📦',
      'estado_pago': '💰',
      'saldo_pendiente': '💳',
      'prorroga': '📅',
      'valor_pagado': '✅',
      'creacion': '🆕',
    };
    return iconos[tipo] || '📝';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-rose-900">📋 Auditoría Completa</h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">Pedido: <strong>{pedidoNumero}</strong></p>

        {cargando ? (
          <p className="text-center py-8 text-gray-600">⏳ Cargando auditoría...</p>
        ) : registros.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No hay registros de auditoría</p>
        ) : (
          <div className="space-y-4">
            {registros.map((reg, idx) => (
              <div
                key={reg.id}
                className="border-l-4 border-rose-300 pl-4 py-3 hover:bg-rose-50 rounded-r-lg transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getIconoTipo(reg.tipo)}</span>
                    <div>
                      <p className="font-bold text-gray-800">
                        {reg.estado_anterior} → {reg.estado_nuevo}
                      </p>
                      <p className="text-xs text-gray-500">
                        {reg.usuario_nombre} • {reg.dias_hace_text}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                    {format(new Date(reg.fecha), 'HH:mm:ss', { locale: es })}
                  </span>
                </div>
                {reg.nota && (
                  <p className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded mt-2">
                    💬 {reg.nota}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


// ============================================================================
//  4. COMPONENTE: Fila de Pedido (para Dashboard)
// ============================================================================

interface FilaPedidoProps {
  pedido: any;
  esAdmin: boolean;
  esAsesora: boolean;
  onMarcarEstado: (pedidoId: string, nuevoEstado: string) => void;
  onAbrirProrroga: (pedido: any) => void;
  onAbrirAuditoria: (pedido: any) => void;
}

export const FilaPedido: React.FC<FilaPedidoProps> = ({
  pedido,
  esAdmin,
  esAsesora,
  onMarcarEstado,
  onAbrirProrroga,
  onAbrirAuditoria,
}) => {
  const puedeMarcarEstado = esAdmin || esAsesora;
  const diasRestantes = pedido.dias_restantes
    ? `${pedido.dias_restantes} ${pedido.dias_restantes > 1 ? 'días' : 'día'}`
    : '-';

  const estadoPlazoColor =
    pedido.estado_plazo === 'vencido'
      ? 'bg-red-100 text-red-800'
      : pedido.estado_plazo === 'pagado a tiempo'
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800';

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="p-3 text-sm font-semibold">{pedido.numero}</td>
      <td className="p-3 text-sm">{pedido.cliente_nombre}</td>
      <td className="p-3 text-sm">${pedido.total.toLocaleString('es-CO')}</td>
      <td className="p-3 text-sm font-bold text-rose-700">${pedido.saldo_pendiente.toLocaleString('es-CO')}</td>

      {/* Vencimiento + Prórroga */}
      <td className="p-3 text-sm">
        {pedido.fecha_limite_pago ? (
          <div>
            <p className="text-xs font-semibold text-gray-700">
              {format(new Date(pedido.fecha_limite_pago), 'd MMM', { locale: es })}
            </p>
            {pedido.fecha_prorroga && (
              <p className="text-xs text-blue-600 font-bold">
                📅 Extendido a {format(new Date(pedido.fecha_prorroga), 'd MMM')}
              </p>
            )}
            <p className={`text-xs px-2 py-1 rounded mt-1 w-fit ${estadoPlazoColor}`}>
              {diasRestantes} restantes
            </p>
          </div>
        ) : (
          <span className="text-gray-400">Sin plazo</span>
        )}
      </td>

      <td className="p-3">
        <span className={`text-xs font-bold px-2 py-1 rounded ${
          pedido.estado_pago === 'completo'
            ? 'bg-green-100 text-green-800'
            : pedido.estado_pago === 'parcial'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {pedido.estado_pago}
        </span>
      </td>

      <td className="p-3">
        <span className={`text-xs font-bold px-2 py-1 rounded ${
          pedido.estado_pedido === 'entregado'
            ? 'bg-green-100 text-green-800'
            : pedido.estado_pedido === 'en_camino'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {pedido.estado_pedido}
        </span>
      </td>

      {/* Acciones */}
      <td className="p-3 space-x-1 flex flex-wrap">
        {puedeMarcarEstado && (
          <>
            <button
              onClick={() => onMarcarEstado(pedido.id, 'recibido')}
              title="Marcar como RECIBIDO"
              className="text-sm bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
            >
              📥
            </button>
            <button
              onClick={() => onMarcarEstado(pedido.id, 'preparacion')}
              title="Marcar como PREPARACIÓN"
              className="text-sm bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
            >
              ⚙️
            </button>
            <button
              onClick={() => onMarcarEstado(pedido.id, 'en_camino')}
              title="Marcar como EN CAMINO"
              className="text-sm bg-blue-200 hover:bg-blue-300 px-2 py-1 rounded"
            >
              🚚
            </button>
            <button
              onClick={() => onMarcarEstado(pedido.id, 'entregado')}
              title="Marcar como ENTREGADO"
              className="text-sm bg-green-200 hover:bg-green-300 px-2 py-1 rounded"
            >
              ✅
            </button>
          </>
        )}

        {esAdmin && pedido.saldo_pendiente > 0 && (
          <button
            onClick={() => onAbrirProrroga(pedido)}
            title="Otorgar prórroga"
            className="text-sm bg-orange-200 hover:bg-orange-300 px-2 py-1 rounded"
          >
            📅
          </button>
        )}

        <button
          onClick={() => onAbrirAuditoria(pedido)}
          title="Ver auditoría"
          className="text-sm bg-purple-200 hover:bg-purple-300 px-2 py-1 rounded"
        >
          📋
        </button>
      </td>
    </tr>
  );
};


// ============================================================================
//  5. DASHBOARD ADMIN (Panel Principal)
// ============================================================================

export const DashboardAdmin: React.FC = () => {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalProrroga, setModalProrroga] = useState<any>(null);
  const [modalAuditoria, setModalAuditoria] = useState<any>(null);
  const [esAdmin, setEsAdmin] = useState(false);
  const [esAsesora, setEsAsesora] = useState(false);

  useEffect(() => {
    cargarPedidos();
    verificarRol();
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

  const verificarRol = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('rol')
        .eq('id', user.id)
        .single();

      setEsAdmin(perfil?.rol === 'admin');
      setEsAsesora(perfil?.rol === 'asesora');
    }
  };

  const handleMarcarEstado = async (pedidoId: string, nuevoEstado: string) => {
    try {
      const { error } = await supabase.rpc('marcar_estado_pedido', {
        p_pedido_id: pedidoId,
        p_nuevo_estado: nuevoEstado,
      });

      if (error) throw error;
      alert('✅ Estado actualizado');
      cargarPedidos();
    } catch (error) {
      console.error(error);
      alert('❌ Error al actualizar estado');
    }
  };

  if (cargando) {
    return <div className="p-8 text-center">⏳ Cargando pedidos...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-rose-900 mb-6">📊 Panel de Pedidos</h1>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-rose-100 border-b-2 border-rose-300">
            <tr>
              <th className="p-3 text-left font-bold">Pedido</th>
              <th className="p-3 text-left font-bold">Cliente</th>
              <th className="p-3 text-left font-bold">Total</th>
              <th className="p-3 text-left font-bold">Saldo</th>
              <th className="p-3 text-left font-bold">Vencimiento</th>
              <th className="p-3 text-left font-bold">Estado Pago</th>
              <th className="p-3 text-left font-bold">Estado Pedido</th>
              <th className="p-3 text-left font-bold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => (
              <FilaPedido
                key={pedido.id}
                pedido={pedido}
                esAdmin={esAdmin}
                esAsesora={esAsesora}
                onMarcarEstado={handleMarcarEstado}
                onAbrirProrroga={setModalProrroga}
                onAbrirAuditoria={setModalAuditoria}
              />
            ))}
          </tbody>
        </table>
      </div>

      {modalProrroga && (
        <ModalProrroga
          pedidoId={modalProrroga.id}
          pedidoNumero={modalProrroga.numero}
          fechaLimitePagoActual={new Date(modalProrroga.fecha_prorroga || modalProrroga.fecha_limite_pago)}
          onClose={() => setModalProrroga(null)}
          onGuardar={cargarPedidos}
        />
      )}

      {modalAuditoria && (
        <ModalAuditoria
          pedidoId={modalAuditoria.id}
          pedidoNumero={modalAuditoria.numero}
          onClose={() => setModalAuditoria(null)}
        />
      )}
    </div>
  );
};

export default DashboardAdmin;
