document.getElementById('contactForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        parentName: document.getElementById('parentName').value,
        childName: document.getElementById('childName').value,
        childAge: document.getElementById('childAge').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        therapy: document.getElementById('therapy').value,
        message: document.getElementById('message').value
    };

    try {
        const res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const data = await res.json();
        
        if(data.success) {
            alert(data.message);
            document.getElementById('contactForm').reset();
        }
    } catch (error) {
        alert('An error occurred. Please try again.');
    }
});