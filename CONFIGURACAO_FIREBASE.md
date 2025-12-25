# CobraPro - Sistema de Gestão de Cobranças

## 🚀 Funcionalidades Implementadas

### Identidade Visual "Confiança e Lucro"
- **Paleta Verde Esmeralda + Verde Neon**: Transmite solidez financeira e modernidade
- **Laranja Queimado para atrasos**: Atenção sem gerar desespero (vs. vermelho)
- **Tipografia**: Montserrat (títulos) + Inter (corpo de texto)
- **Micro-interações**: Confete verde ao marcar pagamentos como recebidos

### Sacadas Geniais de UX

#### 1. ⚡ Botão de Pânico do PIX
- Botão flutuante no canto inferior direito
- Gera QR Code PIX em 2 segundos
- Sem formulários longos - apenas o valor
- **Caso de uso**: Pedreiro com mãos sujas precisa cobrar rapidamente

#### 2. 🎤 Modo "Mãos Sujas" (Interface por Voz)
- Comando de voz: *"Cobrar 50 reais do João"*
- Cria cobrança automaticamente a partir da fala
- Ideal para quem está trabalhando (mecânicos, cozinheiros, etc.)
- **Web Speech API**: funciona em Chrome/Edge

#### 3. 🔐 Login com Google (One-Tap)
- Autenticação via Firebase
- Sem decorar senhas
- Email + nome já capturados para faturamento

## 🔧 Configuração do Firebase

### Passo 1: Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Nome do projeto: `CobraPro` (ou escolha outro)
4. Desabilite o Google Analytics (opcional para MVP)
5. Clique em "Criar projeto"

### Passo 2: Configurar Autenticação

1. No menu lateral, clique em **Authentication**
2. Clique em "Começar"
3. Na aba "Sign-in method", ative o **Google**:
   - Clique em "Google"
   - Ative o provedor
   - Adicione um email de suporte
   - Salve

### Passo 3: Criar App Web

1. No menu lateral, clique no ícone de **engrenagem** → "Configurações do projeto"
2. Na seção "Seus apps", clique no ícone **</>** (Web)
3. Registre o app com o apelido "CobraPro Web"
4. **NÃO** marque Firebase Hosting (não é necessário)
5. Clique em "Registrar app"

### Passo 4: Copiar Credenciais

Você verá um objeto JavaScript assim:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "cobrapro-xxxxx.firebaseapp.com",
  projectId: "cobrapro-xxxxx",
  storageBucket: "cobrapro-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### Passo 5: Adicionar Credenciais ao Projeto

Abra o arquivo `/src/lib/firebase.ts` e substitua os valores:

```typescript
const firebaseConfig = {
  apiKey: "COLE_SUA_API_KEY_AQUI",
  authDomain: "cobrapro-xxxxx.firebaseapp.com",
  projectId: "cobrapro-xxxxx",
  storageBucket: "cobrapro-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### Passo 6: Configurar Firestore (Opcional - Backend)

1. No menu lateral, clique em **Firestore Database**
2. Clique em "Criar banco de dados"
3. Escolha o modo **Produção** (vamos criar regras depois)
4. Selecione a localização mais próxima (ex: `southamerica-east1`)
5. Clique em "Ativar"

#### Regras de Segurança do Firestore

Vá em **Firestore Database** → **Regras** e cole:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários autenticados podem ler/escrever seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Clientes e cobranças do usuário
    match /users/{userId}/clientes/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /users/{userId}/cobrancas/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🎯 Como Usar

### Login
1. Abra o app
2. Clique em "Entrar com Google"
3. Selecione sua conta Google

### Criar Cobrança Rápida (Botão de Pânico)
1. Clique no botão **⚡** flutuante no canto inferior direito
2. Digite o valor (ex: 150)
3. Clique em "Gerar QR Code Agora"
4. Compartilhe o QR Code ou copie a chave PIX

### Criar Cobrança por Voz
1. Clique no botão **🎤 Voz** no header
2. Diga: *"Cobrar 100 reais do João"*
3. O sistema cria a cobrança automaticamente

### Gestão Normal
- **Dashboard**: Visualize métricas de inadimplência
- **Cobranças**: Liste e gerencie cobranças existentes
- **Clientes**: Cadastre novos clientes
- **Nova Cobrança**: Formulário completo com PIX

## 💡 Próximos Passos (Backend Real)

### Integração com APIs de Pagamento

#### 1. Mercado Pago PIX
```typescript
// Instalar SDK
npm install mercadopago

