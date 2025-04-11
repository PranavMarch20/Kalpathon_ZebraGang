const form = document.getElementById('userForm');
const resultDiv = document.getElementById('result');

form.addEventListener('submit', async function(event) {
    event.preventDefault();

    const gender = document.getElementById('gender').value;
    const age = document.getElementById('age').value;
    const state = document.getElementById('state').value;
    const residence = document.getElementById('residence').value;
    const caste = document.getElementById('caste').value;
    const qualification = document.getElementById('qualification').value;

    const userInput = `
    User Details:
    Gender: ${gender}
    Age: ${age}
    State: ${state}
    Residence: ${residence}
    Caste: ${caste}
    Qualifications: ${qualification}
    
    Based on these details, recommend suitable Government Schemes in India. Give 
    - scheme name
    - related government body / ministry under which it comes
    - scheme description
    - benefits of scheme 
    application process (online/offline, if online provide link to apply)
    - tags like (commerce, internship, scholarship, research, agriculture, finance, student)  

    `;

    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAIapNLiVEq59EFs-Pscf4_pq89b8UilaY', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: userInput
                    }]
                }]
            })
        });

        const data = await response.json();
        const resultText = data.candidates[0].content.parts[0].text;

        resultDiv.innerHTML = `<h3>Recommended Schemes:</h3><p>${resultText.replace(/\n/g, '<br>')}</p>`;
    } catch (error) {
        console.error(error);
        resultDiv.innerHTML = '<p style="color:red;">Error fetching schemes. Please try again later.</p>';
    }
});