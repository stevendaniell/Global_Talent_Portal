const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:8080/api' // Local Spring Boot Backend
    : '/api'; // Azure App Service or Functions Proxy

async function performSearch() {
    const input = document.getElementById('searchInput').value;
    const resultsGrid = document.getElementById('resultsGrid');
    
    // Add loading state
    resultsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><p>Searching Cosmos DB...</p></div>';
    
    try {
        const queryParams = new URLSearchParams();
        if (input) queryParams.append('skills', input);
        
        // Mocking the call if backend is not running
        let data = [];
        try {
            const response = await fetch(`${API_BASE_URL}/candidates/search?${queryParams.toString()}`);
            if (response.ok) {
                data = await response.json();
            } else {
                throw new Error("Backend not available, using mock data");
            }
        } catch (e) {
            console.warn(e.message);
            // Fallback to mock data for demonstration
            data = mockCandidates.filter(c => 
                !input || c.skills.some(s => s.toLowerCase().includes(input.toLowerCase()))
            );
        }

        resultsGrid.innerHTML = '';
        if (data.length === 0) {
            resultsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-muted);"><i class="fa-solid fa-ghost fa-2x"></i><p>No candidates found matching your skills.</p></div>';
            return;
        }

        data.forEach(candidate => {
            const card = document.createElement('div');
            card.className = 'candidate-card';
            card.innerHTML = `
                <h3>${candidate.fullName}</h3>
                <p style="color: var(--text-muted);"><i class="fa-solid fa-briefcase"></i> ${candidate.title}</p>
                <div class="skills">
                    ${candidate.skills.map(skill => `<span class="skill-badge">${skill}</span>`).join('')}
                </div>
                <button class="btn-secondary" style="width: 100%; margin-top: 1.5rem;" onclick="viewResume('${candidate.resumeUrl}')"><i class="fa-solid fa-file-pdf"></i> View Resume</button>
            `;
            resultsGrid.appendChild(card);
        });

    } catch (error) {
        resultsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #ff5e5e;"><i class="fa-solid fa-triangle-exclamation fa-2x"></i><p>Error searching candidates: ${error.message}</p></div>`;
    }
}

async function handleUpload(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const title = document.getElementById('title').value;
    const skills = document.getElementById('skills').value.split(',').map(s => s.trim());
    const fileInput = document.getElementById('resume');
    const submitBtn = event.target.querySelector('button[type="submit"]');
    
    if (!fileInput.files || fileInput.files.length === 0) {
        alert("Please select a PDF resume to upload.");
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('resume', file);
    

    const candidateData = {
        id: crypto.randomUUID(), // For mock purposes
        fullName,
        title,
        skills
    };
    
    formData.append('candidate', new Blob([JSON.stringify(candidateData)], { type: "application/json" }));

    const originalBtnHtml = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading to Azure Blob Storage & Cosmos DB...';
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/candidates/upload`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert('Resume uploaded successfully!');
            event.target.reset();
            document.getElementById('fileName').innerHTML = '';
        } else {
            throw new Error('Upload failed');
        }
    } catch (error) {
        console.error('Error during upload:', error);
        // Simulate success for UI demo if backend is offline
        setTimeout(() => {
            alert('Upload simulated successfully! (Backend API not reachable)');
            event.target.reset();
            document.getElementById('fileName').innerHTML = '';
            submitBtn.innerHTML = originalBtnHtml;
            submitBtn.disabled = false;
        }, 1500);
        return;
    }

    submitBtn.innerHTML = originalBtnHtml;
    submitBtn.disabled = false;
}

function viewResume(url) {
    if (url) {
        window.open(url, '_blank');
    } else {
        alert('Resume not found or simulated data block.');
    }
}

const mockCandidates = [
    { fullName: "Alan Turing", title: "Pioneer Cloud Architect", skills: ["Cryptography", "Azure", "Mathematics"], resumeUrl: "#" },
    { fullName: "Grace Hopper", title: "Senior Software Engineer", skills: ["Java", "COBOL", "Distributed Systems"], resumeUrl: "#" },
    { fullName: "Tim Berners-Lee", title: "Web Developer", skills: ["HTML", "HTTP", "CERN Networking"], resumeUrl: "#" }
];
