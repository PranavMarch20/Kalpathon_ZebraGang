const form = document.getElementById('userForm');
const resultDiv = document.getElementById('result');

function createCard(scheme) {
    return `
        <div class="scheme-card">
            <h3 class="scheme-title">${scheme.name}</h3>
            <div class="scheme-detail">
                <strong>Ministry:</strong> ${scheme.ministry}
            </div>
            <div class="scheme-detail">
                <strong>Description:</strong> ${scheme.description}
            </div>
            <div class="scheme-detail">
                <strong>Benefits:</strong> ${scheme.benefits}
            </div>
            <div class="scheme-detail">
                <strong>Application:</strong> ${scheme.application}
            </div>
            <div class="tags-container">
                ${scheme.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            ${scheme.link ? `<a href="${scheme.link}" target="_blank" class="application-link">Apply Now</a>` : ''}
        </div>
    `;
}

function parseResponse(text) {
    const schemes = [];
    const schemeBlocks = text.split(/(?=\n- Scheme Name:)/g);
    
    for (const block of schemeBlocks) {
        const scheme = {
            name: extractValue(block, 'Scheme Name'),
            ministry: extractValue(block, 'Ministry'),
            description: extractValue(block, 'Description'),
            benefits: extractValue(block, 'Benefits'),
            application: extractValue(block, 'Application Process'),
            tags: extractTags(block),
            link: extractLink(block)
        };
        
        if (scheme.name) schemes.push(scheme);
    }
    
    return schemes;
}

function extractValue(text, field) {
    const regex = new RegExp(`${field}: (.*?)(?=\n-|$)`);
    const match = text.match(regex);
    return match ? match[1].trim() : '';
}

function extractTags(text) {
    const tagsMatch = text.match(/Tags: (.*)/);
    return tagsMatch ? tagsMatch[1].split(', ').map(t => t.trim()) : [];
}

function extractLink(text) {
    const linkMatch = text.match(/https?:\/\/[^\s]+/);
    return linkMatch ? linkMatch[0] : null;
}

form.addEventListener('submit', async function(event) {
    event.preventDefault();
    resultDiv.innerHTML = '<div class="loading">Finding suitable schemes...</div>';

    const formData = {
        gender: document.getElementById('gender').value,
        age: document.getElementById('age').value,
        state: document.getElementById('state').value,
        residence: document.getElementById('residence').value,
        caste: document.getElementById('caste').value,
        qualification: document.getElementById('qualification').value
    };

    const prompt = `
    User Details:
    - Gender: ${formData.gender}
    - Age: ${formData.age}
    - State: ${formData.state}
    - Residence: ${formData.residence}
    - Caste: ${formData.caste}
    - Qualification: ${formData.qualification}

    Recommend Indian government schemes in this EXACT format for each scheme:
    - Scheme Name: [Name]
    - Ministry: [Ministry/Department]
    - Description: [1-2 line description]
    - Benefits: [Key benefits]
    - Application Process: [Online/Offline] [Link if available]
    - Tags: [comma-separated tags]

    Provide 3-5 most relevant schemes. Be extremely concise.
    `;

    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAIapNLiVEq59EFs-Pscf4_pq89b8UilaY', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                contents: [{parts: [{text: prompt}]}]
            })
        });

        const data = await response.json();
        const responseText = data.candidates[0].content.parts[0].text;
        const schemes = parseResponse(responseText);
        
        resultDiv.innerHTML = schemes.length > 0 
            ? schemes.map(createCard).join('') 
            : '<p>No schemes found matching your criteria</p>';
        
    } catch (error) {
        console.error(error);
        resultDiv.innerHTML = '<p style="color:red;">Error fetching schemes. Please try again.</p>';
    }
});