// const resetModel = require('../models/reset.model');

import { config } from 'dotenv';
import * as nodemailer from 'nodemailer';
import * as jwt from 'jsonwebtoken';

config();
const sendEmail = async (email: string, data: any) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  // await resetModel.add(info);

  const token = jwt.sign(
    {
      data: { email },
    },
    process.env.SECRET_KEY,
    { expiresIn: '1d' },
  );

  const redirect_url = `${process.env.WEB_URL}/auth/reset?token=${token}`;

  let text = '';
  text += `<h2>Reset Your Password</h2>
  To change your password, please use the this link:<br>
  ${redirect_url}<br>
  This link will expire in <b>1 day</b> after this email was sent.<br>
  Do not share this link with anyone. We takes your account security very
  seriously.<br>
  
  We hope to see you again soon.`;

  const mailOptions = {
    from: process.env.GMAIL_EMAIL,
    to: email,
    subject: 'Virtual Conference - Reset Password',
    html: text,
  };

  transporter.sendMail(mailOptions, function (err: any, data: any) {
    console.log(err);
  });
};

export default sendEmail;
