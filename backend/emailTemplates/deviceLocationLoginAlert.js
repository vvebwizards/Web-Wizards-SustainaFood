const deviceLocationLoginAlert = (
    fullName,
    device,
    browser,
    os
  ) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login Alert</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background-color: white;
          padding: 20px;
          border-radius: 5px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1, p {
          margin: 0;
        }
        a {
          display: inline-block;
          margin-top: 20px;
          padding: 10px 20px;
          background-color: black;
          color: white;
          text-decoration: none;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Hello ${fullName},</h1>
        <p>We detected a login to your account from a new device:</p>
        <p><strong>Device:</strong> ${device}<br>
        <strong>Browser:</strong> ${browser}<br>
        <strong>Operating System:</strong> ${os}</p>
        <p>And from a new location:</p>
        <p>If this was you, no action is required. If it wasn't you, please change your password immediately.</p>
        <p>Best regards.</p>
      </div>
    </body>
    </html>
  `;

export default deviceLocationLoginAlert;

  