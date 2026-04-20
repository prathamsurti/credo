import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendQuotationEmail = async (orderData: any, userEmail: string) => {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  
  const htmlContent = `
    <h2>New Quotation/Order #${orderData.orderNumber}</h2>
    <p>A new order quotation has been generated!</p>
    <h3>Order Summary:</h3>
    <ul>
      ${orderData.items.map((item: any) => `<li>${item.productName} (x${item.quantity}) - ₹${item.priceAtTime * item.quantity}</li>`).join('')}
    </ul>
    <p><strong>Total Amount: ₹${orderData.totalAmount}</strong></p>
  `;

  // Email to Admin
  await transporter.sendMail({
    from: `"Credo Store" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: `New Quotation/Order Received - #${orderData.orderNumber}`,
    html: htmlContent,
  });

  // Email to Customer
  if (userEmail) {
    await transporter.sendMail({
      from: `"Credo Store" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: `Your Credo Quotation/Order - #${orderData.orderNumber}`,
      html: htmlContent,
    });
  }
};
