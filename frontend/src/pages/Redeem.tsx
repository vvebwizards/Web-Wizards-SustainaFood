import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const Redeem = () => {
  const handleApprove = (data: any, actions: any) => {
    return actions.order.capture().then((details: any) => {
      alert(`Transaction completed by ${details.payer.name.given_name}`);
    });
  };

  return (
    <PayPalScriptProvider
      options={{
        "client-id": "ATZqDax8mfDXSmDVdZMqTOQzuzMwOuFikYKGdFa7Z4zP3HPZDNK2O2qr4DsnjBZdluqbMbmumjyqGd6z",
        currency: "USD",
      }}
    >
      <div>
        <h1>Redeem Funds</h1>
        <p>Click the button below to redeem $10 from your Business Account to your Personal Account.</p>
        <PayPalButtons
          createOrder={(data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: "10.00", // Static amount to transfer
                  },
                  payee: {
                    email_address: "sb-hvxrn41241501@personal.example.com", // Personal Account email
                  },
                },
              ],
            });
          }}
          onApprove={handleApprove}
        />
      </div>
    </PayPalScriptProvider>
  );
};

export default Redeem;