// Configurar
import mercadopago from 'mercadopago';

mercadopago.configure({
  access_token: 'SEU_ACCESS_TOKEN'
});

// Gerar cobrança PIX
const payment = await mercadopago.payment.create({
  transaction_amount: 100.00,
  description: 'Cobrança CobraPro',
  payment_method_id: 'pix',
  payer: { email: 'cliente@email.com' }
});

// QR Code: payment.point_of_interaction.transaction_data.qr_code
```

#### 2. PagSeguro PIX
```typescript
// API de Cobrança PIX PagSeguro
const response = await fetch('https://api.pagseguro.com/instant-payments/cob', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer SEU_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    calendario: { expiracao: 3600 },
    valor: { original: '100.00' },
    chave: 'sua-chave-pix@email.com'
  })
});

const { pixCopiaECola, qrcode } = await response.json();
```

### Integração com WhatsApp

#### WhatsApp Business API
```typescript
// Enviar mensagem via Twilio WhatsApp API
await fetch('https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json', {
  method: 'POST',
  headers: {
    'Authorization': 'Basic ' + btoa('YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN'),
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({
    From: 'whatsapp:+14155238886', // Número Twilio
    To: 'whatsapp:+5511987654321',  // Cliente
    Body: `Olá João! Sua cobrança de R$ 100,00 vence em 2 dias. PIX: ${pixKey}`
  })
});
```

## 🎨 Identidade Visual

### Cores
- **Verde Esmeralda**: `#004D40` (Primária - solidez)
- **Verde Neon**: `#00E676` (CTA - ação/lucro)
- **Laranja Queimado**: `#FF6F00` (Atrasos - atenção)
- **Cinza Grafite**: `#263238` (Texto secundário)
- **Branco Gelo**: `#F5F7F8` (Fundo)

### Fontes
- **Montserrat**: Títulos (transmite autoridade)
- **Inter**: Corpo de texto (legibilidade em interfaces)

## 📊 Proposta de Valor

- **Preço**: R$ 29,90/mês
- **ROI**: Economiza 2h/semana (R$ 80-200/mês em tempo)
- **Redução de inadimplência**: 10%
- **Público**: Microempreendedores (pedreiros, manicures, freelancers)

## 🔒 Segurança

### Importante
⚠️ **Nunca commite credenciais reais do Firebase no Git!**

Para ambientes de produção, use variáveis de ambiente:

```bash
# .env.local
VITE_FIREBASE_API_KEY=sua-api-key-aqui
VITE_FIREBASE_AUTH_DOMAIN=seu-domain.firebaseapp.com
# ...
```

```typescript
// firebase.ts
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ...
};
```

## 📱 Suporte a Navegadores

- **Chrome/Edge**: ✅ Todas funcionalidades (incluindo voz)
- **Firefox**: ✅ Exceto comando de voz
- **Safari**: ⚠️ Comando de voz limitado
- **Mobile**: ✅ Responsivo completo

## 📞 Suporte

Para dúvidas sobre implementação ou integração com APIs de pagamento, consulte:

- [Firebase Docs](https://firebase.google.com/docs)
- [Mercado Pago PIX API](https://www.mercadopago.com.br/developers/pt/guides/online-payments/checkout-api/receiving-payment-by-pix)
- [PagSeguro PIX](https://dev.pagseguro.uol.com.br/reference/pix-criar-cobranca)
- [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp/api)

---

**CobraPro** - Gestão de cobranças para quem tem pouco tempo e muito dinheiro a receber! 💰
