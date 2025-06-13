export function htmlContent(plate: string, startTime: string, endTime: string, price: string, zone: string) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} ${hours}:${minutes} ${ampm}`;
  };

  return `
    <html>
      <body>
        <h2>Permit Receipt</h2>
        <p><strong>Zone:</strong> ${zone}</p>
        <p><strong>Plate:</strong> ${plate}</p>
        <p><strong>Valid From:</strong> ${formatDateTime(startTime)}</p>
        <p><strong>Expires:</strong> ${formatDateTime(endTime)}</p>
        <p><strong>Total Paid:</strong> $${price}</p>
        <br/>
        <p>Thank you for using Sammy Parks!</p>
      </body>
    </html>
  `;
}
