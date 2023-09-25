import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import router from "./routes/index.js";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import stripeInstance from "./utils/stripeInstance.js";
import webhookRouter from "./webhook.js";
import Payment from "./models/payment.schema.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use("/webhook", webhookRouter);
app.use(morgan("dev"));
app.use(express.json());
app.use(bodyParser.json());
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/v1", router);

app.use("/api/v1", router);

app.get("/health", (req, res) => {
  res.status(200);
  res.json({
    message: "backend is working fine...",
  });
});

app.post("/create-customer", async (req, res) => {
  const { priceId, customerId } = req.body;

  try {
    const subscription = await stripeInstance.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: priceId,
        },
      ],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    });
    console.log(subscription.items.data[0].subscription);
    console.log(subscription.latest_invoice.hosted_invoice_url);
    const invoiceUrl = subscription.latest_invoice.hosted_invoice_url;
    const mail = subscription.latest_invoice.customer_email;
    const subId = subscription.items.data[0].subscription;
    const payment = await Payment.create({
      userEmail: mail,
      invoiceUrl: invoiceUrl,
      uniquePaymentId: subId,
      stripeCustomerId: customerId,
    });
    console.log(payment);
    res.status(200).json({
      success: true,
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    });
  } catch (error) {
    return res.status(400).send({ error: { message: error.message } });
  }
});

// if no route is matched by now, it must be a 404
app.all("*", (_req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

export default app;

// https://invoice.stripe.com/i/acct_1LEq0RSJLlvkZdce/test_YWNjdF8xTEVxMFJTSkxsdmtaZGNlLF9PZVlLeERLZnpZTTBTUXA5UW16ZGpTOXhFYklRNzhiLDg1NDc1ODE20200cTWuoTny?s=ap
// https://pay.stripe.com/invoice/acct_1LEq0RSJLlvkZdce/test_YWNjdF8xTEVxMFJTSkxsdmtaZGNlLF9PZVlLeERLZnpZTTBTUXA5UW16ZGpTOXhFYklRNzhiLDg1NDc1ODE20200cTWuoTny/pdf?s=ap
