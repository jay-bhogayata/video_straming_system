import config from "../config/index.js";
import stripe from "stripe";

const stripeInstance = stripe(config.STRIPE_kEY);

export default stripeInstance;
