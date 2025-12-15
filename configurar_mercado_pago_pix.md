# Configuração Mercado Pago PIX

## 1. Criar Conta Mercado Pago

1. Acesse: https://www.mercadopago.com.br/
2. Crie conta empresarial
3. Complete verificação de documentos

## 2. Obter Credenciais

1. Dashboard → Desenvolvedores → Suas integrações
2. Copie:
   - **Public Key** (publishable)
   - **Access Token** (secret)

## 3. Instalar SDK

```bash
npm install mercadopago
```

## 4. Configurar .env

```env
MERCADOPAGO_PUBLIC_KEY=pk_test_...
MERCADOPAGO_ACCESS_TOKEN=TEST-...
```

## 5. Implementar PIX Real

### A. Criar MercadoPagoService.ts
```typescript
import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export class MercadoPagoService {
  static async createPixPayment(amount: number, description: string) {
    const payment = new Payment(client);
    
    return await payment.create({
      body: {
        transaction_amount: amount,
        description: description,
        payment_method_id: 'pix',
        payer: {
          email: 'cliente@email.com'
        }
      }
    });
  }
}
```

### B. Atualizar PixPayment.tsx
```typescript
// Usar MercadoPagoService em vez de simulação
const pixData = await MercadoPagoService.createPixPayment(price, planName);
```

## 6. Webhook de Confirmação

```typescript
// src/api/webhooks/mercadopago.ts
// Processar notificação de pagamento
```

## 7. Vantagens Mercado Pago

- ✅ Mais popular no Brasil
- ✅ PIX nativo
- ✅ Taxas competitivas
- ✅ Fácil integração
- ✅ Suporte em português




















