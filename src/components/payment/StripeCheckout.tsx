import React from 'react';

interface StripeCheckoutProps {
  planId: string;
  planName: string;
  price: number;
  type: string;
  features?: string[];
}

function StripeCheckout(props: StripeCheckoutProps) {
  return (
    <div>
      <h3>Stripe Checkout - {props.planName}</h3>
      <p>Preço: R$ {props.price}</p>
      <button>Assinar Agora</button>
    </div>
  );
}

export default StripeCheckout;