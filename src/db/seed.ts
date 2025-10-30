import { db } from '.'
import { webhooks } from './schema'

// Função para gerar dados de webhook do Stripe
function generateStripeWebhook(
  eventType: string,
  eventId: string,
  dataObject: Record<string, unknown>,
  statusCode = 200,
) {
  const stripeIps = [
    '54.187.174.169',
    '54.187.205.235',
    '54.187.216.72',
    '54.241.31.99',
    '54.241.31.102',
  ]

  const body = JSON.stringify({
    id: eventId,
    object: 'event',
    api_version: '2020-08-27',
    created: Math.floor(Date.now() / 1000),
    type: eventType,
    livemode: false,
    pending_webhooks: 1,
    request: {
      id: `req_${Math.random().toString(36).substr(2, 9)}`,
      idempotency_key: null,
    },
    data: {
      object: dataObject,
    },
  })

  return {
    method: 'POST',
    pathname: '/api/stripe/webhook',
    ip: stripeIps[Math.floor(Math.random() * stripeIps.length)],
    statusCode,
    contentType: 'application/json',
    contentLength: Buffer.byteLength(body),
    queryParams: {},
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Stripe/1.0 (+https://stripe.com/docs/webhooks)',
      'Stripe-Signature': `t=${Math.floor(Date.now() / 1000)},v1=${Math.random().toString(36).substr(2, 64)}`,
      Accept: '*/*',
      'Accept-Encoding': 'gzip',
      'X-Stripe-Client-User-Agent':
        '{"bindings_version":"8.219.0","lang":"ruby","lang_version":"3.0.0","platform":"x86_64-linux","engine":"ruby","publisher":"stripe","uname":"Linux version 5.4.0","hostname":"ip-10-12-34-56"}',
    },
    body,
  }
}

async function seed() {
  console.log('Seeding database...')

  // Limpar dados existentes
  await db.delete(webhooks)

  // Gerar 60 webhooks do Stripe com diferentes tipos de eventos
  const stripeWebhooks = []

  // Payment Intent Events (20 webhooks)
  for (let i = 1; i <= 20; i++) {
    const amount = Math.floor(Math.random() * 50000) + 500 // $5.00 to $500.00
    const currency = ['usd', 'eur', 'brl'][Math.floor(Math.random() * 3)]

    if (i <= 15) {
      // payment_intent.succeeded
      stripeWebhooks.push(
        generateStripeWebhook(
          'payment_intent.succeeded',
          `evt_${Math.random().toString(36).substr(2, 24)}`,
          {
            id: `pi_${Math.random().toString(36).substr(2, 24)}`,
            object: 'payment_intent',
            amount,
            currency,
            status: 'succeeded',
            payment_method: `pm_${Math.random().toString(36).substr(2, 24)}`,
            customer: `cus_${Math.random().toString(36).substr(2, 14)}`,
            description: `Payment for order #${1000 + i}`,
            metadata: {
              order_id: `${1000 + i}`,
              customer_email: `customer${i}@example.com`,
            },
          },
        ),
      )
    } else {
      // payment_intent.payment_failed
      stripeWebhooks.push(
        generateStripeWebhook(
          'payment_intent.payment_failed',
          `evt_${Math.random().toString(36).substr(2, 24)}`,
          {
            id: `pi_${Math.random().toString(36).substr(2, 24)}`,
            object: 'payment_intent',
            amount,
            currency,
            status: 'requires_payment_method',
            last_payment_error: {
              code: 'card_declined',
              decline_code: 'generic_decline',
              message: 'Your card was declined.',
            },
            customer: `cus_${Math.random().toString(36).substr(2, 14)}`,
            description: `Failed payment for order #${1000 + i}`,
          },
        ),
      )
    }
  }

  // Customer Events (15 webhooks)
  for (let i = 1; i <= 15; i++) {
    const eventTypes = [
      'customer.created',
      'customer.updated',
      'customer.deleted',
    ]
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]

    stripeWebhooks.push(
      generateStripeWebhook(
        eventType,
        `evt_${Math.random().toString(36).substr(2, 24)}`,
        {
          id: `cus_${Math.random().toString(36).substr(2, 14)}`,
          object: 'customer',
          email: `customer${i}@example.com`,
          name: `Customer ${i}`,
          phone: `+1555000${String(i).padStart(4, '0')}`,
          created:
            Math.floor(Date.now() / 1000) -
            Math.floor(Math.random() * 86400 * 30),
          metadata: {
            user_id: `user_${i}`,
          },
        },
      ),
    )
  }

  // Invoice Events (15 webhooks)
  for (let i = 1; i <= 15; i++) {
    const amount = Math.floor(Math.random() * 10000) + 1000 // $10.00 to $100.00
    const eventTypes = [
      'invoice.payment_succeeded',
      'invoice.payment_failed',
      'invoice.finalized',
    ]
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]

    stripeWebhooks.push(
      generateStripeWebhook(
        eventType,
        `evt_${Math.random().toString(36).substr(2, 24)}`,
        {
          id: `in_${Math.random().toString(36).substr(2, 24)}`,
          object: 'invoice',
          amount_due: amount,
          amount_paid: eventType === 'invoice.payment_succeeded' ? amount : 0,
          currency: 'usd',
          customer: `cus_${Math.random().toString(36).substr(2, 14)}`,
          status:
            eventType === 'invoice.payment_succeeded'
              ? 'paid'
              : eventType === 'invoice.payment_failed'
                ? 'open'
                : 'draft',
          subscription: `sub_${Math.random().toString(36).substr(2, 14)}`,
          period_start: Math.floor(Date.now() / 1000) - 86400 * 30,
          period_end: Math.floor(Date.now() / 1000),
        },
      ),
    )
  }

  // Subscription Events (10 webhooks)
  for (let i = 1; i <= 10; i++) {
    const eventTypes = [
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
    ]
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]

    stripeWebhooks.push(
      generateStripeWebhook(
        eventType,
        `evt_${Math.random().toString(36).substr(2, 24)}`,
        {
          id: `sub_${Math.random().toString(36).substr(2, 14)}`,
          object: 'subscription',
          customer: `cus_${Math.random().toString(36).substr(2, 14)}`,
          status:
            eventType === 'customer.subscription.deleted'
              ? 'canceled'
              : 'active',
          current_period_start: Math.floor(Date.now() / 1000) - 86400 * 30,
          current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30,
          plan: {
            id: `plan_${Math.random().toString(36).substr(2, 14)}`,
            amount: Math.floor(Math.random() * 5000) + 1000,
            currency: 'usd',
            interval: 'month',
          },
        },
      ),
    )
  }

  // Inserir todos os webhooks
  await db.insert(webhooks).values(stripeWebhooks)

  console.log('✅ Database seeded successfully!')
  console.log('📊 Inserted 60 Stripe webhook records')
}

seed()
  .catch((error) => {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
