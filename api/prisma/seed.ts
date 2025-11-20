import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { uuidv7 } from 'uuidv7';

const prisma = new PrismaClient();

// ============================================
// SISTEMA: STRIPE
// ============================================
class StripeWebhookSimulator {
  static eventConfigs = [
    { name: 'payment_intent.succeeded', weight: 25, generatePayload: () => ({
      id: `pi_${faker.string.alphanumeric(24)}`,
      object: 'payment_intent',
      amount: faker.number.int({ min: 1000, max: 100000 }),
      currency: faker.helpers.arrayElement(['usd', 'brl', 'eur']),
      status: 'succeeded',
      customer: `cus_${faker.string.alphanumeric(14)}`,
      payment_method: `pm_${faker.string.alphanumeric(24)}`,
      metadata: { order_id: faker.string.uuid() },
    })},
    { name: 'customer.subscription.created', weight: 15, generatePayload: () => ({
      id: `sub_${faker.string.alphanumeric(14)}`,
      object: 'subscription',
      customer: `cus_${faker.string.alphanumeric(14)}`,
      status: 'active',
      plan: {
        amount: faker.number.int({ min: 990, max: 29900 }),
        interval: faker.helpers.arrayElement(['month', 'year']),
      },
    })},
    { name: 'invoice.payment_succeeded', weight: 20, generatePayload: () => ({
      id: `in_${faker.string.alphanumeric(24)}`,
      amount_paid: faker.number.int({ min: 1000, max: 50000 }),
      status: 'paid',
      customer: `cus_${faker.string.alphanumeric(14)}`,
    })},
  ];

  static generate() {
    const event = faker.helpers.weightedArrayElement(this.eventConfigs.map(e => ({ weight: e.weight, value: e })));
    const body = {
      id: `evt_${faker.string.alphanumeric(24)}`,
      type: event.name,
      data: { object: event.generatePayload() },
      created: Math.floor(Date.now() / 1000),
    };

    return {
      method: 'POST',
      pathname: '/webhooks/stripe',
      headers: {
        'stripe-signature': `t=${Date.now()},v1=${faker.string.hexadecimal({ length: 64, prefix: '' })}`,
        'user-agent': 'Stripe/1.0 (+https://stripe.com/docs/webhooks)',
      },
      body: JSON.stringify(body, null, 2),
    };
  }
}

// ============================================
// SISTEMA: MERCADO PAGO
// ============================================
class MercadoPagoWebhookSimulator {
  static eventConfigs = [
    { name: 'payment', weight: 40, generatePayload: () => ({
      id: faker.number.int({ min: 10000000, max: 99999999 }),
      status: faker.helpers.arrayElement(['approved', 'pending', 'rejected']),
      status_detail: 'accredited',
      transaction_amount: faker.number.float({ min: 10, max: 5000, fractionDigits: 2 }),
      currency_id: 'BRL',
      payer: {
        email: faker.internet.email(),
        identification: {
          type: 'CPF',
          number: faker.string.numeric(11),
        },
      },
    })},
    { name: 'merchant_order', weight: 20, generatePayload: () => ({
      id: faker.number.int({ min: 1000000, max: 9999999 }),
      status: 'closed',
      total_amount: faker.number.float({ min: 10, max: 5000, fractionDigits: 2 }),
    })},
  ];

  static generate() {
    const event = faker.helpers.weightedArrayElement(this.eventConfigs.map(e => ({ weight: e.weight, value: e })));
    const body = {
      id: faker.number.int({ min: 10000000, max: 99999999 }),
      action: event.name,
      api_version: 'v1',
      type: event.name,
      data: { id: faker.number.int({ min: 10000000, max: 99999999 }) },
      date_created: new Date().toISOString(),
      user_id: faker.number.int({ min: 100000, max: 999999 }),
    };

    return {
      method: 'POST',
      pathname: '/webhooks/mercadopago',
      headers: {
        'x-signature': faker.string.hexadecimal({ length: 64, prefix: '' }),
        'x-request-id': faker.string.uuid(),
        'user-agent': 'MercadoPago SDK',
      },
      body: JSON.stringify(body, null, 2),
    };
  }
}

// ============================================
// SISTEMA: GITHUB
// ============================================
class GitHubWebhookSimulator {
  static eventConfigs = [
    { name: 'push', weight: 30, generatePayload: () => ({
      ref: 'refs/heads/main',
      repository: {
        name: faker.lorem.word(),
        full_name: `${faker.internet.username()}/${faker.lorem.word()}`,
      },
      pusher: { name: faker.person.fullName(), email: faker.internet.email() },
      commits: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
        id: faker.git.commitSha(),
        message: faker.git.commitMessage(),
        author: { name: faker.person.fullName() },
      })),
    })},
    { name: 'pull_request', weight: 25, generatePayload: () => ({
      action: faker.helpers.arrayElement(['opened', 'closed', 'merged']),
      number: faker.number.int({ min: 1, max: 500 }),
      pull_request: {
        title: faker.lorem.sentence(),
        state: faker.helpers.arrayElement(['open', 'closed']),
        user: { login: faker.internet.username() },
      },
    })},
    { name: 'issues', weight: 15, generatePayload: () => ({
      action: faker.helpers.arrayElement(['opened', 'closed', 'reopened']),
      issue: {
        number: faker.number.int({ min: 1, max: 1000 }),
        title: faker.lorem.sentence(),
        state: 'open',
      },
    })},
  ];

  static generate() {
    const event = faker.helpers.weightedArrayElement(this.eventConfigs.map(e => ({ weight: e.weight, value: e })));
    const body = event.generatePayload();

    return {
      method: 'POST',
      pathname: '/webhooks/github',
      headers: {
        'x-github-event': event.name,
        'x-github-delivery': faker.string.uuid(),
        'x-hub-signature-256': `sha256=${faker.string.hexadecimal({ length: 64, prefix: '' })}`,
        'user-agent': 'GitHub-Hookshot/abc123',
      },
      body: JSON.stringify(body, null, 2),
    };
  }
}

