import config from "../config/index.js";
import transporter from "../config/tarnsporter.config.js";

const mailHelper = async (options) => {
  const message = {
    from: config.SENDER_EMAIL,
    to: options.email,
    subject: options.subject,
    text: options.text,
    // html: options.html,
  };

  await transporter.sendMail(message);
};

export default mailHelper;
