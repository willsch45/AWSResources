//Structure of email input

// const email = {
//     id: '',
//     threadID: '',
//     labels: [],
//     snippet: '',
//     headers: {
//         from: '',
//         to: '',
//         date: '',
//         subject: '',
//     },
//     bodyFull: {
//         htmlText: '',
//         plainText: '',
//     },
//     bodyAbbreviated: {
//         htmlTextAbv: '',
//         plainTextAbv: '',
//     }
// };

//Create a function that converts the email object into a string for summary
function convertEmailToSummaryInput(email) {
    //create a string to store the email
    let emailString = 'Summarize the following email for the recipient: \n\n ----- \n';

    //add the email headers to the string
    emailString += `From: ${email.headers.from}\n`;
    emailString += `To: ${email.headers.to}\n`;
    //emailString += `Date: ${email.headers.date}\n`;
    emailString += `Subject: ${email.headers.subject}\n`;

    emailString += '\n *EMAIL BODY:* \n';

    //add the email body to the string
    emailString += `\n${email.bodyAbbreviated.plainTextAbv}`;

    return emailString;
}

module.exports = { 
    convertEmailToSummaryInput,
};