// ============================================
// SISTEMA: SHOPIFY
// ============================================
class ShopifyWebhookSimulator {
  static eventConfigs = [
    { name: 'orders/create', weight: 35, generatePayload: () => ({
      id: faker.number.int({ min: 1000000000000, max: 9999999999999 }),
      email: faker.internet.email(),
      total_price: faker.number.float({ min: 10, max: 1000, fractionDigits: 2 }),
      currency: 'USD',
      line_items: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
        title: faker.commerce.productName(),
        quantity: faker.number.int({ min: 1, max: 5 }),
        price: faker.commerce.price(),
      })),
    })},
    { name: 'orders/paid', weight: 30, generatePayload: () => ({
      id: faker.number.int({ min: 1000000000000, max: 9999999999999 }),
      financial_status: 'paid',
      total_price: faker.commerce.price(),
    })},
    { name: 'customers/create', weight: 15, generatePayload: () => ({
      id: faker.number.int({ min: 1000000000000, max: 9999999999999 }),
      email: faker.internet.email(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
    })},
  ];

  static generate() {
    const event = faker.helpers.weightedArrayElement(this.eventConfigs.map(e => ({ weight: e.weight, value: e })));
    const body = event.generatePayload();

    return {
      method: 'POST',
      pathname: '/webhooks/shopify',
      headers: {
        'x-shopify-topic': event.name,
        'x-shopify-hmac-sha256': faker.string.hexadecimal({ length: 64, prefix: '' }),
        'x-shopify-shop-domain': `${faker.internet.domainWord()}.myshopify.com`,
        'user-agent': 'Shopify-Captain-Hook',
      },
      body: JSON.stringify(body, null, 2),
    };
  }
}

// ============================================
// SISTEMA: TWILIO
// ============================================
class TwilioWebhookSimulator {
  static eventConfigs = [
    { name: 'message.received', weight: 40, generatePayload: () => ({
      MessageSid: `SM${faker.string.alphanumeric(32)}`,
      From: faker.phone.number('+55119########'),
      To: faker.phone.number('+55119########'),
      Body: faker.lorem.sentence(),
      NumMedia: '0',
    })},
    { name: 'call.completed', weight: 25, generatePayload: () => ({
      CallSid: `CA${faker.string.alphanumeric(32)}`,
      From: faker.phone.number('+55119########'),
      To: faker.phone.number('+55119########'),
      CallStatus: 'completed',
      CallDuration: faker.number.int({ min: 10, max: 600 }),
    })},
  ];

  static generate() {
    const event = faker.helpers.weightedArrayElement(this.eventConfigs.map(e => ({ weight: e.weight, value: e })));
    const payload = event.generatePayload();
    
    // Twilio envia como form-urlencoded
    const body = new URLSearchParams(payload as any).toString();

    return {
      method: 'POST',
      pathname: '/webhooks/twilio',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'x-twilio-signature': faker.string.hexadecimal({ length: 44, prefix: '' }),
        'user-agent': 'TwilioProxy/1.1',
      },
      body,
    };
  }
}

// ============================================
// ORQUESTRADOR
// ============================================
const SYSTEMS = {
  stripe: StripeWebhookSimulator,
  mercadopago: MercadoPagoWebhookSimulator,
  github: GitHubWebhookSimulator,
  shopify: ShopifyWebhookSimulator,
  twilio: TwilioWebhookSimulator,
};

async function generateWebhooks(system: keyof typeof SYSTEMS, count: number = 60) {
  console.log(`🚀 Gerando ${count} webhooks do ${system.toUpperCase()}...`);

  const Simulator = SYSTEMS[system];
  const webhooksData = Array.from({ length: count }).map(() => {
    const webhook = Simulator.generate();
    return {
      id: uuidv7(),
      method: webhook.method,
      pathname: webhook.pathname,
      ip: faker.internet.ipv4(),
      statusCode: faker.helpers.weightedArrayElement([
        { weight: 90, value: 200 },
        { weight: 5, value: 400 },
        { weight: 5, value: 500 },
      ]),
      contentType: webhook.headers['content-type'] || 'application/json',
      contentLength: Buffer.byteLength(webhook.body, 'utf8'),
      queryParams: {},
      headers: webhook.headers,
      body: webhook.body,
      createdAt: faker.date.recent({ days: 30 }),
    };
  });

  await prisma.webhooks.createMany({ data: webhooksData });
  console.log(`✅ ${count} webhooks do ${system} criados com sucesso!`);
}

async function main() {
  // Escolha o sistema aqui
  const system = 'github'; // stripe | mercadopago | github | shopify | twilio
  
  await generateWebhooks(system, 10);
  
  // Ou gere múltiplos sistemas:
  // await generateWebhooks('stripe', 20);
  // await generateWebhooks('github', 20);
  // await generateWebhooks('shopify', 20);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });