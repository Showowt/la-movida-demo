"use client";
import React, { useState, useEffect } from 'react';

interface Message {
  type: 'user' | 'ai';
  text: string;
  time: string;
  tag?: string;
}

interface CRMEntry {
  name: string;
  phone: string;
  status: string;
  event: string;
  value: string;
  tag: string;
  lastContact: string;
}

interface ReportData {
  period: string;
  conversations: number;
  bookings: number;
  revenue: string;
  conversionRate: string;
  avgResponseTime: string;
  reactivatedClients: number;
  pendingFollowUps: number;
  topEvent: string;
  insights: string[];
}

const LaMovidaDemo = () => {
  const [activeTab, setActiveTab] = useState<'inbound' | 'reactivation' | 'pendingQuote' | 'report'>('inbound');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [crmData, setCrmData] = useState<CRMEntry[]>([]);
  const [showCRM, setShowCRM] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const scenarios: Record<string, Message[]> = {
    inbound: [
      { type: 'user', text: 'Hola! Quiero info sobre eventos este fin de semana', time: '9:15 PM' },
      { type: 'ai', text: '¡Hola! 🎉 Bienvenido a Grupo La Movida.\n\nEste fin de semana tenemos:\n\n🔥 Viernes - DJ Vini en La Terraza\n🎵 Sábado - Noche de Afro House en El Rooftop\n🌴 Domingo - Pool Party en La Casa\n\n¿Cuál te interesa? Te puedo dar todos los detalles y reservar tu mesa.', time: '9:15 PM', tag: 'AUTO-RESPONSE' },
      { type: 'user', text: 'El de sábado suena bien. Somos 6 personas', time: '9:16 PM' },
      { type: 'ai', text: 'Perfecto, 6 personas para el sábado 🎵\n\nPara Afro House Night tenemos:\n\n💎 Mesa VIP (hasta 8 personas) - $800.000 COP\nIncluye: Botella de vodka premium + mixers + ubicación preferencial\n\n✨ Mesa Premium (hasta 6 personas) - $500.000 COP\nIncluye: Botella house + mixers\n\n¿Cuál prefieres? Te aseguro la mesa ahora mismo.', time: '9:16 PM', tag: 'QUALIFIER' },
      { type: 'user', text: 'La premium está bien', time: '9:17 PM' },
      { type: 'ai', text: '¡Excelente elección! 🙌\n\nPara confirmar tu Mesa Premium:\n\n📋 Necesito:\n• Nombre completo para la reserva\n• Número de contacto\n• ¿Alguna ocasión especial? (cumpleaños, etc.)\n\nEl anticipo es de $200.000 COP vía Nequi o Daviplata para garantizar tu mesa.', time: '9:17 PM', tag: 'BOOKING FLOW' },
      { type: 'user', text: 'Carlos Mendoza, 315-555-1234, es cumpleaños de mi hermano', time: '9:18 PM' },
      { type: 'ai', text: '¡Perfecto Carlos! 🎂 Cumpleaños registrado.\n\nTu reserva:\n━━━━━━━━━━━━━━━━\n📅 Sábado - Afro House Night\n👥 6 personas - Mesa Premium\n🎉 CUMPLEAÑOS (sorpresa incluida)\n💰 Total: $500.000 COP\n💳 Anticipo: $200.000 COP\n━━━━━━━━━━━━━━━━\n\nNequi/Daviplata: 300-555-0000\n\nCuando envíes el anticipo, mándame el comprobante y te confirmo tu mesa. 🔥', time: '9:18 PM', tag: 'CONFIRMATION + CRM UPDATE' },
    ],
    reactivation: [
      { type: 'ai', text: '¡Hola María! 👋\n\nSoy del equipo de La Movida. Hace un mes viniste a nuestra noche de reggaeton y nos dejaste 5 estrellas ⭐\n\nEste viernes tenemos algo especial que creo te va a encantar: Noche Latina con DJ invitado de Miami.\n\n¿Te guardo una mesa? Para clientes frecuentes tenemos 15% de descuento 😉', time: '2:30 PM', tag: 'RE-ENGAGEMENT' },
      { type: 'user', text: 'Hola! Si me acuerdo, la pasamos increíble. Cuánto sale?', time: '3:45 PM' },
      { type: 'ai', text: '¡Qué bueno que la pasaron bien! 🎉\n\nCon tu descuento de cliente frecuente:\n\n✨ Mesa para 4: $340.000 COP (antes $400.000)\n💎 Mesa VIP para 6: $680.000 COP (antes $800.000)\n\nY como viniste antes, te incluyo una ronda de shots de cortesía 🥃\n\n¿Para cuántas personas sería esta vez?', time: '3:45 PM', tag: 'LOYALTY PRICING' },
      { type: 'user', text: 'Somos 4, la primera opción', time: '3:47 PM' },
      { type: 'ai', text: '¡Listo María! 🙌\n\nTe tengo tu mesa para 4 el viernes.\n\nComo ya te conocemos, solo necesito:\n• ¿Mismo número de contacto? (312-555-5678)\n• Anticipo de $150.000 COP\n\nTe mando el link de pago directo 👇', time: '3:47 PM', tag: 'FAST CHECKOUT' },
    ],
    pendingQuote: [
      { type: 'ai', text: 'Hola Juan Pablo 👋\n\nVi que el martes preguntaste por una mesa para el evento de este sábado pero no alcanzamos a cerrar.\n\n¿Todavía te interesa? Quedan solo 3 mesas disponibles para la noche.\n\nSi confirmas hoy, te mantengo el precio que te di: $450.000 por mesa de 6.', time: '10:00 AM', tag: 'QUOTE RECOVERY' },
      { type: 'user', text: 'Si todavía me interesa, es que estaba esperando confirmar con mis amigos', time: '11:30 AM' },
      { type: 'ai', text: '¡Perfecto! Entiendo totalmente 👍\n\nMira, te puedo guardar la mesa hasta las 6pm de hoy sin anticipo para que confirmes con tu grupo.\n\nDespués de las 6pm se libera porque tenemos lista de espera.\n\n¿Te parece? Te escribo a las 5pm para recordarte.', time: '11:30 AM', tag: 'SOFT HOLD' },
      { type: 'user', text: 'Dale perfecto, gracias!', time: '11:32 AM' },
      { type: 'ai', text: '¡Hecho! ✅\n\nTu mesa está apartada hasta las 6pm.\n\nTe escribo a las 5pm. Si antes de eso ya tienes respuesta de tu grupo, me avisas y cerramos.\n\n¡Que tengas buen día! 🙌', time: '11:32 AM', tag: 'FOLLOW-UP SCHEDULED' },
    ]
  };

  const crmEntries: CRMEntry[] = [
    { name: 'Carlos Mendoza', phone: '315-555-1234', status: 'RESERVA CONFIRMADA', event: 'Afro House Night', value: '$500.000', tag: 'CUMPLEAÑOS', lastContact: 'Hace 2 min' },
    { name: 'María González', phone: '312-555-5678', status: 'CLIENTE FRECUENTE', event: 'Noche Latina', value: '$340.000', tag: 'DESCUENTO 15%', lastContact: 'Hace 1 hora' },
    { name: 'Juan Pablo Ruiz', phone: '318-555-9012', status: 'COTIZACIÓN PENDIENTE', event: 'Sábado Night', value: '$450.000', tag: 'FOLLOW-UP 5PM', lastContact: 'Hace 3 horas' },
  ];

  const weeklyReport: ReportData = {
    period: 'Semana del 27 Ene - 2 Feb 2026',
    conversations: 847,
    bookings: 62,
    revenue: '$31.200.000 COP',
    conversionRate: '7.3%',
    avgResponseTime: '< 30 segundos',
    reactivatedClients: 23,
    pendingFollowUps: 8,
    topEvent: 'Afro House Night (28 reservas)',
    insights: [
      'Mesas VIP convierten 2.3x más que Premium',
      'Cumpleaños tienen ticket promedio 40% mayor',
      'Reactivación por WhatsApp: 34% tasa de respuesta',
      'Pico de consultas: Jueves 8-10pm'
    ]
  };

  useEffect(() => {
    if (activeTab !== 'report') {
      setChatMessages([]);
      setShowCRM(false);
    }
  }, [activeTab]);

  const playScenario = () => {
    const messages = scenarios[activeTab];
    if (!messages) return;
    
    setChatMessages([]);
    setShowCRM(false);
    
    messages.forEach((msg, index) => {
      setTimeout(() => {
        if (msg.type === 'ai') {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            setChatMessages(prev => [...prev, msg]);
            if (index === messages.length - 1) {
              setTimeout(() => setShowCRM(true), 500);
              setCrmData(crmEntries);
            }
          }, 1200);
        } else {
          setChatMessages(prev => [...prev, msg]);
        }
      }, index * 2500);
    });
  };

  const showReportData = () => {
    setReportData(weeklyReport);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a0a1a] to-[#0a1a1a] text-white p-5 font-sans">
      <style jsx global>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .message { animation: slideIn 0.3s ease; }
        .crm-row { animation: fadeIn 0.5s ease; }
        .typing-dot { animation: bounce 1.4s infinite ease-in-out; }
        .typing-dot:nth-child(1) { animation-delay: 0s; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-[#00ff88] to-[#00cc6a] rounded-xl flex items-center justify-center text-2xl font-extrabold text-black">M</div>
          <span className="text-sm text-white/50 tracking-widest">MACHINEMIND × GRUPO LA MOVIDA</span>
        </div>
        <h1 className="text-5xl font-extrabold my-4 bg-gradient-to-r from-white to-[#00ff88] bg-clip-text text-transparent">
          Demo: WhatsApp AI
        </h1>
        <p className="text-white/60 text-lg max-w-xl mx-auto">
          Ventas, reactivación de clientes, y reportes automáticos — 24/7
        </p>
      </div>

      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {[
          { id: 'inbound', label: '📥 Consulta Nueva' },
          { id: 'reactivation', label: '🔄 Reactivación' },
          { id: 'pendingQuote', label: '💬 Cotización Pendiente' },
          { id: 'report', label: '📊 Reporte Semanal' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-[#00ff88] to-[#00cc6a] text-black font-semibold'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab !== 'report' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          <div className="bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
            <div className="bg-[#075e54] px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center text-xl font-bold">M</div>
              <div>
                <div className="font-semibold">Grupo La Movida</div>
                <div className="text-xs text-white/70">{isTyping ? 'escribiendo...' : 'en línea'}</div>
              </div>
              <div className="ml-auto flex gap-4 text-white/80">📹 📞 ⋮</div>
            </div>

            <div className="h-[500px] overflow-y-auto p-5 bg-[#0b141a]">
              {chatMessages.length === 0 && !isTyping && (
                <div className="text-center text-white/40 mt-44">
                  <div className="text-5xl mb-4">💬</div>
                  <div>Presiona &quot;Iniciar Demo&quot; para ver la conversación</div>
                </div>
              )}

              {chatMessages.map((msg, i) => (
                <div key={i} className={`message flex mb-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-3 relative ${
                    msg.type === 'user' 
                      ? 'bg-[#005c4b] rounded-xl rounded-br-sm' 
                      : 'bg-[#1f2c34] rounded-xl rounded-bl-sm'
                  }`}>
                    {msg.tag && (
                      <div className={`absolute -top-2 ${msg.type === 'user' ? 'left-3' : 'right-3'} bg-[#00ff88] text-black text-[9px] font-bold px-2 py-0.5 rounded tracking-wide`}>
                        {msg.tag}
                      </div>
                    )}
                    <div className="whitespace-pre-line text-sm leading-relaxed">{msg.text}</div>
                    <div className="text-[11px] text-white/50 text-right mt-1">
                      {msg.time} {msg.type === 'ai' && '✓✓'}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="message flex justify-start">
                  <div className="bg-[#1f2c34] px-5 py-4 rounded-xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <span className="typing-dot w-2 h-2 bg-[#00ff88] rounded-full"></span>
                      <span className="typing-dot w-2 h-2 bg-[#00ff88] rounded-full"></span>
                      <span className="typing-dot w-2 h-2 bg-[#00ff88] rounded-full"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10">
              <button 
                onClick={playScenario}
                className="w-full py-4 bg-gradient-to-r from-[#00ff88] to-[#00cc6a] rounded-xl text-black font-semibold text-lg hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] transition-all flex items-center justify-center gap-2"
              >
                ▶️ Iniciar Demo
              </button>
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00ff88]/20 to-[#00ff88]/10 rounded-xl flex items-center justify-center text-xl">📊</div>
              <div>
                <div className="font-semibold text-lg">CRM Auto-Update</div>
                <div className="text-sm text-white/50">Se actualiza en tiempo real con cada conversación</div>
              </div>
            </div>

            {!showCRM ? (
              <div className="text-center text-white/40 py-28">
                <div className="text-5xl mb-4">🗄️</div>
                <div>El CRM se actualiza automáticamente</div>
                <div className="text-sm mt-2">cuando se completa una conversación</div>
              </div>
            ) : (
              <div className="space-y-3">
                {crmData.map((entry, i) => (
                  <div key={i} className="crm-row bg-white/[0.03] border border-white/10 rounded-xl p-4" style={{ animationDelay: `${i * 0.2}s` }}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold">{entry.name}</div>
                        <div className="text-sm text-white/50">{entry.phone}</div>
                      </div>
                      <div className={`px-3 py-1 rounded-md text-xs font-semibold ${
                        entry.status === 'RESERVA CONFIRMADA' ? 'bg-[#00ff88]/20 text-[#00ff88]' :
                        entry.status === 'CLIENTE FRECUENTE' ? 'bg-[#00c8ff]/20 text-[#00c8ff]' :
                        'bg-[#ffc800]/20 text-[#ffc800]'
                      }`}>
                        {entry.status}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-white/60"><span className="text-white/40">Evento:</span> {entry.event}</div>
                      <div className="text-white/60"><span className="text-white/40">Valor:</span> {entry.value}</div>
                      <div><span className="bg-white/10 px-2 py-0.5 rounded text-xs">{entry.tag}</span></div>
                      <div className="text-white/40 text-xs">{entry.lastContact}</div>
                    </div>
                  </div>
                ))}
                
                <div className="mt-4 p-4 bg-[#00ff88]/5 border border-[#00ff88]/20 rounded-xl text-center">
                  <div className="text-[#00ff88] font-semibold mb-1">✓ Sin intervención manual</div>
                  <div className="text-sm text-white/60">Datos extraídos y guardados automáticamente de la conversación</div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-2xl max-w-4xl mx-auto p-8">
          {!reportData ? (
            <div className="text-center py-16">
              <div className="text-7xl mb-6">📊</div>
              <h2 className="text-2xl font-bold mb-4">Reporte Semanal Automático</h2>
              <p className="text-white/60 mb-8">Generado cada lunes a las 8:00 AM y enviado por WhatsApp/Email</p>
              <button 
                onClick={showReportData}
                className="px-8 py-4 bg-gradient-to-r from-[#00ff88] to-[#00cc6a] rounded-xl text-black font-semibold text-lg hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] transition-all inline-flex items-center gap-2"
              >
                📈 Ver Ejemplo de Reporte
              </button>
            </div>
          ) : (
            <div>
              <div className="text-center mb-8">
                <div className="text-sm text-[#00ff88] mb-2">REPORTE AUTOMÁTICO</div>
                <h2 className="text-3xl font-bold mb-2">{reportData.period}</h2>
                <p className="text-white/50">Generado por MachineMind AI</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Conversaciones', value: reportData.conversations, icon: '💬' },
                  { label: 'Reservas', value: reportData.bookings, icon: '✅' },
                  { label: 'Ingresos', value: reportData.revenue, icon: '💰' },
                  { label: 'Conversión', value: reportData.conversionRate, icon: '📈' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-center hover:border-[#00ff88]/30 hover:bg-[#00ff88]/5 transition-all">
                    <div className="text-4xl mb-2">{stat.icon}</div>
                    <div className="text-2xl font-bold text-[#00ff88]">{stat.value}</div>
                    <div className="text-sm text-white/50">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4 text-white/80">📊 Métricas Clave</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Tiempo de respuesta promedio', value: reportData.avgResponseTime },
                      { label: 'Clientes reactivados', value: reportData.reactivatedClients },
                      { label: 'Follow-ups pendientes', value: reportData.pendingFollowUps },
                      { label: 'Evento más vendido', value: reportData.topEvent },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between p-3 bg-white/[0.03] rounded-lg">
                        <span className="text-white/60">{item.label}</span>
                        <span className="font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4 text-white/80">💡 Insights de la Semana</h3>
                  <div className="space-y-3">
                    {reportData.insights.map((insight, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-[#00ff88]/5 border border-[#00ff88]/10 rounded-lg">
                        <span className="text-[#00ff88]">→</span>
                        <span className="text-sm">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 p-5 bg-gradient-to-r from-[#00ff88]/10 to-[#00c8ff]/5 border border-[#00ff88]/20 rounded-2xl text-center">
                <div className="font-semibold mb-2">🤖 Este reporte se genera automáticamente cada semana</div>
                <div className="text-sm text-white/60">Sin trabajo manual. Sin hojas de Excel. Sin olvidar enviarlo.</div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="text-center mt-12 p-8 bg-white/[0.02] rounded-2xl max-w-xl mx-auto">
        <h3 className="text-2xl font-bold mb-3">¿Listos para implementar?</h3>
        <p className="text-white/60 mb-6">Setup en 7-10 días. Sin contratar. Sin entrenar. Sin esperar.</p>
        <div className="inline-block bg-gradient-to-r from-[#00ff88] to-[#00cc6a] px-8 py-4 rounded-xl font-semibold text-black">
          WhatsApp: +57 XXX-XXX-XXXX
        </div>
      </div>
    </div>
  );
};

export default LaMovidaDemo;
