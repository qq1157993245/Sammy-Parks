export function htmlContent(time: string, fine: string, reason: string) {
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
        <h2>Parking Violation Ticket</h2>
        <p><strong>Issued At:</strong> ${formatDateTime(time)}</p>
        <p><strong>Violation:</strong> ${reason}</p>
        <p><strong>Fine:</strong> $${fine}</p>
        <br/>
        <p>Please log in your account and pay the ticket.</p>
        <p>— Sammy Parks Enforcement Team</p>
      </body>
    </html>
  `;
}