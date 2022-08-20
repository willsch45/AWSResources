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

//Structure of output:
/*
    {
        prompt: emailString,
        rawInput: ,
        instructions: instructions,
        taskTags: taskTags
    }
*/

//Create a function that converts the email object into a string for summary
function convertEmailToSummaryInput(email) {
    const instructions = '**Instruction: Summarize the following email for the recipient**';
    const taskTags = ['Summarize', 'Communication'];
    let emailString = '';
    let rawInput = '';

    //add the email headers to the string
    rawInput += `From: ${email.headers.from}\n`;
    rawInput += `To: ${email.headers.to}\n`;
    //emailString += `Date: ${email.headers.date}\n`;
    rawInput += `Subject: ${email.headers.subject}\n`;

    rawInput += '\n *EMAIL BODY:* \n';

    //add the email body to the string
    rawInput += `\n${email.bodyAbbreviated.plainTextAbv}`;

    //create a string to store the email
    emailString = instructions + '\n' + '**Task tags: ';//Adding instructions

    for (let i = 0; i < taskTags.length; i++){
        //If the last tag in the array, don't add ' | ' after the tag, otherwise add ' | '
        if (i === taskTags.length - 1) {
            emailString += taskTags[i];
        } else {
            emailString += taskTags[i] + ' | ';
        }
    }

    emailString += '** \n------\n';
    emailString += rawInput;

    return {
        id: '',
        prompt: emailString,
        rawInput: rawInput,
        instructions: instructions,
        taskTags: taskTags
    };
}

module.exports = { 
    convertEmailToSummaryInput,
};