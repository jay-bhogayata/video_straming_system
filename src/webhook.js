// webhook.js

import express from "express";
import stripeInstance from "./utils/stripeInstance.js";
import config from "./config/index.js";
import User from "./models/user.schema.js";
import Payment from "./models/payment.schema.js";
import CustomError from "./utils/CustomError.js";
import mailHelper from "./utils/mailHelper.js";

const webhookRouter = express.Router();

export const cookieOptions = {
  expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  httpOnly: true,
};

webhookRouter.post(
  "/myhook",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    const sig = request.headers["stripe-signature"];

    let event;
    try {
      event = stripeInstance.webhooks.constructEvent(
        request.body,
        sig,
        config.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
    const myUserEmail = "";
    // console.log(event.type);
    switch (event.type) {
      case "payment_intent.succeeded": {
        // console.log(event.type);
        // console.log(event.data.object?.id);
      }
      case "customer.subscription.deleted": {
        // console.log(event.type);
        // console.log(event.data.object?.customer);
        const stripeCustomerId = event.data.object?.customer;
        // console.log(event.data.object?.status);
        const paymentCen = await Payment.findOne({
          stripeCustomerId: event.data.object?.customer,
        });
        if (paymentCen) {
          const updatePayment = await Payment.findOneAndUpdate(
            { stripeCustomerId: stripeCustomerId },
            {
              paymentStatus: event.data.object?.status,
            }
          );
          // console.log(updatePayment);
        }
        const user = await User.findOne({
          stripeCustomerId: event.data.object?.customer,
        });
        if (event.data.object?.status === "canceled") {
          user.subscribed = false;
          await user.save();
        }
        const userAtEnd = await User.findOne({
          stripeCustomerId: stripeCustomerId,
        });
      }
      case "customer.subscription.created": {
        let amount = event.data.object?.amount;
        let amountReceived = event.data.object?.amount_received;
        let stripeCustomerId = event.data.object?.customer;
        let desc = event.data.object?.description;
        let paymentMode = event.data.object?.payment_method_types?.[0];
        let paymentStatus = event.data.object?.status;

        const payment = await Payment.findOne({ stripeCustomerId });
        if (payment) {
          const updatePayment = await Payment.findOneAndUpdate(
            { stripeCustomerId: stripeCustomerId },
            {
              amountPaid: amount,
              amountReceived: amountReceived,
              paymentMode: paymentMode,
              paymentStatus: paymentStatus,
            }
          );
          // console.log(updatePayment);
        }
        const user = await User.findOne({ stripeCustomerId: stripeCustomerId });
        // console.log(user);
        if (paymentStatus === "succeeded") {
          user.subscribed = true;
          await user.save();
        }
        const userAtEnd = await User.findOne({
          stripeCustomerId: stripeCustomerId,
        });
        // console.log(userAtEnd);
      }
      case "invoice.payment_succeeded": {
      }
      case "invoice.paid": {
        const status = event?.data?.object?.status;

        console.log("-------------------------");
        console.log(status);
        // console.log(event.data.object);
        // console.log(event.data.object.customer);
        const user = await Payment.findOne({
          stripeCustomerId: event?.data?.object?.customer,
        });
        const userEmail = await User.findOne({
          stripeCustomerId: event?.data?.object?.customer,
        });
        // console.log(userEmail.email);
        // console.log(user);
        // console.log(user?.invoiceUrl);
        console.log("-------------------------");

        if (status === "succeeded") {
          console.log("----------final---------------");

          console.log(event.data.object);

          const message = `your payment for streamMax has been ${status}. 
          
          
          please check your invoice ${user.invoiceUrl} for more details.
          
          
          you can also download your invoice from here ${user.invoiceUrl}`;
          console.log(message);
          console.log("------------final-------------");

          try {
            await mailHelper({
              email: userEmail.email,
              subject: "payment success for streamMax",
              text: message,
            });
          } catch (error) {
            throw new CustomError(error.message || "email not been sent", 500);
          }
        }
      }
    }

    response.json({
      success: true,
    });
  }
);

export default webhookRouter;
