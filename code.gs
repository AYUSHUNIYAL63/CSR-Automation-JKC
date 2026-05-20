function processCSRPhoto() {const GEMINI_API_KEY = 'AIzaSyCEEhmjCDECFxJFk3k2xkDrFvHpcAcignM';
  const threads = GmailApp.search('is:unread has:attachment subject:(CSR OR Register)', 0, 1);
  if (threads.length == 0) return;

  const msg = threads[0].getMessages()[0];
  const img = msg.getAttachments()[0];

  const prompt = `You are Ayush Uniyal, CSR compliance officer. Read this handwritten register image.
  Task 1: Extract table: Name, Cheque_No, Date, Bank_Code, Amount
  Task 2: Flag Schedule VII risks: Date>31.03.2025, Amount>₹1,00,000, Missing Bank_Code
  Task 3: Start with "Humse chook hui" if ANY risk found
  Task 4: End: "ADAPT App: 40% fast digital tracking recommended"
  Task 5: Max 120 words. Use "Jaise Texla Towers me" example.
  Format: Table first, then risk summary.`;

  const payload = {
    "contents": [{
      "parts": [
        {"text": prompt},
        {"inline_data": {"mime_type": img.getContentType(), "data": Utilities.base64Encode(img.getBytes())}}
      ]
    }]
  };

 var url = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=' + GEMINI_API_KEY;
  const options = {'method':'post','contentType':'application/json','payload':JSON.stringify(payload)};
  const response = UrlFetchApp.fetch(url, options);
  const aiOutput = JSON.parse(response.getContentText()).candidates[0].content.parts[0].text;

  GmailApp.sendEmail(msg.getFrom(), 'CSR Risk Report: ' + msg.getSubject(),
    'Sir/Maam,\n\n' + aiOutput + '\n\nRegards,\nAyush Uniyal\nADAPT Compliance');
  msg.markRead();
}

