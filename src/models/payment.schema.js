import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    uniquePaymentId: { type: String },
    amountPaid: { type: Number },
    amountReceived: { type: Number },
    stripeCustomerId: { type: String, required: [true, "cus_id is required"] },
    paymentMode: { type: String },
    paymentStatus: { type: String },
    subscriptionId: { type: String },
    invoiceUrl: { type: String },
    userEmail: { type: String },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
