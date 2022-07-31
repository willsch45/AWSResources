const AWS = require("aws-sdk");
const { authenticateGoogle } = require("./middleware/authentication/gmailAuthentication");
// const { getGMailHeaders } = require("./middleware/emailFetchers/fetchGmailHeaders");
const { getGMailContent } = require("./middleware/emailFetchers/fetchGmailFullContent");

const exampleMessagesArr = [
  {
    "id": "1824fd7318741b20",
    "threadID": "1824fd7318741b20",
    "from": "Rentmoola Operations <ops@rentmoola.com>",
    "to": "Rentmoola Operations <ops@rentmoola.com>",
    "date": "Sat, 30 Jul 2022 09:00:00 -0700",
    "subject": "Update Your Payment Method(s) on letus",
    "snippet": "Dear letus User, In keeping with standard maintenance procedures to protect your personal and payment information, we have reset payment methods saved in letus. If you have previously created payment",
    "labels": [
      "IMPORTANT",
      "CATEGORY_PERSONAL",
      "INBOX"
    ]
  },
  {
    "id": "1824f18e7307342f",
    "threadID": "18247539c6a598e1",
    "from": "Justin Jensen <justin@orum.com>",
    "to": "William Schober <william@flanagan-schober.com>",
    "date": "Sat, 30 Jul 2022 06:33:17 -0600",
    "subject": "Re: Thanks for the conversation!",
    "snippet": "Totally cool, thank you! Justin Jensen Recruiter, Orum Cell: 323-608-3215 Follow me on LinkedIn On Sat, Jul 30, 2022 at 3:15 AM William Schober &lt;william@flanagan-schober.com&gt; wrote: Hey Justin, I",
    "labels": [
      "IMPORTANT",
      "CATEGORY_PERSONAL",
      "INBOX"
    ]
  },
  {
    "id": "1824e635484745b4",
    "threadID": "18247539c6a598e1",
    "from": "William Schober <william@flanagan-schober.com>",
    "to": "Justin Jensen <justin@orum.com>",
    "date": "Sat, 30 Jul 2022 16:15:10 +0700",
    "subject": "Re: Thanks for the conversation!",
    "snippet": "Hey Justin, I took a look at the review and I will be happy to provide feedback on it. That said, some of the form can only be filled out at the end of the process. If it's alright with you, I am",
    "labels": [
      "SENT"
    ]
  }
]; 

const gmail = authenticateGoogle();

//print content from getGMailContent by passing through gmail and exampleMessagesArr using a then function
getGMailContent(gmail, exampleMessagesArr).then(data => {
  console.log(data)
}).catch(err => {
  console.log(err)
});